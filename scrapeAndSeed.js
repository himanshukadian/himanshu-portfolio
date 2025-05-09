const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

const API_URL = 'http://localhost:5000/api/articles'; // Change if needed
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWNkYzYyNjllZjViY2RkMjQ0MjgzYiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjczODcyNiwiZXhwIjoxNzQ2ODI1MTI2fQ.n9rkawqr4qeOKPeQYePtfq3IeMGjm87nBVDQGN7fVWk'; // <-- Replace with your real token

async function main() {
  // Fetch articles from dev.to RSS feed
  const feed = await parser.parseURL('https://dev.to/feed');
  const articles = feed.items.slice(0, 30); // Get first 30 articles

  for (let i = 0; i < articles.length; i++) {
    const item = articles[i];
    const title = item.title;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + i;
    const type = 'Technical';
    const tags = item.categories ? item.categories.slice(0, 3) : ['Programming'];
    const author = item.creator || item.author || 'Unknown';
    // Use content:encoded if available, otherwise content or summary
    const content = item['content:encoded'] || item.content || item.summary || '';

    try {
      const res = await axios.post(API_URL, {
        title,
        slug,
        type,
        tags,
        author,
        content
      }, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Created article ${i + 1}: ${title}`);
    } catch (err) {
      console.error(`Failed to create article ${i + 1}:`, err.response?.data || err.message);
    }
  }
}

main(); 
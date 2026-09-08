import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

const ARTICLES_URL =
  (process.env.REACT_APP_BACKEND_URL || "https://himanshu-portfolio-api-e10b4543a453.herokuapp.com") +
  "/api/articles";

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function toPlainText(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadingTime(article) {
  const words = toPlainText(article.content || article.description).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function Writing() {
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    fetch(ARTICLES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const raw = Array.isArray(payload) ? payload : payload?.articles;
        const list = Array.isArray(raw) ? raw : [];
        const sorted = list
          .filter((a) => a && a.publishedAt)
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 5);
        if (sorted.length === 0) {
          setStatus("empty");
        } else {
          setArticles(sorted);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container fluid className="writing-section" id="writing">
      <Container className="writing-container">
        <h2 className="writing-heading">
          <span className="writing-heading-prompt">{">"}</span> writings
        </h2>
        <div className="section-divider-center" aria-hidden="true" />

        {status === "loading" && (
          <div className="writing-status">
            <span className="writing-heading-prompt">{">"}</span> fetching articles
            <span className="writing-loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}

        {status === "ready" && (
          <div className="writing-list" role="list" aria-labelledby="writing-heading">
            {articles.map((article) => {
              const rawTags = Array.isArray(article.tags) ? article.tags.slice(0, 3) : [];
              const tags = rawTags.map((t) =>
                (typeof t === "string" ? t : t && (t.name || t.title || t.slug)) || ""
              ).filter(Boolean);
              const date = fullDateFormatter.format(new Date(article.publishedAt));
              const readingTime = estimateReadingTime(article);
              const title = String(article.title || article.slug || "");
              const slug = String(article.slug || "");

              return (
                <article className="writing-card" key={slug || title} role="listitem">
                  <div className="writing-card-header">
                    <a
                      className="writing-card-title"
                      href={`https://blog.buildwithhimanshu.com/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {title}
                    </a>
                  </div>
                  <div className="writing-card-meta">
                    <span className="writing-card-date">{date}</span>
                    <span className="writing-card-separator">·</span>
                    <span className="writing-card-reading-time">{readingTime}</span>
                  </div>
                  {tags.length > 0 && (
                    <div className="writing-card-tags">
                      {tags.map((tag) => (
                        <span className="writing-tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {status === "empty" && (
          <div className="writing-status writing-empty">
            <span className="writing-heading-prompt">{">"}</span> no articles yet — check back soon.
          </div>
        )}

        {status === "error" && (
          <div className="writing-status">
            <span className="writing-heading-prompt">{">"}</span> the blog is unreachable right now.
          </div>
        )}

        <div className="writing-footer">
          <a
            className="writing-all-link"
            href="https://blog.buildwithhimanshu.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            All writings →
          </a>
        </div>
      </Container>
    </Container>
  );
}

export default Writing;

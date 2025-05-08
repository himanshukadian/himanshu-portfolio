import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaTag, FaArrowLeft } from 'react-icons/fa';
import blogPosts from './blogPostsData'; // We'll move the blogPosts array to a separate file for reuse
import ReactMarkdown from 'react-markdown';
import './Blog.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <Container className="py-5 text-center">
        <h2>Article Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/blog')} className="mt-3">
          <FaArrowLeft className="me-2" />Back to Blog
        </Button>
      </Container>
    );
  }

  return (
    <section className="resume-section" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Container>
        <div className="project-card-view" style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 2rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <Button variant="link" onClick={() => navigate('/blog')} className="mb-3" style={{ textDecoration: 'none', color: 'var(--primary-color)', fontWeight: 600 }}>
            <FaArrowLeft className="me-2" />Back to Blog
          </Button>
          <img src={post.image} alt={post.title} className="card-img-top mb-4" style={{ width: '100%', maxHeight: 340, objectFit: 'cover' }} />
          <h1 className="mb-3" style={{ fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)' }}>{post.title}</h1>
          <div className="d-flex align-items-center mb-3" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}><FaCalendarAlt className="me-1" />{post.date}</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}><FaClock className="me-1" />{post.readTime}</span>
            <div className="tags-container">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="tag"><FaTag className="me-1" />{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', lineHeight: 1.8, marginTop: 24 }}>
            <div className="markdown-content">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            <div style={{ marginTop: 32, color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '1rem' }}>
              <hr />
              <div>Author: <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{post.author}</span></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BlogDetail; 
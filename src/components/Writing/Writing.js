import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

const ARTICLES_URL =
  (process.env.REACT_APP_BACKEND_URL || "https://himanshu-portfolio-api-e10b4543a453.herokuapp.com") +
  "/api/articles";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

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
      <Container>
        <h2
          id="writing-heading"
          style={{
            fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
            fontWeight: 600,
            textAlign: "center",
            color: "#ffffff",
            marginBottom: 0,
            fontFamily: "'Fira Code', monospace",
          }}
        >
          <span style={{ color: '#00ff41' }}>{'>'}</span> writing
        </h2>
        <div className="section-divider-center" aria-hidden="true"></div>

        {status === "loading" && (
          <p className="writing-status">
            <span style={{ color: '#00ff41' }}>{'>'}</span> fetching articles…
          </p>
        )}

        {status === "ready" && (
          <div className="writing-list" role="list" aria-labelledby="writing-heading">
            {articles.map((article) => (
              <div className="writing-row" key={article.slug || article.title} role="listitem">
                <a
                  className="writing-title"
                  href={`https://blog.buildwithhimanshu.com/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title || article.slug}
                </a>
                <span className="writing-date">{dateFormatter.format(new Date(article.publishedAt))}</span>
              </div>
            ))}
          </div>
        )}

        {status === "empty" && (
          <p className="writing-status">
            <span style={{ color: '#00ff41' }}>{'>'}</span> the blog is unreachable right now.
          </p>
        )}

        {status === "error" && (
          <p className="writing-status">
            <span style={{ color: '#00ff41' }}>{'>'}</span> the blog is unreachable right now.
          </p>
        )}

        <a
          className="writing-all"
          href="https://blog.buildwithhimanshu.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          All writing →
        </a>
      </Container>
    </Container>
  );
}

export default Writing;
import React from "react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

function ProjectCard({
  name,
  company,
  category,
  isPersonal,
  keyMetric,
  description,
  tags = [],
  ghLink,
  demoLink,
}) {
  return (
    <div className="proj-card">
      {/* Category / company badges (Harshit-style hierarchy) */}
      {category && <span className="proj-category-badge">{category}</span>}
      {company ? (
        <span className="proj-company-badge">{company}</span>
      ) : isPersonal ? (
        <span className="proj-personal-badge">Personal</span>
      ) : null}

      {/* Title */}
      <h3 className="proj-name">{name}</h3>

      {/* Key metric */}
      {keyMetric && <p className="proj-metric">{keyMetric}</p>}

      {/* Description */}
      <p className="proj-desc">{description}</p>

      {/* Tech tags */}
      {tags.length > 0 && (
        <div className="proj-tech-tags">
          {tags.map((tag) => (
            <span key={tag} className="proj-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Links (kept exactly as-is) */}
      {(ghLink || demoLink) && (
        <div className="proj-links">
          {ghLink && (
            <a
              href={ghLink}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-link"
              aria-label={`${name} GitHub repository`}
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              <FaGithub aria-hidden="true" /> git.clone
            </a>
          )}
          {demoLink && (
            <a
              href={demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-link"
              aria-label={`${name} live demo`}
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              <FaExternalLinkAlt aria-hidden="true" /> demo.run
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectCard;

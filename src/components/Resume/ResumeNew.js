import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { FaDownload, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { resumeData } from "../../data/resume";

// Show only the top 2 highlights per role by default; user can expand
function ExperienceItem({ role, company, duration, highlights }) {
  const [expanded, setExpanded] = useState(false);
  const preview = highlights.slice(0, 2);
  const rest = highlights.slice(2);

  return (
    <div className="resume-timeline-item">
      <p className="resume-company-label">{company}</p>
      <h3 className="resume-role-title">{role}</h3>
      <p className="resume-date-label">{duration}</p>
      <ul className="resume-bullet-list">
        {preview.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
        {expanded &&
          rest.map((item, i) => (
            <li key={`rest-${i}`}>{item}</li>
          ))}
      </ul>
      {rest.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0.5rem 0 0",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            marginTop: "0.25rem",
          }}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <FaChevronUp aria-hidden="true" /> Show less
            </>
          ) : (
            <>
              <FaChevronDown aria-hidden="true" /> +{rest.length} more highlights
            </>
          )}
        </button>
      )}
    </div>
  );
}

function Resume() {
  return (
    <Container fluid className="resume-section" id="resume">
      <Container>
        {/* Experience */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: 0 }}>
          <h2 className="resume-section-header" style={{ fontFamily: "'Fira Code', monospace" }}>
            <span style={{ color: '#00ff41' }}>{'>'}</span> experience
          </h2>
          <a
            href="/Himanshu_Chaudhary_Resume.pdf"
            download
            className="resume-download-btn"
            aria-label="Download Full Resume PDF"
            style={{ fontFamily: "'Fira Code', monospace" }}
          >
            <FaDownload aria-hidden="true" /> download --resume
          </a>
        </div>
        <div className="section-divider" style={{ marginBottom: "0.75rem" }} aria-hidden="true"></div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginBottom: "2rem", fontFamily: "'Fira Code', monospace" }}>
          {'//'} Work shipping large-scale systems across logistics, e-commerce, and AI
        </p>

        <div className="resume-timeline-wrapper">
          <div className="resume-timeline">
            {resumeData.experience.map((exp, index) => (
              <ExperienceItem
                key={index}
                role={exp.role}
                company={exp.company}
                duration={exp.duration}
                highlights={exp.highlights}
              />
            ))}
          </div>
        </div>

        {/* Education */}
        <h2 className="resume-section-header" style={{ marginTop: "3rem", marginBottom: 0, fontFamily: "'Fira Code', monospace" }}>
          <span style={{ color: '#00ff41' }}>{'>'}</span> education
        </h2>
        <div className="section-divider" aria-hidden="true"></div>
        <div className="resume-timeline-wrapper">
          <div className="resume-timeline">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="resume-timeline-item">
                <p className="resume-company-label">{edu.institution}</p>
                <h3 className="resume-role-title">{edu.degree}</h3>
                <p className="resume-date-label">{edu.year}</p>
                {edu.achievements && (
                  <ul className="resume-bullet-list">
                    {edu.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {resumeData.achievements && resumeData.achievements.length > 0 && (
          <>
            <h2 className="resume-section-header" style={{ marginTop: "3rem", marginBottom: 0, fontFamily: "'Fira Code', monospace" }}>
              <span style={{ color: '#00ff41' }}>{'>'}</span> achievements
            </h2>
            <div className="section-divider" aria-hidden="true"></div>
            <div className="resume-timeline-wrapper">
              <div className="resume-timeline">
                <div className="resume-timeline-item">
                  <ul className="resume-bullet-list">
                    {resumeData.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </Container>
  );
}

export default Resume;
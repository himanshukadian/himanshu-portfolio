import React from "react";
import { Container } from "react-bootstrap";
import Techstack from "./Techstack";
import Toolstack from "./Toolstack";
import { resumeData } from "../../data/resume";

function About() {
  const stats = [
    { value: "5+", desc: "Years Experience" },
    { value: "Amazon & Wayfair", desc: "Top-Tier Companies" },
    { value: "500M+", desc: "Events Processed/Day" },
    { value: "200M+", desc: "Users Served Globally" },
  ];

  return (
    <Container fluid className="about-section">
      <Container>
        {/* Heading */}
        <h1 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: 0, fontFamily: "'Fira Code', monospace" }}>
          <span style={{ color: '#00ff41' }}>{'>'}</span> about.me
        </h1>
        <div className="section-divider" aria-hidden="true"></div>

        {/* Bio — Terminal style */}
        <p className="about-bio">
          <span style={{ color: '#00ff41', marginRight: '0.5rem' }}>{'>'}</span>
          <strong style={{ color: "#fff", fontFamily: "'Fira Code', monospace" }}>{resumeData.name}</strong> <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span> {resumeData.location}
        </p>
        <p className="about-bio">
          <span style={{ color: '#00ff41', marginRight: '0.5rem' }}>{'>'}</span>
          {resumeData.title}
        </p>
        <p className="about-bio" style={{ marginTop: '1rem' }}>
          <span style={{ color: '#00ff41', marginRight: '0.5rem' }}>{'>'}</span>
          Building fault-tolerant services, AI platforms, and cloud-native systems at{" "}
          <strong style={{ color: '#00ff41' }}>Amazon</strong> and <strong style={{ color: '#00ff41' }}>Wayfair</strong>.
        </p>

        {/* Stat Cards */}
        <div className="about-stats-grid" role="list" aria-label="Key achievements">
          {stats.map((stat) => (
            <div className="about-stat-card" key={stat.desc} role="listitem">
              <span className="about-stat-value">{stat.value}</span>
              <span className="about-stat-desc">{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <h1 className="project-heading" style={{ marginBottom: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontFamily: "'Fira Code', monospace" }}>
          <span style={{ color: '#00ff41' }}>{'>'}</span> tech.stack
        </h1>
        <div className="section-divider-center" aria-hidden="true"></div>
        <Techstack />
        <Toolstack />
      </Container>
    </Container>
  );
}

export default About;

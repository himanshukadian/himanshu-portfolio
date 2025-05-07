import React from "react";
import { Card } from "react-bootstrap";

function ProjectCards(props) {
  return (
    <Card className="project-card-view">
      <div style={{
        width: '100%',
        padding: '1.5rem 0 0.5rem 0',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: '1.5em',
        color: 'var(--primary-color)',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        // textShadow: '0 0 8px #00e6fe44', // Remove for modern flat look
      }}>{props.title}</div>
      <Card.Body>
        <Card.Title style={{ color: "var(--secondary-color)", fontWeight: "bold" }}>{props.title}</Card.Title>
        {props.company && (
          <Card.Subtitle className="mb-2 text-muted" style={{ color: 'var(--text-secondary)' }}>{props.company}</Card.Subtitle>
        )}
        <Card.Text style={{ textAlign: "justify", marginTop: "1rem", color: 'var(--text-primary)' }}>
          {props.description}
        </Card.Text>
        {props.techStack && (
          <Card.Text style={{ textAlign: "justify", color: "var(--secondary-color)", marginTop: "1rem" }}>
            <strong>Tech Stack:</strong> {props.techStack}
          </Card.Text>
        )}
        {props.achievements && (
          <Card.Text style={{ textAlign: "justify", marginTop: "1rem", color: 'var(--text-secondary)' }}>
            <strong>Key Achievements:</strong>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
              {props.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProjectCards;

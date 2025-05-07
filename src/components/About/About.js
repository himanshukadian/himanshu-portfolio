import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Techstack from "./Techstack";
import Toolstack from "./Toolstack";
import laptopImg from "../../Assets/about.png";

function About() {
  return (
    <Container fluid className="about-section">
      <Container>
        <Row style={{ justifyContent: "center", padding: "10px" }}>
          <Col
            md={7}
            style={{
              justifyContent: "center",
              paddingTop: "30px",
              paddingBottom: "50px",
            }}
          >
            <h1 style={{ fontSize: "2.1em", paddingBottom: "20px" }}>
              Know Who <strong className="purple">I AM</strong>
            </h1>
            <div className="about-card">
              <p className="about-body">
                Hi! I'm <span className="purple">Himanshu Chaudhary</span> from <span className="purple">New York, USA</span>. 
                I'm a Software Engineer II specializing in building intelligent solutions.
              </p>
              <p className="about-body" style={{ fontWeight: 600, color: 'var(--secondary-color)', fontSize: '1.15em', marginBottom: '1.2rem' }}>
                <em>My mission: To build scalable, intelligent systems that empower people and organizations to achieve more through technology.</em>
              </p>
              <p className="about-body">
                My expertise includes:
              </p>
              <ul>
                <li>Full Stack Development with modern technologies</li>
                <li>Cloud Architecture and DevOps practices</li>
                <li>AI/ML solution development</li>
                <li>System Design and Optimization</li>
              </ul>
              <p className="about-body">
                I'm passionate about creating efficient, scalable solutions and contributing to open-source projects.
              </p>
            </div>
            {/* Full Skillset Section */}
            <div className="about-card" style={{ marginTop: '2rem', background: 'var(--bg-secondary)', borderRadius: 16, padding: '2rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: '1rem' }}>Full Skillset</h3>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li><strong>Languages:</strong> Python, Java, C++, JavaScript, SQL</li>
                <li><strong>Developer Tools:</strong> VS Code, IntelliJ, Google Cloud Platform, AWS, Kafka, DynamoDB, Lambda, Cloud Functions</li>
                <li><strong>Technologies/Frameworks:</strong> Spring Boot, Hibernate, JDBC, Flask, Django, Docker, Kubernetes, Microservice Architecture, System Design, Generative AI (Gemini/OpenAI)</li>
              </ul>
            </div>
          </Col>
          <Col
            md={5}
            style={{ paddingTop: "120px", paddingBottom: "50px" }}
            className="about-img"
          >
            <img src={laptopImg} alt="about" className="img-fluid" />
          </Col>
        </Row>
        <h1 className="project-heading">
          Professional <strong className="purple">Skillset </strong>
        </h1>
        <Techstack />
        <h1 className="project-heading">
          <strong className="purple">Tools</strong> I use
        </h1>
        <Toolstack />
      </Container>
    </Container>
  );
}

export default About;

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import "../../style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Projects = React.memo(function Projects() {
  return (
    <Container fluid className="project-section" id="projects">
      <Container>
        <h1 className="project-heading">
          Featured <strong className="purple">Projects</strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>

        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://raw.githubusercontent.com/himanshu-03/Portfolio/main/src/Assets/Projects/grievance.png"
              isBlog={false}
              title="Grievance Portal"
              description="A comprehensive web application built to streamline the grievance management process for educational institutions. Features include:
              • Real-time complaint tracking and status updates
              • NLP-powered complaint categorization
              • Automated routing to relevant departments
              • Analytics dashboard for administrators
              • Mobile-responsive design"
              ghLink="https://github.com/himanshu-03/Grievance-Portal"
              demoLink="https://grievance-portal.herokuapp.com/"
              techStack="Python, Django, AWS EC2, Docker, NLP, React"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://raw.githubusercontent.com/himanshu-03/Portfolio/main/src/Assets/Projects/nitadda.png"
              isBlog={false}
              title="NITADDA"
              description="A collaborative platform for NIT students to share and access study resources. Key features:
              • Resource sharing and categorization
              • User authentication and authorization
              • Search functionality with filters
              • Rating and review system
              • Real-time notifications"
              ghLink="https://github.com/himanshu-03/NITADDA"
              demoLink="https://nitadda.herokuapp.com/"
              techStack="Python, Django, AWS EC2, Docker, PostgreSQL"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://raw.githubusercontent.com/himanshu-03/Portfolio/main/src/Assets/Projects/chatbot.png"
              isBlog={false}
              title="AI Chatbot"
              description="An intelligent chatbot powered by OpenAI's GPT model. Features:
              • Natural language processing
              • Context-aware conversations
              • Multi-language support
              • Custom training capabilities
              • Integration with various platforms"
              ghLink="https://github.com/himanshu-03/AI-Chatbot"
              demoLink="https://ai-chatbot-demo.herokuapp.com/"
              techStack="Python, OpenAI API, Flask, WebSocket"
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
});

export default Projects;

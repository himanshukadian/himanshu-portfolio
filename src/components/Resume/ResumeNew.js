import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ResumeContent from "./ResumeContent";
import "../../style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";

function Resume() {
  return (
    <Container fluid className="resume-section" id="resume">
      <Container>
        <Row style={{ justifyContent: "center", position: "relative" }}>
          <Col md={15} className="resume-content">
            <div className="resume-header">
              <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Experience</h2>
              <div className="resume-divider"></div>
              <p className="resume-tagline" style={{
                fontSize: "1.2rem",
                color: "var(--secondary-color)",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: "1.5rem"
              }}>
                Proven track record in building scalable, intelligent solutions for global companies.
              </p>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <Button
                  as="a"
                  className="btn btn-primary"
                  href="/Himanshu_Resume.pdf"
                  download
                >
                  Download Full Resume (PDF)
                </Button>
              </div>
            </div>
            
            <div className="resume-section-content">
              <ResumeContent
                title="Software Engineer II"
                company="Wayfair"
                date="April 2023 - Present"
                content={[
                  "Designed a Lane Management System optimizing lane selection based on 50-70 parameters, reducing fulfillment costs by 20%",
                  "Developed and deployed Voyager an AI-powered chat assistant using generative AI to translate English text into SQL queries",
                  "Designed and developed a highly scalable LMP Insight tool capable of processing 50K events per minute",
                  "Redesigned label printing platform that can efficiently print 100 labels per second",
                  "Design and developed unified endpoint for label printing which improved onboarding time for new clients from 1-2 months to 3 weeks"
                ]}
              />
              <ResumeContent
                title="SDE 1"
                company="Amazon"
                date="July 2022 - March 2023"
                content={[
                  "Developed a customer transition pipeline for 1M customers from one marketplace to another",
                  "Automated customer transition process, saving manual effort of 2 days biweekly",
                  "Service migration from one architecture to another saving 50% IMR cost"
                ]}
              />
              <ResumeContent
                title="Software Engineer"
                company="Mobeology Communications"
                date="January 2021 - June 2022"
                content={[
                  "Design and developed profiling app dashboard to manage publisher and campaigns",
                  "Developed microservice for managing analytics"
                ]}
              />
            </div>

            <div className="resume-header">
              <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Education</h2>
              <div className="resume-divider"></div>
            </div>
            
            <div className="resume-section-content">
              <ResumeContent
                title="Master of Computer Applications (MCA)"
                company="National Institute of Technology Warangal"
                date="2019 - 2022"
                content={[
                  "Lead web developer at College Software Development Cell (WSDC) 2020-2022"
                ]}
              />
              <ResumeContent
                title="BSc(H) Computer Science"
                company="University of Delhi"
                date="2016 - 2019"
                content={[
                  "Focused on core computer science concepts and practical applications"
                ]}
              />
            </div>

            <div className="resume-header">
              <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Skills</h2>
              <div className="resume-divider"></div>
            </div>
            
            <div className="resume-section-content">
              <ResumeContent
                title="Languages & Frameworks"
                content={[
                  "Python, Java, C++, JavaScript, SQL",
                  "Spring Boot, Hibernate, JDBC, Flask, Django",
                  "React, Node.js, Express.js"
                ]}
              />
              <ResumeContent
                title="Tools & Technologies"
                content={[
                  "VS Code, IntelliJ, Git, Docker, Kubernetes",
                  "AWS, Google Cloud Platform, Kafka, DynamoDB",
                  "Microservice Architecture, System Design, Generative AI"
                ]}
              />
            </div>

            <div className="resume-header">
              <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Projects</h2>
              <div className="resume-divider"></div>
            </div>
            
            <div className="resume-section-content">
              <ResumeContent
                title="Grievance Portal"
                company="Web Application"
                content={[
                  "Built a comprehensive grievance management system for educational institutions",
                  "Implemented NLP-powered complaint categorization and automated routing",
                  "Developed analytics dashboard for administrators",
                  "Tech Stack: Python, Django, AWS EC2, Docker, NLP, React"
                ]}
              />
              <ResumeContent
                title="NITADDA"
                company="Resource Sharing Platform"
                content={[
                  "Created a collaborative platform for NIT students to share study resources",
                  "Implemented user authentication, search functionality, and rating system",
                  "Tech Stack: Python, Django, AWS EC2, Docker, PostgreSQL"
                ]}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Resume;

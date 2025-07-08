import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ResumeContent from "./ResumeContent";
import Button from "react-bootstrap/Button";
import { resumeData } from "../../data/resume";

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
              {resumeData.experience.map((exp, index) => (
                <ResumeContent
                  key={index}
                  title={exp.role}
                  company={exp.company}
                  date={exp.duration}
                  content={exp.highlights}
                />
              ))}
            </div>

            <div className="resume-header">
              <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Education</h2>
              <div className="resume-divider"></div>
            </div>
            
            <div className="resume-section-content">
              {resumeData.education.map((edu, index) => (
                <ResumeContent
                  key={index}
                  title={edu.degree}
                  company={edu.institution}
                  date={edu.year}
                  content={edu.achievements || ["Focused on core computer science concepts and practical applications"]}
                />
              ))}
            </div>

            <div className="resume-header">
              <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Featured Projects</h2>
              <div className="resume-divider"></div>
              <p className="resume-tagline" style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                fontWeight: 400,
                textAlign: "center",
                marginBottom: "1.5rem"
              }}>
                Key projects demonstrating technical expertise and problem-solving skills
              </p>
            </div>
            
            <div className="resume-section-content">
              {resumeData.projects.map((project, index) => (
                <ResumeContent
                  key={index}
                  title={project.name}
                  company="Personal Project"
                  content={[
                    project.description,
                    `Tech Stack: ${project.technologies.join(', ')}`
                  ]}
                />
              ))}
            </div>

            {resumeData.achievements.length > 0 && (
              <>
                <div className="resume-header">
                  <h2 className="resume-main-title" style={{ color: 'var(--primary-color)' }}>Achievements</h2>
                  <div className="resume-divider"></div>
                </div>
                
                <div className="resume-section-content">
                  <ResumeContent
                    title="Key Achievements"
                    content={resumeData.achievements}
                  />
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Resume;

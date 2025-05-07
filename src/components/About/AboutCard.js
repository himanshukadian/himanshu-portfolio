import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function AboutCard() {
  return (
    <Container className="about-content">
      <Row>
        <Col md={12}>
          <p style={{ textAlign: "justify" }}>
            I am Himanshu, a Software Engineer II at Wayfair, specializing in building scalable cloud-native applications and optimizing fulfillment processes. 
            With a strong background in full-stack development and system design, I focus on creating efficient solutions that drive business value.
          </p>
          <p style={{ textAlign: "justify" }}>
            My expertise spans across cloud computing, microservices architecture, and generative AI applications. 
            I have successfully delivered projects involving AI-powered chat assistants, high-throughput data processing systems, 
            and optimization algorithms that have significantly reduced operational costs.
          </p>
          <p style={{ textAlign: "justify" }}>
            Previously at Amazon and Mobeology Communications, I gained extensive experience in developing customer-centric solutions 
            and managing large-scale data pipelines. I hold a Master's in Computer Applications from NIT Warangal, where I graduated as a class topper.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default AboutCard;

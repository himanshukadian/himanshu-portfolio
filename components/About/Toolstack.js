import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiPostman,
  SiDocker,
  SiGit,
  SiAmazonaws
} from "react-icons/si";

function Toolstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <SiVisualstudiocode />
        <label>VS Code</label>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiPostman />
        <label>Postman</label>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiDocker />
        <label>Docker</label>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiGit />
        <label>Git</label>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiAmazonaws />
        <label>AWS</label>
      </Col>
    </Row>
  );
}

export default Toolstack;

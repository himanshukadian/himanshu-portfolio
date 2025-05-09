import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiAmazonaws,
  SiDocker,
  SiKubernetes,
  SiMongodb,
  SiPostgresql,
  SiTypescript,
  SiGit,
  SiJenkins,
} from "react-icons/si";

function Techstack() {
  const technologies = [
    { Icon: SiJavascript, label: "JavaScript" },
    { Icon: SiTypescript, label: "TypeScript" },
    { Icon: SiReact, label: "React" },
    { Icon: SiNodedotjs, label: "Node.js" },
    { Icon: SiPython, label: "Python" },
    { Icon: SiAmazonaws, label: "AWS" },
    { Icon: SiDocker, label: "Docker" },
    { Icon: SiKubernetes, label: "Kubernetes" },
    { Icon: SiMongodb, label: "MongoDB" },
    { Icon: SiPostgresql, label: "PostgreSQL" },
    { Icon: SiGit, label: "Git" },
    { Icon: SiJenkins, label: "Jenkins" },
  ];

  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      {technologies.map(({ Icon, label }, index) => (
        <Col xs={4} md={2} className="tech-icons" key={index}>
          <Icon />
          <label>{label}</label>
        </Col>
      ))}
    </Row>
  );
}

export default Techstack;

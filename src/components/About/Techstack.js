import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiMongodb,
  SiPostgresql,
  SiTypescript,
  SiSpringboot,
  SiMysql,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiHibernate,
  SiOpenai,
} from "react-icons/si";
import { resumeData } from "../../data/resume";

// Icon mapping for technologies
const iconMap = {
  'Python': SiPython,
  'Java': SiSpringboot, // Using Spring Boot as Java representative
  'JavaScript': SiJavascript,
  'TypeScript': SiTypescript,
  'React': SiReact,
  'Node.js': SiNodedotjs,
  'Spring Boot': SiSpringboot,
  'Docker': SiDocker,
  'Kubernetes': SiKubernetes,
  'MongoDB': SiMongodb,
  'PostgreSQL': SiPostgresql,
  'MySQL': SiMysql,
  'Redis': SiRedis,
  'Hibernate': SiHibernate,
  'AI/GenAI': SiOpenai,
};

function Techstack() {
  // Combine languages and key technologies from resume data
  const allSkills = [
    ...resumeData.skills.languages,
    ...resumeData.skills.technologies.filter(tech => 
      ['Spring Boot', 'Docker', 'Kubernetes', 'Hibernate', 'AI/GenAI', 'React', 'Node.js'].includes(tech)
    )
  ];

  // Filter to only include skills that have icons
  const technologies = allSkills
    .filter(skill => iconMap[skill])
    .map(skill => ({
      Icon: iconMap[skill],
      label: skill
    }))
    .slice(0, 12); // Increased to 12 to accommodate more technologies

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

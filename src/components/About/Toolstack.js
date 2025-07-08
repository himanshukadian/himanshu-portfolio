import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiPostman,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiAmazonaws,
  SiGooglecloud,
  SiJenkins,
  SiIntellijidea,
  SiApachekafka,
} from "react-icons/si";
import { resumeData } from "../../data/resume";

// Icon mapping for developer tools
const toolIconMap = {
  'VS Code': SiVisualstudiocode,
  'IntelliJ': SiIntellijidea,
  'AWS': SiAmazonaws,
  'Google Cloud Platform': SiGooglecloud,
  'Docker': SiDocker,
  'Kubernetes': SiKubernetes,
  'Jenkins': SiJenkins,
  'Kafka': SiApachekafka,
  'Git': SiGit,
  'Postman': SiPostman,
};

function Toolstack() {
  // Get developer tools from resume data
  const developerTools = resumeData.skills.developerTools;
  
  // Filter to only include tools that have icons and add some standard ones
  const availableTools = [
    ...developerTools.filter(tool => toolIconMap[tool]),
    'Git', // Add Git as it's a standard tool
    'Postman' // Add Postman as it's a standard API tool
  ];

  const tools = [...new Set(availableTools)] // Remove duplicates
    .filter(tool => toolIconMap[tool])
    .map(tool => ({
      Icon: toolIconMap[tool],
      label: tool
    }))
    .slice(0, 9); // Limit to 9 tools for better layout

  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      {tools.map(({ Icon, label }, index) => (
        <Col xs={4} md={2} className="tech-icons" key={index}>
          <Icon />
          <label>{label}</label>
        </Col>
      ))}
    </Row>
  );
}

export default Toolstack;

import React from "react";
import { Container } from "react-bootstrap";
import ProjectCard from "./ProjectCards";

// Top 6 featured projects — curated for maximum impact
const featuredProjects = [
  {
    name: "AI Workflow Orchestration Platform",
    company: "Wayfair",
    category: "AI Platforms",
    keyMetric: "Transformed single-user AI tool into multi-tenant cloud platform",
    description:
      "Designed and scaled a cloud-based AI workflow orchestration system with asynchronous execution, real-time observability, and context-aware orchestration — enabling reliable automation for bug analysis, test generation, and code intelligence.",
    tags: ["Python", "Kubernetes", "AI/ML", "Distributed Systems", "Cloud"],
  },
  {
    name: "Lane Management System",
    company: "Wayfair",
    category: "Optimization & Routing",
    keyMetric: "↓ 20% fulfillment costs · ↑ 15% delivery SLA adherence",
    description:
      "Built a sophisticated routing optimization system analyzing 50–70 operational, cost, and performance parameters to drive intelligent fulfillment routing decisions at scale.",
    tags: ["Microservices", "Python", "Java", "System Design", "Optimization"],
  },
  {
    name: "Monitoring & Insights Platform",
    company: "Wayfair",
    category: "Observability",
    keyMetric: "50,000+ events/min · incident triage: hours → minutes",
    description:
      "Built a high-throughput monitoring platform using distributed microservices, enabling real-time observability and dramatically cutting incident response time.",
    tags: ["Kafka", "Microservices", "Python", "Observability", "Java"],
  },
  {
    name: "Customer Migration Pipeline",
    company: "Amazon",
    category: "Data Pipelines",
    keyMetric: "1M+ users migrated · zero manual intervention",
    description:
      "Engineered an automated pipeline to transition 1M+ users between marketplaces with high data consistency guarantees and zero manual intervention required.",
    tags: ["Python", "Java", "AWS", "Data Pipelines", "Automation"],
  },
  {
    name: "Backend Services Modernization",
    company: "Amazon",
    category: "Modernization",
    keyMetric: "↓ 50% infrastructure & maintenance costs",
    description:
      "Migrated core backend services from legacy architecture to a modern scalable design, significantly improving system reliability and performance while cutting costs in half.",
    tags: ["Java", "Microservices", "AWS", "System Migration", "Scalability"],
  },
  {
    name: "Voyager AI Analytics Assistant",
    company: "Wayfair",
    category: "Analytics & AI",
    keyMetric: "↓ 30% ad-hoc data request turnaround time",
    description:
      "Built an AI-powered analytics assistant that converts natural language queries into optimized SQL, enabling non-technical users to self-serve data insights independently.",
    tags: ["Generative AI", "SQL", "Python", "OpenAI", "NLP"],
  },
];

// Personal / open-source projects
const personalProjects = [
  {
    name: "priceIQ",
    isPersonal: true,
    category: "Pricing Intelligence",
    keyMetric: "Global price intelligence across e-commerce platforms",
    description:
      "A price comparison platform that aggregates real-time prices from multiple online retailers worldwide, with price history and deal alerts.",
    tags: ["Python", "Streamlit", "Web Scraping", "Data Analysis"],
    ghLink: "https://github.com/himanshukadian/priceIQ",
    demoLink: "https://priceiq.streamlit.app/?page=plan",
  },
  {
    name: "Speak2ChatGPT",
    isPersonal: true,
    category: "AI & Developer Tools",
    keyMetric: "Voice-enabled ChatGPT interface with real-time speech I/O",
    description:
      "Converts speech to text, processes queries through the ChatGPT API, and returns voice responses — enabling hands-free AI interaction.",
    tags: ["Python", "OpenAI API", "Speech Recognition", "TTS"],
    ghLink: "https://github.com/himanshukadian/Speak2ChatGPT",
  },
  {
    name: "Grievance Portal",
    isPersonal: true,
    category: "Student Platforms",
    keyMetric: "NLP-powered complaint routing for university students",
    description:
      "A web app for students to submit complaints (academics, hostel, mess) with NLP-powered categorization and automated routing to relevant departments.",
    tags: ["Python", "Django", "AWS EC2", "Docker", "NLP"],
    ghLink: "https://github.com/himanshukadian",
  },
];

function Projects() {
  return (
    <Container fluid className="project-section" id="projects">
      <Container>
        <h1 className="project-heading" style={{ marginBottom: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontFamily: "'Fira Code', monospace" }}>
          <span style={{ color: '#00ff41' }}>{'>'}</span> projects
        </h1>
        <div className="section-divider-center" aria-hidden="true"></div>

        <p className="projects-intro" style={{ fontFamily: "'Fira Code', monospace" }}>
          A curated set of platforms and systems shipped at Amazon, Wayfair, and beyond —
          focused on reliability, scale, and clear business impact.
        </p>

        {/* Professional Projects */}
        <h2
          style={{
            fontSize: "0.8rem",
            fontWeight: 400,
            color: "rgba(0, 255, 65, 0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "1rem",
            fontFamily: "'Fira Code', monospace"
          }}
        >
          {'//'} Professional Work
        </h2>
        <div className="projects-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>

        {/* Personal / Open-Source Projects */}
        <h2
          style={{
            fontSize: "0.8rem",
            fontWeight: 400,
            color: "rgba(0, 255, 65, 0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            margin: "3rem 0 1rem",
            fontFamily: "'Fira Code', monospace"
          }}
        >
          {'//'} Open-Source & Personal
        </h2>
        <div className="projects-grid">
          {personalProjects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>
      </Container>
    </Container>
  );
}

export default Projects;

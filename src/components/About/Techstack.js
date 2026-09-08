import React from "react";
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
  SiApachekafka,
  SiAmazonaws,
  SiDjango,
} from "react-icons/si";

const allCategories = [
  {
    label: "Languages",
    items: [
      { Icon: SiPython, label: "Python" },
      { Icon: SiSpringboot, label: "Java" },
      { Icon: SiJavascript, label: "JavaScript" },
      { Icon: SiTypescript, label: "TypeScript" },
    ],
  },
  {
    label: "Frameworks",
    items: [
      { Icon: SiReact, label: "React" },
      { Icon: SiNodedotjs, label: "Node.js" },
      { Icon: SiSpringboot, label: "Spring Boot" },
      { Icon: SiDjango, label: "Django" },
      { Icon: SiHibernate, label: "Hibernate" },
    ],
  },
  {
    label: "Infrastructure & AI",
    items: [
      { Icon: SiDocker, label: "Docker" },
      { Icon: SiKubernetes, label: "Kubernetes" },
      { Icon: SiAmazonaws, label: "AWS" },
      { Icon: SiApachekafka, label: "Kafka" },
      { Icon: SiRedis, label: "Redis" },
      { Icon: SiOpenai, label: "AI/GenAI" },
    ],
  },
  {
    label: "Databases",
    items: [
      { Icon: SiPostgresql, label: "PostgreSQL" },
      { Icon: SiMongodb, label: "MongoDB" },
      { Icon: SiMysql, label: "MySQL" },
    ],
  },
];

function Techstack() {
  return (
    <div className="techstack-unified-grid">
      {allCategories.map((cat) => (
        <div key={cat.label} className="techstack-category-unified">
          <span className="techstack-category-label-unified">{cat.label}</span>
          <div className="techstack-items-row">
            {cat.items.map(({ Icon, label }) => (
              <span className="tech-chip" key={label}>
                <Icon aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Techstack;

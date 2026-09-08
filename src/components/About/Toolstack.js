import React from "react";
import {
  SiVisualstudiocode,
  SiPostman,
  SiGit,
  SiIntellijidea,
  SiJira,
  SiGithub,
} from "react-icons/si";

// Development tools — separate from tech stack (no overlap with Techstack)
const devTools = [
  { Icon: SiVisualstudiocode, label: "VS Code" },
  { Icon: SiIntellijidea, label: "IntelliJ IDEA" },
  { Icon: SiGit, label: "Git" },
  { Icon: SiGithub, label: "GitHub" },
  { Icon: SiPostman, label: "Postman" },
  { Icon: SiJira, label: "Jira" },
];

function Toolstack() {
  return (
    <div className="techstack-unified-grid" style={{ marginBottom: "2rem" }}>
      <div className="techstack-category-unified" style={{ gridColumn: "1 / -1" }}>
        <span className="techstack-category-label-unified">Development Tools</span>
        <div className="techstack-items-row">
          {devTools.map(({ Icon, label }) => (
            <span className="tech-chip" key={label}>
              <Icon aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Toolstack;

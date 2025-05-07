import React from "react";

function ResumeContent({ title, company, date, content }) {
  return (
    <div className="resume-content-item">
      <div className="resume-item-header">
        <h3>{title}</h3>
        {company && <span className="company">{company}</span>}
        {date && <span className="date">{date}</span>}
      </div>
      <ul style={{ border: 'none', boxShadow: 'none', background: 'none', padding: 0 }}>
        {content.map((item, index) => (
          <li key={index} style={{ border: 'none', boxShadow: 'none', background: 'none', marginBottom: 8, color: 'var(--text-secondary)', fontSize: '1.08em', lineHeight: 1.7 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResumeContent; 
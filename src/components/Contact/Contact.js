import React from "react";
import {
  FaEnvelope,
  FaLinkedin,
  FaClock,
  FaPhoneAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import { resumeData } from "../../data/resume";

const CALENDLY_URL = 'https://calendly.com/himanshu-c-official/30min';

function Contact() {
  return (
    <div className="contact-wrapper">
      {/* Contact Info Row */}
      <div className="contact-info-row">
        <a href={`mailto:${resumeData.email}`} className="contact-info-chip" style={{ fontFamily: "'Fira Code', monospace" }}>
          <span className="k9s-item-key">e</span>
          <FaEnvelope className="contact-info-icon" />
          <span>{resumeData.email}</span>
        </a>
        <a
          href={resumeData.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-info-chip"
          style={{ fontFamily: "'Fira Code', monospace" }}
        >
          <span className="k9s-item-key">l</span>
          <FaLinkedin className="contact-info-icon" />
          <span>linkedin</span>
        </a>
        <a href={`tel:${resumeData.phone}`} className="contact-info-chip" style={{ fontFamily: "'Fira Code', monospace" }}>
          <span className="k9s-item-key">t</span>
          <FaPhoneAlt className="contact-info-icon" />
          <span>{resumeData.phone}</span>
        </a>
        <span className="contact-info-chip contact-response-time" style={{ fontFamily: "'Fira Code', monospace" }}>
          <span className="k9s-item-key">{'>'}</span>
          <FaClock className="contact-info-icon" />
          <span>24h response</span>
        </span>
      </div>

      {/* Action Prompt */}
      <div className="contact-form-wrapper">
        <h3 style={{ color: "#ffffff", fontWeight: 600, marginBottom: "0.4rem", textAlign: "center", fontFamily: "'Fira Code', monospace", fontSize: '1rem' }}>
          <span style={{ color: '#00ff41' }}>{'>'}</span> contact.send()
        </h3>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", textAlign: "center", marginBottom: "1.5rem", fontFamily: "'Fira Code', monospace" }}>
          Open to Senior SWE, Staff Engineer, and AI/ML roles
        </p>
        <div style={{ textAlign: 'center', padding: '2rem 1.2rem', background: 'rgba(0, 255, 65, 0.03)', border: '1px solid rgba(0, 255, 65, 0.2)', borderRadius: '4px' }}>
          <div style={{ color: '#00ff41', fontFamily: "'Fira Code', monospace", fontSize: '0.9rem', marginBottom: '1rem' }}>
            {'>'} want.to_talk()
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontFamily: "'Fira Code', monospace", marginBottom: '1.5rem' }}>
            Grab time on my calendar or email me directly
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginRight: '0.6rem',
              marginBottom: '0.6rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 400,
              border: '1px solid #00ff41',
              borderRadius: '4px',
              background: 'transparent',
              color: '#00ff41',
              fontFamily: "'Fira Code', monospace",
              letterSpacing: '0.1em',
              textDecoration: 'none'
            }}
          >
            <FaCalendarCheck />
            {'>>>'} schedule on calendly
          </a>
          <a
            href={`mailto:${resumeData.email}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.6rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 400,
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '4px',
              background: 'transparent',
              color: '#ffffff',
              fontFamily: "'Fira Code', monospace",
              letterSpacing: '0.1em',
              textDecoration: 'none'
            }}
          >
            <FaEnvelope />
            {'>>>'} email me
          </a>
        </div>
      </div>
    </div>
  );
}

export default Contact;
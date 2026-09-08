import React, { useState, useRef } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import {
  FaCheckCircle,
  FaEnvelope,
  FaLinkedin,
  FaClock,
  FaPhoneAlt,
} from "react-icons/fa";
import { resumeData } from "../../data/resume";

function Contact() {
  const form = useRef();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://himanshu-portfolio-api-e10b4543a453.herokuapp.com';
      const response = await fetch(`${backendUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Form */}
      <div className="contact-form-wrapper">
      <h3 style={{ color: "#ffffff", fontWeight: 600, marginBottom: "0.4rem", textAlign: "center", fontFamily: "'Fira Code', monospace", fontSize: '1rem' }}>
        <span style={{ color: '#00ff41' }}>{'>'}</span> contact.send()
      </h3>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", textAlign: "center", marginBottom: "1.5rem", fontFamily: "'Fira Code', monospace" }}>
        Open to Senior SWE, Staff Engineer, and AI/ML roles
      </p>
      {submitted ? (
        <Alert variant="success" onClose={() => setSubmitted(false)} dismissible style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 400, padding: '2rem 1.2rem', background: 'rgba(0, 255, 65, 0.05)', border: '1px solid rgba(0, 255, 65, 0.2)', color: '#ffffff', borderRadius: '4px', fontFamily: "'Fira Code', monospace" }}>
          <FaCheckCircle style={{ color: '#00ff41', fontSize: '2em', marginBottom: '0.5em' }} />
          <div style={{ color: '#00ff41' }}>{'>'} message.sent()</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.7em' }}>
            {'>'} response.incoming()
          </div>
        </Alert>
      ) : (
        <>
          {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
          <Form ref={form} onSubmit={handleSubmit} autoComplete="off">
            <Form.Group controlId="contactName" className="mb-3">
              <Form.Label style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                {'>'} name:
              </Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your name" 
                required 
                disabled={loading}
                style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }}
              />
            </Form.Group>
            <Form.Group controlId="contactEmail" className="mb-3">
              <Form.Label style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                {'>'} email:
              </Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email" 
                required 
                disabled={loading}
                style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }}
              />
            </Form.Group>
            <Form.Group controlId="contactMessage" className="mb-3">
              <Form.Label style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                {'>'} message:
              </Form.Label>
              <Form.Control 
                as="textarea" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Enter your message" 
                rows={4} 
                required 
                disabled={loading}
                style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.85rem' }}
              />
            </Form.Group>
            <div style={{ textAlign: "center" }}>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="btn-accent"
                style={{ 
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  minWidth: "160px",
                  padding: "0.75rem 2rem",
                  fontSize: "0.85rem",
                  fontWeight: 400,
                  border: "1px solid #00ff41",
                  borderRadius: "4px",
                  background: "transparent",
                  color: "#00ff41",
                  fontFamily: "'Fira Code', monospace",
                  letterSpacing: '0.1em'
                }}
              >
                {loading ? '>>> sending...' : '>>> send'}
              </Button>
            </div>
          </Form>
        </>
      )}
      </div>
    </div>
  );
}

export default Contact; 
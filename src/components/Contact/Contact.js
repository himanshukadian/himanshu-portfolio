import React, { useState, useRef } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";

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
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.buildwithhimanshu.com';
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
    <div className="contact-form-wrapper" style={{ maxWidth: 500, margin: "2rem auto 0 auto", background: "rgba(44,62,80,0.7)", borderRadius: 16, padding: "2rem", boxShadow: "0 4px 32px 0 rgba(44,62,80,0.10)", border: "1.5px solid #00e6fe" }}>
      <h3 style={{ color: "#00e6fe", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>Send me a message</h3>
      {submitted ? (
        <Alert variant="success" onClose={() => setSubmitted(false)} dismissible style={{ textAlign: 'center', fontSize: '1.15em', fontWeight: 600, padding: '2.2rem 1.2rem' }}>
          <FaCheckCircle style={{ color: '#00e6fe', fontSize: '2.2em', marginBottom: '0.5em' }} />
          <div>Thank you! Your message has been sent successfully.</div>
          <div style={{ fontSize: '0.95em', color: 'var(--text-secondary)', marginTop: '0.7em' }}>
            I'll get back to you as soon as possible.
          </div>
        </Alert>
      ) : (
        <>
          {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
          <Form ref={form} onSubmit={handleSubmit} autoComplete="off">
            <Form.Group controlId="contactName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Your Name" 
                required 
                disabled={loading}
              />
            </Form.Group>
            <Form.Group controlId="contactEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Your Email" 
                required 
                disabled={loading}
              />
            </Form.Group>
            <Form.Group controlId="contactMessage" className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control 
                as="textarea" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Your Message" 
                rows={4} 
                required 
                disabled={loading}
              />
            </Form.Group>
            <div style={{ textAlign: "center" }}>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                style={{ 
                  background: "linear-gradient(90deg, #00e6fe, #6C63FF)", 
                  border: "none", 
                  fontWeight: 600, 
                  borderRadius: 8, 
                  padding: "0.5rem 2.5rem",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
}

export default Contact; 
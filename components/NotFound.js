import React from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#2563ff', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Sorry, the page you are looking for does not exist.<br />
        You can return to the homepage below.
      </p>
      <Button className="btn btn-primary download-resume-btn" onClick={() => navigate("/")}>Go to Homepage</Button>
    </div>
  );
}

export default NotFound; 
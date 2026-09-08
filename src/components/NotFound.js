import React from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: "'Fira Code', monospace" }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 600, color: '#00ff41', marginBottom: '1rem', textShadow: '0 0 20px rgba(0, 255, 65, 0.3)' }}>ERROR 404</h1>
      <h2 style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
        {'>'} page.not.found()
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontSize: '0.85rem' }}>
        The resource you requested does not exist.<br />
        <span style={{ color: '#00ff41' }}>{'>'}</span> redirecting to home...
      </p>
      <Button className="btn btn-primary download-resume-btn" onClick={() => navigate("/")} style={{ fontFamily: "'Fira Code', monospace" }}>
        {'>'} cd /home
      </Button>
    </div>
  );
}

export default NotFound; 
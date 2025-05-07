import React, { useState, useEffect } from "react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "2.5rem",
        right: "2.5rem",
        zIndex: 9999,
        display: visible ? "block" : "none",
        background: "linear-gradient(90deg, var(--primary-color), var(--secondary-color))",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "48px",
        height: "48px",
        boxShadow: "0 2px 8px 0 rgba(44,62,80,0.10)",
        fontSize: "2rem",
        cursor: "pointer",
        transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
      }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};

export default BackToTop; 
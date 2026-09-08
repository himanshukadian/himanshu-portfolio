import React, { useState, useEffect, useCallback } from "react";

const SECTIONS = [
  { id: "home",     label: "Home" },
  { id: "about",    label: "About" },
  { id: "projects", label: "Projects" },
  { id: "resume",   label: "Resume" },
  { id: "contact",  label: "Contact" },
];

function SectionDots() {
  const [active, setActive] = useState("home");
  const [visible, setVisible] = useState(false);

  const getActive = useCallback(() => {
    const offsets = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return { id, top: Infinity };
      return { id, top: Math.abs(el.getBoundingClientRect().top) };
    });
    const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
    setActive(closest.id);

    // Show dots only after scrolling past the fold
    setVisible(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", getActive, { passive: true });
    getActive();
    return () => window.removeEventListener("scroll", getActive);
  }, [getActive]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 70;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      className="section-dots-nav"
      aria-label="Section navigation"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          className={`section-dot${active === id ? " section-dot--active" : ""}`}
          onClick={() => scrollTo(id)}
          aria-label={`Go to ${label} section`}
          title={label}
        />
      ))}
    </nav>
  );
}

export default SectionDots;

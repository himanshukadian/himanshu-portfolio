import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { scroller } from "react-scroll";
import Loader from "../Loader";
import { resumeData } from "../../data/resume";

// Lazy load components for better performance
const About = lazy(() => import("../About/About"));
const Projects = lazy(() => import("../Projects/Projects"));
const Writing = lazy(() => import("../Writing/Writing"));
const Resume = lazy(() => import("../Resume/ResumeNew"));
const Contact = lazy(() => import("../Contact/Contact"));

// Constants for better maintainability
const SCROLL_OFFSET = -70;
const SCROLL_DURATION = 700;
const SCROLL_DELAY = 100;

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Types out an array of lines like real terminal output, one character at a time.
function HeroTerminal({ lines, speed = 24, linePause = 550 }) {
  const [typed, setTyped] = useState(Array(lines.length).fill(""));
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    try {
      reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      /* ignore */
    }
    if (reduced.current) {
      setTyped(lines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reduced.current || activeIdx >= lines.length) return;
    const line = lines[activeIdx];
    let i = 0;
    let interval;
    // Small pause before starting a line (except the first).
    if (activeIdx > 0) {
      const hold = setTimeout(() => {
        interval = window.setInterval(typeChar, speed);
      }, linePause);
      return () => {
        clearTimeout(hold);
        clearInterval(interval);
      };
    }
    interval = window.setInterval(typeChar, speed);
    function typeChar() {
      i++;
      setTyped((prev) => {
        const next = prev.slice();
        next[activeIdx] = line.slice(0, i);
        return next;
      });
      if (i >= line.length) {
        clearInterval(interval);
        setActiveIdx(activeIdx + 1);
      }
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, lines, speed, linePause]);

  return (
    <div className="hero-terminal" aria-hidden="true">
      {lines.map((line, idx) => (
        <p key={idx} className="hero-term-line">
          <span className="hero-term-prompt">&gt;</span>
          <span className="hero-term-text">{typed[idx]}</span>
          {idx === activeIdx && !reduced.current && (
            <span className="hero-term-cursor"></span>
          )}
        </p>
      ))}
    </div>
  );
}

function Home() {
  // Handle hash-based navigation
  useEffect(() => {
    const handleHashNavigation = () => {
      if (window.location.hash) {
        const section = window.location.hash.replace('#', '');
        setTimeout(() => {
          try {
            scroller.scrollTo(section, {
              duration: SCROLL_DURATION,
              delay: 0,
              smooth: 'easeInOutQuart',
              offset: SCROLL_OFFSET,
            });
          } catch (error) {
            console.warn('Scroll navigation failed:', error);
            // Fallback to browser native behavior
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, SCROLL_DELAY);
      }
    };

    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, []);


  return (
    <main>
      {/* Hero Section - Terminal/BIOS Style */}
      <section className="split-hero" id="home" aria-labelledby="hero-heading">
        <div className="split-left">
          <h1 id="hero-heading" className="hero-name-gradient">
            {resumeData.name}
          </h1>
          <p className="hero-tagline">
            {resumeData.title}
          </p>
          <p className="hero-subtag">
            Backend • AI • Distributed Systems
          </p>

          <HeroTerminal lines={["building systems that scale.", "building tools that think."]} />

          <div className="hero-cta-row">
            <a className="btn-accent" href="/#projects" style={{ fontFamily: "'Fira Code', monospace" }}>
              View Projects
            </a>
            <a
              className="btn-ghost"
              href="/Himanshu_Chaudhary_Resume.pdf"
              download="Himanshu_Chaudhary_Resume.pdf"
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              View Resume
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <motion.section 
        id="about" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        aria-labelledby="about-heading"
      >
        <Suspense fallback={<Loader message="Loading About section..." />}>
          <About />
        </Suspense>
      </motion.section>

      {/* Projects Section */}
      <motion.section 
        id="projects" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        aria-labelledby="projects-heading"
      >
        <Suspense fallback={<Loader message="Loading Projects..." />}>
          <Projects />
        </Suspense>
      </motion.section>

      {/* Writing Section */}
      <motion.section 
        id="writing" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        aria-labelledby="writing-heading"
      >
        <Suspense fallback={<Loader message="Loading Writing..." />}>
          <Writing />
        </Suspense>
      </motion.section>

      {/* Resume Section */}
      <motion.section 
        id="resume" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        aria-labelledby="resume-heading"
      >
        <Suspense fallback={<Loader message="Loading Resume..." />}>
          <Resume />
        </Suspense>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        className="contact-section" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        aria-labelledby="contact-heading"
      >
        <Container>
          <h2 id="contact-heading" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 600, textAlign: "center", color: "#ffffff", marginBottom: 0, fontFamily: "'Fira Code', monospace" }}>
            <span style={{ color: '#00ff41' }}>{'>'}</span> contact
          </h2>
          <div className="section-divider-center" aria-hidden="true"></div>
          <Suspense fallback={<Loader message="Loading Contact form..." />}>
            <Contact />
          </Suspense>
        </Container>
      </motion.section>
    </main>
  );
}

export default Home;

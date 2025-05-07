import React from "react";
import { Container } from "react-bootstrap";
import Typewriter from "typewriter-effect";
import Button from "react-bootstrap/Button";
import heroImg from "../../Assets/hero-ai-illustration.png";
import "../../style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import About from "../About/About";
import Projects from "../Projects/Projects";
import Resume from "../Resume/ResumeNew";
import Contact from "../Contact/Contact";
import { motion } from "framer-motion";

function Home() {
  return (
    <>
      <div className="split-hero" id="home">
        <div className="split-left" style={{ alignItems: 'flex-start', textAlign: 'left', paddingLeft: '4vw' }}>
          <h1 className="hero-greeting">Welcome! <span className="wave">👋🏻</span></h1>
          <h2 className="hero-name-gradient" style={{ marginBottom: 0 }}>
            I'M <span className="hero-name-strong">HIMANSHU CHAUDHARY</span>
          </h2>
          <div className="hero-accent-underline" style={{ margin: '1.5rem 0' }}></div>
        </div>
        <img src={heroImg} alt="AI Technology illustration of Himanshu Chaudhary" className="split-center-image" width="180" height="180" />
        <div className="split-right">
          <p className="hero-tagline" style={{ fontSize: '1.3rem', fontWeight: 500, textAlign: 'center', maxWidth: 400 }}>
            Software Engineer II — Building the Future with Code & Intelligence
          </p>
          <div className="typewriter-row" style={{ marginTop: '2rem', fontSize: '1.1rem', color: '#00e6fe', fontWeight: 600, whiteSpace: 'nowrap' }}>
            <Typewriter
              options={{
                strings: [
                  "Generative AI Solutions Architect",
                  "Full Stack Developer",
                  "Cloud-Native Engineer",
                  "Open Source Contributor"
                ],
                autoStart: true,
                loop: true,
                deleteSpeed: 40,
                delay: 60
              }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Button
              as="a"
              className="btn btn-primary download-resume-btn"
              href="/Himanshu_Resume.pdf"
              download
            >
              Download Resume (PDF)
            </Button>
          </div>
        </div>
      </div>
      <motion.section id="about" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}>
        <About />
      </motion.section>
      <motion.section id="projects" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
        <Projects />
      </motion.section>
      <motion.section id="resume" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
        <Resume />
      </motion.section>
      <motion.section id="contact" className="contact-section" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}>
        <Container>
          <h2 className="section-title">Contact</h2>
          <Contact />
        </Container>
      </motion.section>
    </>
  );
}

export default Home;

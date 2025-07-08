import React, { useEffect, Suspense, lazy } from "react";
import { Container } from "react-bootstrap";
import Typewriter from "typewriter-effect";
import Button from "react-bootstrap/Button";
import heroImg from "../../Assets/hero-ai-illustration.png";
import { motion } from "framer-motion";
import { scroller } from "react-scroll";
import Loader from "../Loader";
import { resumeData } from "../../data/resume";

// Lazy load components for better performance
const About = lazy(() => import("../About/About"));
const Projects = lazy(() => import("../Projects/Projects"));
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

function Home() {
  // Generate typewriter strings from resume data
  const typewriterStrings = [
    resumeData.title,
    "Open Source Contributor",
    "Full Stack Developer",
    "Cloud-Native Engineer",
    "Generative AI Solutions Architect",
  ];

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

  // Ensure gradient text is visible - fallback detection
  useEffect(() => {
    const ensureTextVisibility = () => {
      // Get computed style to access CSS custom properties
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = rootStyle.getPropertyValue('--primary-color').trim();
      const textPrimary = rootStyle.getPropertyValue('--text-primary').trim();
      const accentColor = rootStyle.getPropertyValue('--accent-color').trim();
      
      // Handle gradient text elements
      const gradientElements = document.querySelectorAll('.hero-name-gradient');
      
      gradientElements.forEach(element => {
        // Force fallback styling to ensure visibility
        element.style.setProperty('color', primaryColor, 'important');
        
        // Test if gradient is working by checking computed styles
        const computedStyle = window.getComputedStyle(element);
        const webkitTextFillColor = computedStyle.webkitTextFillColor;
        
        // If gradient fails or text is transparent without proper fallback
        if (webkitTextFillColor === 'transparent' || webkitTextFillColor === 'rgba(0, 0, 0, 0)') {
          // Check if gradient background is actually applied
          const hasValidGradient = computedStyle.background && 
                                  computedStyle.background.includes('gradient');
          
          if (!hasValidGradient) {
            // Apply fallback class for solid color
            element.classList.add('fallback');
            element.style.setProperty('background', 'none', 'important');
            element.style.setProperty('-webkit-text-fill-color', primaryColor, 'important');
            element.style.setProperty('color', primaryColor, 'important');
          }
        }
      });

      // Handle all other hero text elements
      const heroElements = document.querySelectorAll('.hero-greeting, .hero-tagline, .typewriter-row, .Typewriter__wrapper');
      
      heroElements.forEach(element => {
        if (element.classList.contains('hero-greeting')) {
          element.style.setProperty('color', textPrimary, 'important');
        } else if (element.classList.contains('hero-tagline')) {
          const textSecondary = rootStyle.getPropertyValue('--text-secondary').trim();
          element.style.setProperty('color', textSecondary, 'important');
        } else {
          element.style.setProperty('color', accentColor, 'important');
        }
      });

      // Also ensure any text inside split-hero is visible
      const splitHeroText = document.querySelectorAll('.split-hero h1, .split-hero h2, .split-hero p, .split-hero span:not(.hero-name-gradient)');
      splitHeroText.forEach(element => {
        if (!element.classList.contains('hero-name-gradient')) {
          element.style.setProperty('color', textPrimary, 'important');
        }
      });
    };

    // Run immediately and after DOM is fully loaded
    ensureTextVisibility();
    
    // Also run after a short delay to catch any late-loading styles
    setTimeout(ensureTextVisibility, 100);
    setTimeout(ensureTextVisibility, 500);
    
    // Run again after typewriter effect might load
    setTimeout(ensureTextVisibility, 1000);
    
    // Listen for theme changes and re-apply colors
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setTimeout(ensureTextVisibility, 50);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="split-hero" id="home" aria-labelledby="hero-heading">
        <div className="split-left" style={{ alignItems: 'flex-start', textAlign: 'left', paddingLeft: '4vw' }}>
          <h1 className="hero-greeting">
            Welcome! <span className="wave" role="img" aria-label="waving hand">👋🏻</span>
          </h1>
          <h2 id="hero-heading" className="hero-name-gradient" style={{ marginBottom: 0 }}>
            I'M <span className="hero-name-strong">{resumeData.name.toUpperCase()}</span>
          </h2>
          <div className="hero-accent-underline" style={{ margin: '1.5rem 0' }} aria-hidden="true"></div>
        </div>
        
        <img 
          src={heroImg} 
          alt={`Professional AI technology illustration representing ${resumeData.name}'s expertise in software engineering and artificial intelligence`}
          className="split-center-image" 
          width="180" 
          height="180"
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            console.warn('Hero image failed to load');
            e.target.style.display = 'none';
          }}
        />
        
        <div className="split-right">
          <p className="hero-tagline" style={{ 
            fontSize: '1.3rem', 
            fontWeight: 500, 
            textAlign: 'center', 
            maxWidth: 400 
          }}>
            {resumeData.title} — Building the Future with Code & Intelligence
          </p>
          
          <div 
            className="typewriter-row" 
            style={{ 
              marginTop: '2rem', 
              fontSize: '1.1rem', 
              color: 'var(--primary-color)', 
              fontWeight: 600, 
              whiteSpace: 'nowrap' 
            }}
            aria-live="polite"
            aria-label="Current role and expertise"
          >
            <Typewriter
              options={{
                strings: typewriterStrings,
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
              download={`${resumeData.name.replace(' ', '_')}_Resume.pdf`}
            >
              Download Resume (PDF)
            </Button>
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
          <h2 id="contact-heading" className="section-title">Contact</h2>
          <Suspense fallback={<Loader message="Loading Contact form..." />}>
            <Contact />
          </Suspense>
        </Container>
      </motion.section>
    </main>
  );
}

export default Home;

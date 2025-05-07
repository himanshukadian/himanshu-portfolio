import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-scroll";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { CgGitFork } from "react-icons/cg";
import { AiFillStar } from "react-icons/ai";
import Button from "react-bootstrap/Button";

function NavBar() {
  const [expand, setExpand] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <Navbar
        expanded={expand}
        fixed="top"
        expand="md"
        className={`navbar modern-navbar ${isDark ? 'dark' : 'light'}`}
        style={{
          backdropFilter: 'blur(12px)',
          background: isDark
            ? 'rgba(24, 24, 32, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderBottom: isDark ? '1px solid #232946' : '1px solid #eaeaea',
          padding: '1.2rem 0.5rem',
          minHeight: 72,
        }}
      >
        <Container>
          <Navbar.Brand as={Link} to="home" className="d-flex align-items-center" style={{ fontWeight: 800, fontSize: 26, letterSpacing: 1.5, color: 'var(--primary-color)' }}>
            HC
          </Navbar.Brand>
          <motion.button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: isDark
                ? 'linear-gradient(90deg, #232946 60%, #00e6fe 100%)'
                : 'linear-gradient(90deg, #00e6fe 60%, #6C63FF 100%)',
              border: 'none',
              borderRadius: 50,
              padding: 8,
              marginLeft: 8,
              boxShadow: '0 2px 8px 0 rgba(44,62,80,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDark ? (
              <FaSun style={{ color: '#ffd600', fontSize: 24 }} />
            ) : (
              <FaMoon style={{ color: '#232946', fontSize: 24 }} />
            )}
          </motion.button>
          <Navbar.Toggle
            aria-controls="responsive-navbar-nav"
            onClick={() => setExpand(expand ? false : "expanded")}
            style={{ border: 'none', background: 'transparent' }}
          >
            <span></span>
            <span></span>
            <span></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto align-items-center" defaultActiveKey="#home">
              <Nav.Item>
                <Nav.Link as={Link} to="home" spy={true} smooth={true} offset={-70} duration={500} className="modern-nav-link">
                  Home
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="about" spy={true} smooth={true} offset={-70} duration={500} className="modern-nav-link">
                  About
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="projects" spy={true} smooth={true} offset={-70} duration={500} className="modern-nav-link">
                  Projects
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="resume" spy={true} smooth={true} offset={-70} duration={500} className="modern-nav-link">
                  Resume
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="contact" spy={true} smooth={true} offset={-70} duration={500} className="modern-nav-link">
                  Contact
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="fork-btn ms-3">
                <Button
                  href="https://github.com/himanshukadian"
                  target="_blank"
                  className="fork-btn-inner"
                  style={{
                    background: 'linear-gradient(90deg, #00e6fe, #6C63FF)',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    boxShadow: '0 2px 8px 0 rgba(44,62,80,0.10)',
                    padding: '0.5rem 1.2rem',
                  }}
                >
                  <CgGitFork style={{ fontSize: "1.2em" }} />{' '}
                  <AiFillStar style={{ fontSize: "1.1em" }} />
                </Button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
}

export default NavBar;

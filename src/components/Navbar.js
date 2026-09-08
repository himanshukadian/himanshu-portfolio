import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import { resumeData } from "../data/resume";
import { ROUTES, scrollToSection, navigateTo } from "../utils/cliNav";

function NavBar() {
  const [expand, setExpand] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const activeLabel = (() => {
    if (location.pathname !== "/") return null;
    const hash = location.hash.toLowerCase();
    if (hash.includes("about")) return "about";
    if (hash.includes("projects")) return "projects";
    if (hash.includes("resume")) return "resume";
    if (hash.includes("contact")) return "contact";
    return "home";
  })();

  const renderItem = (item) => {
    const active = activeLabel === item.label && !item.external;
    const content = (
      <>
        <span className="k9s-item-cursor">{active ? ">" : " "}</span>
        <span className="k9s-item-key">{item.num}</span>
        <span className="k9s-item-label">{item.label}</span>
      </>
    );
    const cls = `modern-nav-link meyriva-nav-link k9s-nav-item ${active ? "active" : ""}`;

    if (item.external) {
      return (
        <Nav.Item key={item.label}>
          <Nav.Link href={item.to} target="_blank" rel="noopener noreferrer" onClick={() => setExpand(false)} className={cls}>
            {content}
          </Nav.Link>
        </Nav.Item>
      );
    }
    if (item.to === "/") {
      return (
        <Nav.Item key={item.label}>
          <Nav.Link
            as={RouterLink}
            to="/"
            onClick={(e) => {
              e.preventDefault();
              setExpand(false);
              navigateTo("/");
            }}
            className={cls}
          >
            {content}
          </Nav.Link>
        </Nav.Item>
      );
    }
    return (
      <Nav.Item key={item.label}>
        <Nav.Link
          href={item.to}
          onClick={(e) => {
            e.preventDefault();
            setExpand(false);
            scrollToSection(item.to.slice(2));
          }}
          className={cls}
        >
          {content}
        </Nav.Link>
      </Nav.Item>
    );
  };

  const dispatchUi = (kind) => (e) => {
    e.preventDefault();
    setExpand(false);
    window.dispatchEvent(new CustomEvent(kind));
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
        expand="lg"
        className="navbar modern-navbar meyriva-navbar"
      >
        <Container fluid className="px-2 px-md-3">
          <Navbar.Brand as={RouterLink} to="/" className="d-flex align-items-center meyriva-brand" style={{ fontFamily: "'Fira Code', monospace" }}>
            {'<'}{getInitials(resumeData.name)}{' />'}
          </Navbar.Brand>
          {isMobile && (
            <Navbar.Toggle
              aria-controls="responsive-navbar-nav"
              onClick={() => setExpand(expand ? false : "expanded")}
              className="meyriva-navbar-toggle"
              aria-label="Toggle navigation"
            >
              <MdMenu className="menu-icon" style={{ display: 'inline-block', fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.95)' }} />
            </Navbar.Toggle>
          )}
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto align-items-center k9s-nav">
              {ROUTES.filter((r) => r.num !== "g").map(renderItem)}
            </Nav>
            <Nav className="align-items-center k9s-nav k9s-nav-right">
              <Nav.Item className="k9s-nav-extra">
                <Nav.Link href={resumeData.github} target="_blank" rel="noopener noreferrer" onClick={() => setExpand(false)} className="modern-nav-link meyriva-nav-link k9s-nav-item">
                  <span className="k9s-item-cursor"> </span>
                  <span className="k9s-item-key">g</span>
                  <span className="k9s-item-label">github</span>
                  <span className="k9s-item-suffix">↗</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="k9s-nav-extra">
                <Nav.Link href="#terminal" onClick={dispatchUi("k9s:command")} className="modern-nav-link meyriva-nav-link k9s-nav-item">
                  <span className="k9s-item-cursor"> </span>
                  <span className="k9s-item-key">/</span>
                  <span className="k9s-item-label">terminal</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
}

export default NavBar;
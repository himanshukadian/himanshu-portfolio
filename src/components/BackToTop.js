import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Throttle function to improve scroll performance
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const BackToTop = ({ 
  threshold = 300, 
  scrollBehavior = "smooth",
  className = "",
  "aria-label": ariaLabel = "Scroll back to top of page"
}) => {
  const [visible, setVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const buttonRef = useRef(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(
    throttle(() => {
      const shouldShow = window.scrollY > threshold;
      setVisible(shouldShow);
    }, 100),
    [threshold]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ 
      top: 0, 
      behavior: scrollBehavior 
    });

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = 'Scrolled to top of page';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [scrollBehavior]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  }, [scrollToTop]);

  // Button styles
  const buttonStyles = {
    position: "fixed",
    bottom: "2.5rem",
    right: "2.5rem",
    zIndex: 9999,
    background: "linear-gradient(90deg, var(--primary-color), var(--secondary-color))",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
    fontSize: "1.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease-in-out",
  };

  // Animation variants
  const buttonVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } : {
    hidden: { 
      opacity: 0,
      scale: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    hover: {
      scale: 1.1,
      boxShadow: "0 6px 20px 0 rgba(0, 0, 0, 0.25)",
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          ref={buttonRef}
          className={`back-to-top-btn ${className}`}
          onClick={scrollToTop}
          onKeyDown={handleKeyDown}
          style={buttonStyles}
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          whileHover={!prefersReducedMotion ? "hover" : undefined}
          whileTap={!prefersReducedMotion ? "tap" : undefined}
          aria-label={ariaLabel}
          type="button"
          tabIndex={0}
        >
          <span aria-hidden="true">↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop; 
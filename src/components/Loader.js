import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ 
  message = "Loading your portfolio...", 
  testId = "portfolio-loader" 
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browser support
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Simplified animation for reduced motion
  const reducedMotionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Full animation for users who prefer motion
  const fullMotionVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: 1,
      scale: [1, 1.2, 1.2, 1, 1],
      rotate: [0, 0, 180, 180, 0],
      borderRadius: ["20%", "20%", "50%", "50%", "20%"],
    },
    exit: { opacity: 0, scale: 0.5 }
  };

  const animationConfig = prefersReducedMotion ? {
    variants: reducedMotionVariants,
    transition: { duration: 0.3 }
  } : {
    variants: fullMotionVariants,
    transition: {
      duration: 2,
      ease: "easeInOut",
      times: [0, 0.2, 0.5, 0.8, 1],
      repeat: Infinity,
      repeatDelay: 1
    }
  };

  return (
    <div 
      className="loader-container"
      role="status"
      aria-live="polite"
      aria-label="Page is loading"
      data-testid={testId}
    >
      <motion.div
        key="loader-spinner"
        className="loader"
        initial="initial"
        animate="animate"
        exit="exit"
        {...animationConfig}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
        className="loader-text"
        id="loader-message"
      >
        {message}
      </motion.div>
      
      {/* Screen reader announcement */}
      <div className="sr-only">
        Loading application content, please wait...
      </div>
    </div>
  );
};

export default Loader; 
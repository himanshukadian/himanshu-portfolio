import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

// Safe localStorage operations with error handling
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage access failed:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage save failed:', error);
    }
  }
};

// Check system theme preference with fallback
const getSystemTheme = () => {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
  } catch (error) {
    console.warn('matchMedia not supported:', error);
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = safeLocalStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : getSystemTheme();
  });

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    let mediaQuery;
    
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        // Only update if user hasn't manually set a preference
        const savedTheme = safeLocalStorage.getItem('theme');
        if (!savedTheme) {
          setIsDark(e.matches);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        // Legacy browsers
        mediaQuery.addListener(handleSystemThemeChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    } catch (error) {
      console.warn('System theme detection not available:', error);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      try {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        safeLocalStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', isDark ? '#232946' : '#00e6fe');
        }

        // Dispatch custom event for other components that might need to know
        window.dispatchEvent(new CustomEvent('themechange', { 
          detail: { isDark } 
        }));
      } catch (error) {
        console.warn('Theme application failed:', error);
      }
    };

    applyTheme();
  }, [isDark]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isDark,
    toggleTheme,
    theme: isDark ? 'dark' : 'light'
  }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 
import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CommandPalette from "./components/CommandPalette";
import HostTerminal from "./components/HostTerminal";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import SEO from "./components/SEO";
import ChatWidget from "./components/Chat/ChatWidget";
import { ThemeProvider } from './context/ThemeContext';
import { initEvals } from './utils/guardrails';
import "./style.css";
import "./blog.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./no-hover.css";
import NotFound from "./components/NotFound";
import BackToTop from "./components/BackToTop";
import SectionDots from "./components/SectionDots";
import { HelmetProvider } from 'react-helmet-async';

// Single lazy-loaded Home component that contains all sections
const Home = lazy(() => import("./components/Home/Home"));

// True when this app instance is running inside a frame (i.e. the embedded
// copy of the portfolio shown inside the top-level terminal window).
const IS_EMBEDDED = (() => {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch (e) {
    return true;
  }
})();

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null 
    };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store error details
    this.setState({
      error: error.message,
      errorInfo: errorInfo.componentStack,
      eventId: `error_${Date.now()}`
    });

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with services like Sentry, LogRocket, etc.
      console.error('Production error logged:', errorDetails);
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          marginTop: '50px',
          maxWidth: '600px',
          margin: '50px auto',
          fontFamily: "'Fira Code', monospace",
          background: '#000',
          color: '#fff'
        }}>
          <h1 style={{ 
            color: '#ff0000', 
            marginBottom: '20px',
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            {'>'} FATAL ERROR
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            marginBottom: '30px',
            fontSize: '0.85rem',
            lineHeight: '1.7'
          }}>
            {'>'} An unexpected error occurred.<br />
            {'>'} This has been logged to console.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              textAlign: 'left', 
              marginBottom: '30px',
              background: 'rgba(255,0,0,0.05)',
              padding: '20px',
              borderRadius: '4px',
              border: '1px solid rgba(255,0,0,0.2)'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 500,
                marginBottom: '10px',
                color: '#ff0000'
              }}>
                {'>'} error.details
              </summary>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{this.state.error}</p>
              <pre style={{ 
                fontSize: '0.75rem', 
                overflow: 'auto',
                background: '#000',
                padding: '10px',
                border: '1px solid rgba(255,0,0,0.2)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                {this.state.errorInfo}
              </pre>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{this.state.eventId}</p>
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={this.handleReload}
              style={{
                padding: '0.7rem 1.5rem', 
                background: 'transparent', 
                color: '#00ff41', 
                border: '1px solid #00ff41', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 400,
                fontFamily: "'Fira Code', monospace",
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(0,255,65,0.1)'; e.target.style.boxShadow = '0 0 12px rgba(0,255,65,0.2)'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.boxShadow = 'none'; }}
            >
              {'>'} retry
            </button>
            <button 
              onClick={this.handleGoHome}
              style={{
                padding: '0.7rem 1.5rem', 
                background: 'transparent', 
                color: 'rgba(255,255,255,0.6)', 
                border: '1px solid rgba(255,255,255,0.15)', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 400,
                fontFamily: "'Fira Code', monospace",
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseOut={(e) => { e.target.style.color = 'rgba(255,255,255,0.6)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              {'>'} cd /home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Network Status Component
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Apply offline class to body
    if (!isOnline) {
      document.body.classList.add('offline');
    } else {
      document.body.classList.remove('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div className="offline-indicator" role="alert" aria-live="assertive">
        <span className="offline-indicator-tag">[ WARN ]</span>{' '}
        You&apos;re currently offline. Some features may not work properly.
      </div>
    );
  }

  return null;
};

// The embedded (plain) copy of the portfolio shown inside the terminal window.
// No boot loader, no terminal chrome — just the full site.
function PlainSite() {
  return (
    <div className="App">
      {/* Skip Navigation for Accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      
      <NetworkStatus />
      <Navbar />
      <CommandPalette />
      <BackToTop />
      <SectionDots />
      <ChatWidget />
      <ErrorBoundary>
        <ScrollToTop />
        <main id="main-content" tabIndex="-1">
          <Suspense fallback={<Loader message="Loading portfolio..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

// Top-level default view: a big terminal window with the complete portfolio
// running inside it.
function TerminalDesktop() {
  const [loaded, setLoaded] = useState(false);
  const siteIframeRef = useRef(null);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '/';

  return (
    <div className="terminal-desktop">
      <div className="terminal-desktop-window">
        <div className="resume-terminal-titlebar">
          <div className="resume-terminal-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="resume-terminal-title">portfolio@himanshu:~/portfolio — bash — 110×40</div>
        </div>
        <div className="terminal-desktop-body">
          {!loaded && (
            <div className="resume-terminal-boot" aria-hidden="true">
              <span style={{ color: '#00ff41' }}>{'>'}</span> loading complete portfolio
              <span className="resume-terminal-cursor"></span>
            </div>
          )}
          <iframe
            ref={siteIframeRef}
            src={siteUrl}
            title="Complete portfolio running inside terminal window"
            className="terminal-desktop-iframe"
            onLoad={() => setLoaded(true)}
          />
          <div className="resume-terminal-scanlines" aria-hidden="true"></div>
        </div>
      </div>
      <HostTerminal siteIframeRef={siteIframeRef} />
    </div>
  );
}

// Boot loader screen. Holds the BIOS sequence on screen for 6400ms, then shows
// the terminal window. Embedded copies skip the boot entirely.
function Shell() {
  const [bootComplete, setBootComplete] = useState(IS_EMBEDDED);

  useEffect(() => {
    if (IS_EMBEDDED) return;
    const timer = setTimeout(() => setBootComplete(true), 6400);
    return () => clearTimeout(timer);
  }, []);

  if (IS_EMBEDDED) {
    return <PlainSite />;
  }

  if (!bootComplete) {
    return (
      <div className="App">
        <Loader message="Loading portfolio..." />
      </div>
    );
  }

  return <TerminalDesktop />;
}

function App() {
  initEvals({ parent: true });
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <Router>
            <SEO />
            <Shell />
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
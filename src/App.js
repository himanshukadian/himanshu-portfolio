import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import SEO from "./components/SEO";
import ChatWidget from "./components/Chat/ChatWidget";
import { ThemeProvider } from './context/ThemeContext';
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NotFound from "./components/NotFound";
import BackToTop from "./components/BackToTop";
import { HelmetProvider } from 'react-helmet-async';

// Single lazy-loaded Home component that contains all sections
const Home = lazy(() => import("./components/Home/Home"));

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

  static getDerivedStateFromError(error) {
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
          fontFamily: "'Inter', 'Poppins', Arial, sans-serif"
        }}>
          <h1 style={{ 
            color: '#ff4444', 
            marginBottom: '20px',
            fontSize: '2.5rem' 
          }}>
            Oops! Something went wrong
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '30px',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              textAlign: 'left', 
              marginBottom: '30px',
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginBottom: '10px' 
              }}>
                Error Details (Development)
              </summary>
              <p><strong>Error:</strong> {this.state.error}</p>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto',
                background: '#ffffff',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {this.state.errorInfo}
              </pre>
              <p><strong>Error ID:</strong> {this.state.eventId}</p>
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={this.handleReload}
              style={{
                padding: '12px 24px', 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#0056b3'}
              onMouseOut={(e) => e.target.style.background = '#007bff'}
            >
              🔄 Reload Page
            </button>
            <button 
              onClick={this.handleGoHome}
              style={{
                padding: '12px 24px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#1e7e34'}
              onMouseOut={(e) => e.target.style.background = '#28a745'}
            >
              🏠 Go Home
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
        📶 You're currently offline. Some features may not work properly.
      </div>
    );
  }

  return null;
};

function AppContent() {
  return (
    <div className="App">
      {/* Skip Navigation for Accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      
      <NetworkStatus />
      <Navbar />
      <BackToTop />
      <ChatWidget />
      <Suspense fallback={<Loader message="Loading portfolio..." />}>
        <ErrorBoundary>
          <ScrollToTop />
          <main id="main-content" tabIndex="-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </Suspense>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <Router>
            <SEO />
            <AppContent />
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

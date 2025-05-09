import { useEffect } from 'react';

// Web Vitals
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Custom Performance Hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const timing = window.performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      console.log(`Page Load Time: ${pageLoadTime}ms`);
    });

    // Monitor memory usage
    if (window.performance.memory) {
      setInterval(() => {
        const memory = window.performance.memory;
        console.log(`Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
      }, 5000);
    }

    // Monitor network requests
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            console.log(`API Call to ${entry.name} took ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }

    return () => {
      // Cleanup
      if ('PerformanceObserver' in window) {
        PerformanceObserver.disconnect();
      }
    };
  }, []);
};

// Image Loading Performance
export const optimizeImageLoading = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now();
      resolve({ success: true, loadTime });
    };
    
    img.onerror = () => {
      reject({ success: false, error: 'Image failed to load' });
    };
    
    img.src = imageUrl;
  });
};

// Performance Metrics Collection
export const collectMetrics = () => {
  const metrics = {
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
    } : null,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };

  return metrics;
}; 
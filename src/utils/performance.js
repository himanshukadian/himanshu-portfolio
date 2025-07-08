import { useEffect, useRef, useCallback } from 'react';

// Web Vitals with error handling
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        try {
          getCLS(onPerfEntry);
          getFID(onPerfEntry);
          getFCP(onPerfEntry);
          getLCP(onPerfEntry);
          getTTFB(onPerfEntry);
        } catch (error) {
          console.warn('Error collecting web vitals:', error);
        }
      })
      .catch((error) => {
        console.warn('Failed to load web-vitals library:', error);
      });
  }
};

// Enhanced Performance Monitoring Hook with Proper Cleanup
export const usePerformanceMonitoring = (options = {}) => {
  const {
    enableMemoryMonitoring = false,
    memoryCheckInterval = 30000, // 30 seconds instead of 5
    enableNetworkMonitoring = true,
    enablePageLoadMetrics = true
  } = options;

  const observerRef = useRef(null);
  const memoryIntervalRef = useRef(null);

  const logPageLoadMetrics = useCallback(() => {
    if (!enablePageLoadMetrics) return;

    try {
      // Use Navigation Timing API (modern approach)
      if ('performance' in window && 'getEntriesByType' in window.performance) {
        const navigationEntries = window.performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navigation = navigationEntries[0];
          const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          
          console.log(`Page Load Time: ${Math.round(pageLoadTime)}ms`);
          console.log(`DOM Content Loaded: ${Math.round(domContentLoaded)}ms`);
        }
      } else if (window.performance?.timing) {
        // Fallback to deprecated timing API
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page Load Time (legacy): ${pageLoadTime}ms`);
      }
    } catch (error) {
      console.warn('Error collecting page load metrics:', error);
    }
  }, [enablePageLoadMetrics]);

  useEffect(() => {
    // Page load metrics
    if (enablePageLoadMetrics) {
      if (document.readyState === 'complete') {
        logPageLoadMetrics();
      } else {
        window.addEventListener('load', logPageLoadMetrics, { once: true });
      }
    }

    // Memory monitoring with proper cleanup
    if (enableMemoryMonitoring && window.performance?.memory) {
      const logMemoryUsage = () => {
        try {
          const memory = window.performance.memory;
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
          const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
          
          console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
          
          // Warn if memory usage is high
          if (usedMB > limitMB * 0.8) {
            console.warn('High memory usage detected');
          }
        } catch (error) {
          console.warn('Error collecting memory metrics:', error);
        }
      };

      memoryIntervalRef.current = setInterval(logMemoryUsage, memoryCheckInterval);
    }

    // Network monitoring with proper cleanup
    if (enableNetworkMonitoring && 'PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
              const duration = Math.round(entry.duration);
              const size = entry.transferSize ? ` (${Math.round(entry.transferSize / 1024)}KB)` : '';
              console.log(`API Call: ${entry.name} took ${duration}ms${size}`);
              
              // Warn about slow requests
              if (duration > 3000) {
                console.warn(`Slow API call detected: ${entry.name} took ${duration}ms`);
              }
            }
          });
        });

        observerRef.current.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Error setting up performance observer:', error);
      }
    }

    // Cleanup function
    return () => {
      // Clear memory monitoring interval
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
        memoryIntervalRef.current = null;
      }

      // Disconnect performance observer
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
          observerRef.current = null;
        } catch (error) {
          console.warn('Error disconnecting performance observer:', error);
        }
      }

      // Remove load event listener if still pending
      window.removeEventListener('load', logPageLoadMetrics);
    };
  }, [enableMemoryMonitoring, memoryCheckInterval, enableNetworkMonitoring, logPageLoadMetrics]);
};

// Enhanced Image Loading Performance with Error Handling
export const optimizeImageLoading = (imageUrl, options = {}) => {
  const { 
    timeout = 10000,
    retries = 1,
    onProgress = null 
  } = options;

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attemptLoad = () => {
      attempts++;
      const img = new Image();
      const startTime = performance.now();

      const timeoutId = setTimeout(() => {
        reject({ 
          success: false, 
          error: 'Image load timeout',
          attempts,
          url: imageUrl 
        });
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        const loadTime = performance.now() - startTime;
        
        resolve({ 
          success: true, 
          loadTime: Math.round(loadTime),
          attempts,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          url: imageUrl
        });
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        
        if (attempts < retries + 1) {
          setTimeout(attemptLoad, 1000 * attempts); // Exponential backoff
        } else {
          reject({ 
            success: false, 
            error: 'Image failed to load after retries',
            attempts,
            url: imageUrl 
          });
        }
      };

      if (onProgress && typeof onProgress === 'function') {
        onProgress({ attempts, url: imageUrl });
      }

      img.src = imageUrl;
    };

    attemptLoad();
  });
};

// Enhanced Performance Metrics Collection
export const collectMetrics = () => {
  try {
    const metrics = {
      // Device capabilities
      deviceMemory: navigator.deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      
      // Connection information
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null,
      
      // Viewport information
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      
      // Performance timing
      timing: (() => {
        if (window.performance?.timing) {
          const timing = window.performance.timing;
          return {
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            domComplete: timing.domComplete - timing.navigationStart
          };
        }
        return null;
      })(),
      
      // Memory information (if available)
      memory: window.performance?.memory ? {
        used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      
      // User preferences
      preferences: {
        prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false,
        prefersColorScheme: window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
      },
      
      // Timestamp
      timestamp: new Date().toISOString()
    };

    return metrics;
  } catch (error) {
    console.warn('Error collecting performance metrics:', error);
    return {
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    };
  }
}; 
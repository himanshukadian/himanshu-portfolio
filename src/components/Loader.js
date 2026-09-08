import React, { useEffect, useState } from 'react';

const Loader = ({ 
  message = "Loading...", 
  testId = "portfolio-loader" 
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [progress, setProgress] = useState(0);

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

  // Boot sequence with per-step delays (ms). Timings vary like a real kernel boot.
  useEffect(() => {
    const bootSteps = [
      { text: "loading window",                                            delay: 500 },
      { text: "> system.boot()",                                           delay: 600 },
      { text: "",                                                          delay: 300 },
      { text: "Initializing portfolio...",                                 delay: 700 },
      { text: "Loading experience..................... OK",                 delay: 600 },
      { text: "Loading projects...................... OK",                 delay: 600 },
      { text: "Loading profile....................... OK",                 delay: 600 },
      { text: "Welcome to Himanshu's Portfolio",                           delay: 400 },
    ];

    if (prefersReducedMotion) {
      setBootLines(bootSteps.map(s => s.text));
      setProgress(100);
      return;
    }

    let index = 0;
    let cancelled = false;

    const reveal = () => {
      if (cancelled) return;
      const step = bootSteps[index];
      setBootLines(prev => [...prev, step.text]);
      setProgress(Math.round(((index + 1) / bootSteps.length) * 100));
      index++;
      if (index < bootSteps.length) {
        setTimeout(reveal, step.delay);
      } else {
        setProgress(100);
      }
    };

    reveal();

    return () => { cancelled = true; };
  }, [prefersReducedMotion]);

  // Colorize trailing boot markers
  const renderLine = (line, isLast) => {
    const okMatch = /\sOK$/.test(line);
    const sysBootMatch = line.trim() === '> system.boot()';

    if (okMatch) {
      const idx = line.indexOf('OK');
      return (
        <>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{line.slice(0, idx)}</span>
          <span style={{ color: '#00ff41' }}>OK</span>
        </>
      );
    }
    if (sysBootMatch) {
      return (
        <>
          <span style={{ color: '#00ff41' }}>{line}</span>
        </>
      );
    }
    if (isLast) {
      return <span style={{ color: '#00ff41', fontWeight: 400 }}>{line}</span>;
    }
    return line;
  };

  return (
    <div 
      className="loader-container"
      role="status"
      aria-live="polite"
      aria-label="Page is loading"
      data-testid={testId}
      style={{
        background: '#000000',
        fontFamily: "'Fira Code', monospace",
        color: '#00ff41',
        padding: '2rem',
        fontSize: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}
    >
      {/* Terminal window */}
      <div className="loader-terminal" style={{
        position: 'relative',
        border: '1px solid rgba(0, 255, 65, 0.25)',
        borderRadius: '4px',
        padding: '1.5rem 1.75rem 1.25rem',
        maxWidth: '540px',
        width: '100%',
        background: 'rgba(0, 255, 65, 0.02)',
        boxShadow: '0 0 40px rgba(0, 255, 65, 0.08), inset 0 0 30px rgba(0, 255, 65, 0.02)',
        overflow: 'hidden'
      }}>
        {/* CRT scanlines overlay */}
        <div className="loader-scanlines" aria-hidden="true"></div>

        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.75rem',
          marginBottom: '0.75rem',
          borderBottom: '1px solid rgba(0, 255, 65, 0.15)'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>himanshu@portfolio:~$ ./boot.sh</span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>
            [ {progress}% ]
          </span>
        </div>

        {/* Boot lines */}
        <div style={{ textAlign: 'left', minHeight: '11rem' }}>
          {bootLines.map((line, i) => (
            <div
              key={i}
              style={{
                marginBottom: '0.22rem',
                fontSize: '0.74rem',
                lineHeight: '1.45',
                color: 'rgba(255,255,255,0.55)',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word'
              }}
            >
              {renderLine(line, i === bootLines.length - 1 && progress >= 100)}
            </div>
          ))}

          {/* Prompt + blinking cursor at end of queue */}
          <div style={{ marginTop: '0.6rem', color: '#00ff41' }}>
            <span>{'>'}</span>
            <span className="blinking-cursor" style={{
              display: 'inline-block',
              marginLeft: '3px',
              background: '#00ff41',
              width: '0.6em',
              height: '0.9em',
              verticalAlign: 'text-bottom',
              boxShadow: '0 0 6px #00ff41'
            }}></span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: '0.9rem',
              width: '100%',
              height: '2px',
              background: 'rgba(0, 255, 65, 0.12)',
              overflow: 'hidden'
            }}
            aria-hidden="true"
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: '#00ff41',
                boxShadow: '0 0 8px #00ff41',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading message with blinking cursor */}
      <div
        style={{
          color: '#00ff41',
          fontFamily: "'Fira Code', monospace",
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          marginTop: '1.25rem',
          textAlign: 'center'
        }}
      >
        {message}
        <span className="blinking-cursor" style={{
          display: 'inline-block',
          marginLeft: '3px',
          background: '#00ff41',
          width: '0.6em',
          height: '0.9em',
          verticalAlign: 'text-bottom'
        }}></span>
      </div>

      <div className="sr-only">
        Loading application content, please wait...
      </div>
    </div>
  );
};

export default Loader;
'use client';
import { useState, useEffect, useRef } from 'react';
import { Terminal, Code, Sliders, CheckCircle2, AlertTriangle, Cpu, Gauge } from 'lucide-react';

export default function BrowserMockup() {
  const [score, setScore] = useState(35);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showHandHint, setShowHandHint] = useState(true);

  const containerRef = useRef(null);

  // Viewport intersection observer to trigger animation on scroll
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
          setScore(35);
          setHasAnimated(false);
          setIsAutoPlaying(true);
          setShowHandHint(true);
        }
      });
    }, { 
      threshold: 0.4,
      rootMargin: '0px 0px -100px 0px'
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // One-time build-up animation when scrolled into view
  useEffect(() => {
    if (!inView || hasAnimated || !isAutoPlaying) return;
    
    let current = 35;
    const interval = setInterval(() => {
      if (current < 100) {
        current += 2;
        if (current > 100) current = 100;
        setScore(current);
      } else {
        clearInterval(interval);
        setIsAutoPlaying(false);
        setHasAnimated(true);
        // Fade out hand helper after a short delay once complete
        setTimeout(() => {
          setShowHandHint(false);
        }, 1500);
      }
    }, 20); // ~0.6s total build time

    return () => clearInterval(interval);
  }, [inView, hasAnimated, isAutoPlaying]);

  // Stops auto-play instantly upon user interaction
  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    setHasAnimated(true);
    setShowHandHint(false);
  };

  // Dynamic calculations based on score
  const getScoreColor = (val) => {
    if (val < 50) return '#ef4444'; // Red
    if (val < 90) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const loadTime = ((100 - score) * 0.043 + 0.1).toFixed(2);
  const bundleSize = Math.round((100 - score) * 11.8 + 14);
  const scoreColor = getScoreColor(score);

  // Circular gauge settings
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Sync hand coordinates with the slider track percentage
  const handLeft = `calc(${((score - 35) / 65) * 100}% - 10px)`;

  return (
    <section ref={containerRef} style={{ padding: '5rem 0', position: 'relative', overflow: 'hidden' }} className="reveal-on-scroll">
      <div className="container">
        
        {/* Visual Showcase Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center' }} className="mockup-grid">
          
          {/* Left Description Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.9rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '100px', color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', width: 'fit-content' }}>
              <Gauge size={12} style={{ marginRight: '6px' }} /> Performance Analyzer
            </div>
            
            <h2 className="section-title" style={{ textAlign: 'left', fontSize: '2.5rem' }}>
              Built For Speed. <span>Optimized</span> For SEO.
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem' }}>
              Heavy website builders slow down pages and hurt search rank. Our WordPress and static templates use clean, ultra-lightweight files to load instantly.
            </p>
            
            {/* Features bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {[
                { title: 'Google PageSpeed 100/100', desc: 'Our templates score full marks on performance tests, keeping your visitors happy and busy.' },
                { title: 'Ultra-Lightweight Code', desc: 'No heavy scripts or massive layouts. Just the clean files you need to start your business.' },
                { title: 'Higher Search Rankings', desc: 'Google prioritizes fast loading websites. Getting a 100% speed score helps you get found online.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                   <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }}>
                    <Code size={12} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{item.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Mock Sandbox Element Wrapper */}
          <div style={{ position: 'relative' }}>
            
            {/* Spotlight glow reflecting current speed color */}
            <div 
              style={{ 
                position: 'absolute', 
                top: '-30px', 
                left: '-30px', 
                right: '-30px', 
                bottom: '-30px', 
                background: `radial-gradient(circle, ${scoreColor}1c 0%, transparent 70%)`, 
                pointerEvents: 'none', 
                filter: 'blur(45px)',
                opacity: 0.85,
                transition: 'background 0.3s ease'
              }} 
            />

            {/* Simulated browser window viewport */}
            <div 
              style={{ 
                background: '#07070e', 
                border: '1px solid var(--border-color)', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)', 
                position: 'relative', 
                zIndex: 2, 
                height: '380px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: 'center'
              }}
            >
              {/* Performance Indicator dashboard layout */}
              <div 
                onMouseEnter={stopAutoPlay}
                onTouchStart={stopAutoPlay}
                style={{
                  width: '300px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: `0 30px 60px rgba(0, 0, 0, 0.35)`,
                  position: 'relative',
                  zIndex: 3,
                  cursor: 'pointer'
                }}
              >
                {/* Dashboard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Cpu size={14} style={{ color: scoreColor, transition: 'color 0.3s ease' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance Analyzer</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mobile Test</span>
                </div>

                {/* Score Dial and Metrics Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                  {/* Circular Speed Gauge */}
                  <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyIndex: 'center' }}>
                    <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth={strokeWidth}
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        fill="transparent"
                        stroke={scoreColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.3s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{score}</span>
                      <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Score</span>
                    </div>
                  </div>

                  {/* Metrics details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>LOAD TIME</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: scoreColor, transition: 'color 0.3s ease' }}>{loadTime}s</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>BUNDLE SIZE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{bundleSize} KB</div>
                    </div>
                  </div>
                </div>

                {/* Performance Audits checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {/* Audit 1: Unused JavaScript code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    {score >= 90 ? (
                      <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                    ) : (
                      <AlertTriangle size={13} style={{ color: '#ef4444' }} />
                    )}
                    <span style={{ fontSize: '0.7rem', color: score >= 90 ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                      {score >= 90 ? '0KB bloated scripts (fully optimized)' : `${Math.round((100 - score) * 8.5)}KB bloated framework files`}
                    </span>
                  </div>

                  {/* Audit 2: Layout Shift shifts */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    {score >= 80 ? (
                      <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                    ) : (
                      <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
                    )}
                    <span style={{ fontSize: '0.7rem', color: score >= 80 ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                      {score >= 80 ? '0.00 CLS (Zero layout shifting)' : `${((100 - score) * 0.006).toFixed(2)} CLS (Sluggish shifts detected)`}
                    </span>
                  </div>
                </div>

                {/* Integrated Speed Slider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Simulate Code Quality</span>
                    <span style={{ color: scoreColor, fontWeight: 700, transition: 'color 0.3s ease' }}>{score}%</span>
                  </div>

                  {/* Drag hand indicator helper */}
                  <span 
                    className="drag-hint-hand"
                    style={{ 
                      opacity: showHandHint ? 1 : 0,
                      visibility: showHandHint ? 'visible' : 'hidden',
                      left: handLeft
                    }}
                  >
                    👆
                  </span>

                  <input 
                    type="range" 
                    min="35" 
                    max="100" 
                    value={score}
                    onChange={(e) => {
                      stopAutoPlay();
                      setScore(Number(e.target.value));
                    }}
                    onMouseDown={stopAutoPlay}
                    style={{ 
                      width: '100%', 
                      accentColor: scoreColor, 
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.1)',
                      height: '4px',
                      borderRadius: '99px',
                      outline: 'none',
                      transition: 'accent-color 0.3s ease'
                    }} 
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

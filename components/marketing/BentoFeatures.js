'use client';
import { ShieldCheck, Zap, Coins, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Odometer digit roller for smooth 60fps stats
function OdometerDigit({ value }) {
  const num = parseInt(value, 10);
  const isNumber = !isNaN(num);

  return (
    <span style={{
      display: 'inline-block',
      height: '1.2em',
      overflow: 'hidden',
      lineHeight: '1.2em',
      position: 'relative',
      width: '0.62em',
      textAlign: 'center'
    }}>
      {isNumber ? (
        <span style={{
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(-${num * 10}%)`,
          transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <span key={n} style={{ height: '1.2em' }}>{n}</span>
          ))}
        </span>
      ) : (
        <span>{value}</span>
      )}
    </span>
  );
}

function Odometer({ value }) {
  const digits = String(value).split('');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {digits.map((d, i) => (
        <OdometerDigit key={i} value={d} />
      ))}
    </span>
  );
}

// Spotlight cursor glow wrapper component
function BentoGlowCard({ children, className = '', style = {}, ...props }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden'
      }}
      {...props}
    >
      {/* Spotlight Cursor Glow Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
          zIndex: 1,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease'
        }}
      />
      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

export default function BentoFeatures() {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadState, setDownloadState] = useState('loading'); // 'loading', 'success'
  const [score, setScore] = useState(0);
  const [visible, setVisible] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const sectionRef = useRef(null);

  // Live Exchange Rates State
  const [rates, setRates] = useState({ SOL: 142.34, ETH: 3524.80, BTC: 67842.10 });
  const [flash, setFlash] = useState({ SOL: false, ETH: false, BTC: false });

  // Animate mock file download progress bar in the Bento grid
  useEffect(() => {
    if (downloadState !== 'loading') return;
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          setDownloadState('success');
          clearInterval(interval);
          // Restart cycle after 4 seconds
          setTimeout(() => {
            setDownloadState('loading');
            setDownloadProgress(0);
          }, 4000);
          return 100;
        }
        return prev + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [downloadState]);

  // Live Rates Tick Animation
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const coinToUpdate = ['SOL', 'ETH', 'BTC'][Math.floor(Math.random() * 3)];
      const deltaPercent = (Math.random() * 0.08 - 0.04) / 100; // ±0.04%
      setRates(prev => {
        const nextVal = prev[coinToUpdate] * (1 + deltaPercent);
        return {
          ...prev,
          [coinToUpdate]: parseFloat(nextVal.toFixed(2))
        };
      });
      setFlash(prev => ({ ...prev, [coinToUpdate]: true }));
      setTimeout(() => {
        setFlash(prev => ({ ...prev, [coinToUpdate]: false }));
      }, 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

  // Intersection Observer to start animations when scrolled into view
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
        } else {
          setVisible(false);
          setScore(0); // reset score on exit
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    });

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // PageSpeed counter animation trigger
  useEffect(() => {
    if (!visible) return;

    let start = 0;
    const end = 99;
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progressPercent = Math.min(elapsed / duration, 1);

      // Ease out quad
      const easeProgress = progressPercent * (2 - progressPercent);
      const currentScore = Math.floor(easeProgress * end);

      setScore(currentScore);

      if (progressPercent < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [visible]);

  return (
    <section id="how-it-works" ref={sectionRef} style={{ padding: '8rem 0', position: 'relative' }} className="reveal-on-scroll">
      <div className="container">

        {/* Section Header */}
        <div style={{ marginBottom: '4.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.9rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '100px', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <Sparkles size={12} style={{ marginRight: '6px' }} /> Super Fast Websites
          </div>
          <h2 className="section-title">
            Loads Instantly. <span>Works</span> Everywhere.
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
            We build templates that load in less than a second to keep your visitors happy and secure.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="bento-grid">

          {/* Card 1: 2x1 Span - Instant delivery & storage */}
          <BentoGlowCard className="bento-card bento-span-2">
            <div className="bento-content">
              <ShieldCheck size={32} color="var(--primary)" />
              <h3 className="bento-title">Instant Delivery</h3>
              <p className="bento-desc">
                Buy a website template and get your files instantly. We send a secure download link straight to your email inbox so you don't have to wait.
              </p>
            </div>
            {/* Visual element: Mock secure download widget */}
            <div className="bento-visual">
              <div className="mock-download-widget">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>AstraGlow-Theme.zip</span>
                  <span style={{ fontWeight: 600, color: downloadState === 'success' ? 'var(--accent-emerald)' : 'var(--text-main)', transition: 'color 0.3s ease' }}>
                    {downloadState === 'success' ? 'Verified' : `${downloadProgress}%`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${downloadProgress}%`,
                      height: '100%',
                      background: downloadState === 'success' ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--primary), var(--accent-cyan))',
                      borderRadius: '99px',
                      transition: downloadState === 'success' ? 'background 0.5s ease' : 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.7rem', color: downloadState === 'success' ? 'var(--accent-emerald)' : 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: downloadState === 'success' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.4)', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                  {downloadState === 'success' ? 'Verified Safe & Clean' : 'Checking template files...'}
                </div>
              </div>
            </div>
          </BentoGlowCard>

          {/* Card 2: 1x1 Span - Zero Gas / Fees */}
          <BentoGlowCard className="bento-card">
            <div className="bento-content">
              <Zap size={32} color="var(--accent-amber)" />
              <h3 className="bento-title">No Hidden Fees</h3>
              <p className="bento-desc">
                Pay directly from your wallet and save money. No extra card processing charges or middleman fees.
              </p>
            </div>
            {/* Visual element: comparison bar chart */}
            <div className="bento-visual" style={{ padding: '1.5rem 0 0 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Processor Fee Comparison:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', width: '45px', color: 'var(--text-muted)' }}>Stripe</span>
                  <div
                    style={{
                      height: '12px',
                      width: visible ? '80%' : '0%',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderRadius: '4px',
                      position: 'relative',
                      transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.65rem',
                      color: '#ef4444',
                      fontWeight: 600,
                      opacity: visible ? 1 : 0,
                      transition: 'opacity 0.4s ease 0.8s'
                    }}>
                      3.5% + $0.30
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', width: '45px', color: 'var(--text-muted)' }}>Vault</span>
                  <div
                    style={{
                      height: '12px',
                      width: visible ? '20%' : '0%',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '4px',
                      position: 'relative',
                      transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.65rem',
                      color: '#10b981',
                      fontWeight: 600,
                      opacity: visible ? 1 : 0,
                      transition: 'opacity 0.4s ease 1s'
                    }}>
                      0%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BentoGlowCard>

          {/* Card 3: 1x1 Span - Crypto Support */}
          <BentoGlowCard className="bento-card">
            <div className="bento-content">
              <Coins size={32} color="var(--accent-cyan)" />
              <h3 className="bento-title">Pay with Coins</h3>
              <p className="bento-desc">
                We accept top coins like Solana, Ethereum, Bitcoin, and USDT. Prices update automatically.
              </p>
            </div>
            {/* Visual element: coin badges in a stable 2x2 grid */}
            <div className="coin-grid" style={{ marginTop: '1rem', width: '100%' }}>
              {[
                { name: 'USDT', symbol: '₮', className: 'coin-badge-usdt', rate: '1.00' },
                { name: 'SOL', symbol: 'S', className: 'coin-badge-sol', rate: rates.SOL, hasFlash: flash.SOL },
                { name: 'ETH', symbol: 'Ξ', className: 'coin-badge-eth', rate: rates.ETH, hasFlash: flash.ETH },
                { name: 'BTC', symbol: '₿', className: 'coin-badge-btc', rate: rates.BTC, hasFlash: flash.BTC }
              ].map((coin, idx) => (
                <div
                  key={coin.name}
                  className={`coin-badge ${coin.className} float-coin-${idx}`}
                  style={{
                    boxShadow: coin.hasFlash ? '0 0 15px rgba(255, 255, 255, 0.2)' : undefined,
                    borderColor: coin.hasFlash ? 'rgba(255, 255, 255, 0.4)' : undefined,
                    transform: coin.hasFlash ? 'scale(1.05)' : undefined,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: '100%',
                    margin: 0
                  }}
                >
                  <span className="coin-badge-icon">{coin.symbol}</span>
                  <span style={{ fontWeight: 800 }}>{coin.name}</span>
                  <span className="coin-rate-text" style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginLeft: 'auto', fontFamily: 'monospace' }}>
                    ${coin.rate}
                  </span>
                </div>
              ))}
            </div>
          </BentoGlowCard>

          {/* Card 4: 2x1 Span - PageSpeed Score */}
          <BentoGlowCard className="bento-card bento-span-2" style={{ position: 'relative' }}>
            {/* Dev Mode Toggle Switch */}
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dev Mode</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDevMode(!devMode);
                }}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '100px',
                  background: devMode ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '3px',
                    left: devMode ? '20px' : '3px',
                    transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </button>
            </div>

            <div className="bento-content" style={{ transition: 'opacity 0.3s ease' }}>
              <Clock size={32} color="var(--accent-emerald)" />
              <h3 className="bento-title">Super Fast Websites</h3>
              <p className="bento-desc super-fast-desc">
                We check every template to make sure it loads super fast. Google loves fast websites, and so will your visitors.
              </p>

              {/* Conditional Sub-metrics vs API Payload */}
              {!devMode ? (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', width: '100%', flexWrap: 'wrap', animation: 'fadeIn 0.3s ease' }}>
                  {[
                    { name: 'Loads', val: '1.1s', desc: 'Super Fast', color: 'var(--accent-emerald)' },
                    { name: 'Clicks', val: '12ms', desc: 'Instant', color: 'var(--accent-emerald)' },
                    { name: 'Screen', val: 'Stable', desc: 'No Jumping', color: 'var(--accent-emerald)' }
                  ].map((metric, i) => (
                    <div
                      key={metric.name}
                      style={{
                        flex: 1,
                        minWidth: '85px',
                        padding: '0.5rem 0.6rem',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(10px)',
                        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.12}s`
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{metric.name}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: metric.color, margin: '0.15rem 0' }}>{metric.val}</div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{metric.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: 'var(--accent-cyan)',
                    marginTop: '1.25rem',
                    width: '100%',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  <span style={{ color: '#ec4899' }}>const</span> audit = &#123;{"\n"}
                  &nbsp;&nbsp;performance: <span style={{ color: '#10b981' }}>99</span>,{"\n"}
                  &nbsp;&nbsp;loadTime: <span style={{ color: '#10b981' }}>"1.1s"</span>,{"\n"}
                  &nbsp;&nbsp;clickTime: <span style={{ color: '#10b981' }}>"12ms"</span>,{"\n"}
                  &nbsp;&nbsp;layoutShift: <span style={{ color: '#10b981' }}>0.01</span>,{"\n"}
                  &nbsp;&nbsp;security: <span style={{ color: '#f59e0b' }}>"Verified"</span>,{"\n"}
                  &nbsp;&nbsp;delivery: <span style={{ color: '#f59e0b' }}>"instant"</span>{"\n"}
                  &#125;;
                </div>
              )}
            </div>

            {/* Visual element: PageSpeed Performance Dial (Only when not devMode) */}
            <div className="bento-visual flex-center" style={{ position: 'relative', height: '100%', minHeight: '110px', width: '220px', flexShrink: 0 }}>
              {!devMode ? (
                <div className="pagespeed-gauge" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.02)" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="var(--accent-emerald)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * (score / 100))}
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50px 50px',
                        transition: 'stroke-dashoffset 0.05s linear'
                      }}
                    />
                  </svg>
                  <div className="pagespeed-score">
                    <Odometer value={score} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem', textAlign: 'center' }}>
                    Performance
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '16px',
                    padding: '1rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    animation: 'fadeIn 0.3s ease',
                    width: '100%',
                    maxWidth: '160px'
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Developer Mode</div>
                  This is the raw data that makes the screen load fast.
                </div>
              )}
            </div>
          </BentoGlowCard>

        </div>

      </div>
    </section>
  );
}

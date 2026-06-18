'use client';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import useMagnetic from '@/hooks/useMagnetic';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 35;
      const y = (e.clientY - window.innerHeight / 2) / 35;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnetic Button Hooks
  const primaryBtn = useMagnetic(0.25);
  const secondaryBtn = useMagnetic(0.25);

  // Split title words for the text reveal animation
  const titlePart1 = ["Buy", "Beautiful", "Websites"];
  const titlePart2 = ["&"];
  const titlePart3 = ["Premium"];
  const titlePart4 = ["Templates."];

  return (
    <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic background glow layers */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      {/* Zero Gravity Floating Badge Elements */}
      <div className="zero-g-container" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        {/* Floating Card 1: WP Badge */}
        <div 
          className="zero-g-card-1" 
          style={{
            position: 'absolute',
            top: '25%',
            left: '6%',
            background: 'rgba(7, 7, 14, 0.65)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            backdropFilter: 'blur(12px)',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
            transform: `rotate(-4deg) translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
            opacity: mounted ? 0.85 : 0,
            transition: 'opacity 1s ease 0.5s, transform 0.2s ease-out',
            zIndex: 2
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 10px #8b5cf6' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>Category</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>Premium Templates</span>
          </div>
        </div>

        {/* Floating Card 2: Next.js Badge */}
        <div 
          className="zero-g-card-2" 
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '8%',
            background: 'rgba(7, 7, 14, 0.65)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            backdropFilter: 'blur(12px)',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
            transform: `rotate(6deg) translate(${-mouseOffset.x * 1.2}px, ${-mouseOffset.y * 1.2}px)`,
            opacity: mounted ? 0.85 : 0,
            transition: 'opacity 1s ease 0.7s, transform 0.2s ease-out',
            zIndex: 2
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>Category</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>React & Next.js</span>
          </div>
        </div>

        {/* Floating Card 3: Secure Delivery */}
        <div 
          className="zero-g-card-3" 
          style={{
            position: 'absolute',
            top: '28%',
            right: '10%',
            background: 'rgba(7, 7, 14, 0.65)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '0.75rem 1rem',
            backdropFilter: 'blur(12px)',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
            transform: `rotate(-3deg) translate(${mouseOffset.x * 1.5}px, ${-mouseOffset.y * 0.6}px)`,
            opacity: mounted ? 0.75 : 0,
            transition: 'opacity 1s ease 0.9s, transform 0.2s ease-out',
            zIndex: 2
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>Delivery</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>Instant Download</span>
          </div>
        </div>
      </div>
      
      <div className="container hero-content" style={{ zIndex: 10, position: 'relative' }}>
        <div 
          className="hero-tag"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Sparkles size={14} style={{ marginRight: '6px' }} />
          Beautiful Website Store
        </div>
        
        <h1 className="hero-title">
          {/* Row 1 */}
          <span className="reveal-text-line">
            {titlePart1.map((word, i) => (
              <span 
                key={i} 
                className="reveal-text-word"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {word}&nbsp;
              </span>
            ))}
          </span>
          
          {/* Row 2: Serif Script font mix with Metallic Shine */}
          <span className="reveal-text-line">
            <span 
              className="reveal-text-word hero-title-accent"
              style={{ animationDelay: '0.24s' }}
            >
              {titlePart2[0]}&nbsp;
            </span>
            <span 
              className="reveal-text-word"
              style={{ animationDelay: '0.32s' }}
            >
              <span className="metallic-text-shine-purple">
                {titlePart3[0]}
              </span>
              <span>&nbsp;</span>
            </span>
            {titlePart4.map((word, i) => (
              <span 
                key={i} 
                className="reveal-text-word hero-title-accent"
                style={{ animationDelay: `${0.40 + i * 0.08}s` }}
              >
                {word}&nbsp;
              </span>
            ))}
          </span>
        </h1>
        
        <p 
          className="hero-subtitle"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 0.6s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s'
          }}
        >
          Find the best websites and premium templates. <span className="desktop-only">Pay easily with coin values and download your files in one click.</span>
        </p>
        
        <div 
          className="hero-actions"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 0.8s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}
        >
          <Link 
            href="/templates" 
            ref={primaryBtn.ref}
            style={{ ...primaryBtn.style, display: 'inline-flex', alignItems: 'center' }}
            className="btn btn-primary"
          >
            View Templates <ArrowRight size={16} style={{ marginLeft: '4px' }} />
          </Link>
        </div>
      </div>
    </section>
  );
}

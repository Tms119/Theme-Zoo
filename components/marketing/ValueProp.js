'use client';
import { useState } from 'react';
import { Download, UploadCloud, Rocket, HelpCircle } from 'lucide-react';

export default function ValueProp() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Pick & Download",
      desc: "Find a website design you love, checkout securely with your coins, and download the template ZIP file instantly.",
      icon: Download,
      color: "#8b5cf6",
      glow: "rgba(139, 92, 246, 0.15)"
    },
    {
      title: "2. Easy Install",
      desc: "Upload the template to your WordPress admin panel or drag the static files directly onto your web hosting folder.",
      icon: UploadCloud,
      color: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.15)"
    },
    {
      title: "3. Swap & Launch",
      desc: "Double-click to change the text, upload your own photos, and click publish. Your brand new website is ready to visit!",
      icon: Rocket,
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.15)"
    }
  ];

  return (
    <section style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }} className="reveal-on-scroll">
      {/* Background neon dots & glows */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '700px', 
          height: '400px', 
          background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)', 
          filter: 'blur(80px)', 
          pointerEvents: 'none' 
        }} 
      />

      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.9rem', background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '100px', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            <HelpCircle size={12} style={{ marginRight: '6px' }} /> Simple Process
          </div>
          <h2 className="section-title">
            Get Your Site Live In <span>3 Simple Steps</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.5rem auto 0 auto', fontSize: '1.05rem', lineHeight: '1.5' }}>
            No code developers, no massive design bills. Just choose, upload, and announce your new page.
          </p>
        </div>

        {/* Interactive Step Connector Line */}
        <div 
          className="steps-connector-container"
          style={{ 
            maxWidth: '800px', 
            margin: '0 auto 3.5rem auto', 
            position: 'relative', 
            height: '4px', 
            background: 'rgba(255,255,255,0.04)', 
            borderRadius: '99px' 
          }}
        >
          {/* Active Progress Bar */}
          <div 
            style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              height: '100%', 
              width: `${(activeStep / (steps.length - 1)) * 100}%`, 
              background: `linear-gradient(to right, #8b5cf6, ${steps[activeStep].color})`, 
              borderRadius: '99px',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.5s ease'
            }} 
          />

          {/* Dots on the line */}
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}>
            {steps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: activeStep >= idx ? step.color : '#161622',
                  border: activeStep >= idx ? '3px solid #06060c' : '2px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  boxShadow: activeStep >= idx ? `0 0 15px ${step.color}` : 'none',
                  transition: 'all 0.3s ease'
                }} 
              />
            ))}
          </div>
        </div>

        {/* 3-Steps Cards Grid */}
        <div className="grid-3" style={{ gap: '2rem' }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === idx;
            return (
              <div 
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid',
                  borderColor: isHovered ? step.color : 'var(--border-color)',
                  borderRadius: '24px',
                  padding: '2.5rem 2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${step.glow}` : 'none',
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="value-step-card"
              >
                {/* Visual glow overlay inside card */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: step.color,
                    filter: 'blur(40px)',
                    opacity: isHovered ? 0.15 : 0.02,
                    transition: 'opacity 0.4s ease'
                  }}
                />

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: isHovered ? step.color : 'rgba(255,255,255,0.02)',
                    color: isHovered ? '#06060c' : 'var(--text-main)',
                    marginBottom: '1.75rem',
                    transition: 'all 0.4s ease'
                  }}
                  className="step-icon-wrapper"
                >
                  <Icon size={22} />
                </div>

                <h3 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    color: isHovered ? '#fff' : 'var(--text-main)', 
                    marginBottom: '0.75rem',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {step.title}
                </h3>
                
                <p className="desktop-only" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

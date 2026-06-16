'use client';
import { useState, useRef, useEffect } from 'react';
import { Palette, Smartphone, Search, Zap, CheckCircle, Send, Sparkles, Clock, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: Palette,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    title: 'Pixel-Perfect Design',
    desc: 'Bespoke UI crafted to your brand identity',
  },
  {
    icon: Smartphone,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.1)',
    title: 'Fully Responsive',
    desc: 'Looks stunning on every screen size',
  },
  {
    icon: Search,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    title: 'SEO Optimised',
    desc: 'Built to rank on Google from day one',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Blazing Fast',
    desc: '99/100 PageSpeed — no bloated scripts',
  },
];

const PROJECT_TYPES = [
  'Landing Page',
  'Portfolio / Personal Site',
  'eCommerce Store',
  'WordPress Theme',
  'SaaS / Dashboard',
  'Business / Agency Site',
  'Other',
];

const BUDGETS = [
  'Under $200',
  '$200 – $500',
  '$500 – $1,000',
  '$1,000 – $3,000',
  '$3,000+',
  'Let\'s discuss',
];

export default function CustomOrder() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  });

  // Scroll reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please fill in your name, email, and project description.');
      return;
    }
    setErrorMsg('');
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <section
      id="custom-order"
      ref={sectionRef}
      className="custom-order-section reveal-on-scroll"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* Background ambient glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="custom-order-grid">

          {/* ── Left: Pitch ─────────────────────────────────── */}
          <div className="custom-order-pitch">
            <div className="custom-order-eyebrow">
              <Sparkles size={11} />
              Custom Development
            </div>

            <h2 className="custom-order-heading">
              Need a Website<br />
              <span>Built For You?</span>
            </h2>

            <p className="custom-order-sub">
              Don't see exactly what you need in our template store? We build custom websites from scratch — fully responsive, SEO-ready, and delivered fast.
            </p>

            {/* Feature bullets */}
            <div className="custom-order-features">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="custom-order-feature-item"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(16px)',
                      transition: `opacity 0.6s ease ${0.2 + i * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.1}s`,
                    }}
                  >
                    <div className="custom-order-feature-icon" style={{ background: f.bg }}>
                      <Icon size={16} color={f.color} />
                    </div>
                    <div className="custom-order-feature-text">
                      <strong>{f.title}</strong>
                      <span>{f.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust badges */}
            <div className="custom-order-trust">
              <div className="custom-order-trust-badge">
                <CheckCircle size={11} />
                Response within 24h
              </div>
              <div className="custom-order-trust-badge">
                <Clock size={11} />
                7–14 day delivery
              </div>
              <div className="custom-order-trust-badge">
                <Shield size={11} />
                Satisfaction guaranteed
              </div>
            </div>
          </div>

          {/* ── Right: Contact Form Card ─────────────────── */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
            }}
          >
            <div className="contact-form-card">

              {/* Success overlay */}
              {status === 'success' && (
                <div className="contact-success-overlay">
                  <div className="contact-success-icon">
                    <CheckCircle size={28} />
                  </div>
                  <p className="contact-success-title">Message Sent!</p>
                  <p className="contact-success-sub">
                    We've received your enquiry and sent you a confirmation email. Expect a reply within 24–48 hours.
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', projectType: '', budget: '', message: '' }); }}
                    style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '100px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease' }}
                  >
                    Send another request
                  </button>
                </div>
              )}

              <p className="contact-form-title">Start Your Project</p>
              <p className="contact-form-subtitle">Tell us what you need — we'll send a tailored quote within 24 hours.</p>

              <form className="contact-form-body" onSubmit={handleSubmit} noValidate>
                {/* Name + Email */}
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="co-name">Your Name *</label>
                    <input
                      id="co-name"
                      name="name"
                      type="text"
                      className="contact-form-input"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="co-email">Email Address *</label>
                    <input
                      id="co-email"
                      name="email"
                      type="email"
                      className="contact-form-input"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Project Type + Budget */}
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="co-type">Project Type</label>
                    <select
                      id="co-type"
                      name="projectType"
                      className="contact-form-select"
                      value={form.projectType}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select type…</option>
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="contact-form-group">
                    <label className="contact-form-label" htmlFor="co-budget">Budget Range</label>
                    <select
                      id="co-budget"
                      name="budget"
                      className="contact-form-select"
                      value={form.budget}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select budget…</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="contact-form-group">
                  <label className="contact-form-label" htmlFor="co-message">Project Description *</label>
                  <textarea
                    id="co-message"
                    name="message"
                    className="contact-form-textarea"
                    placeholder="Describe your project, key features you need, design preferences, deadline, etc."
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                {/* Error message */}
                {(status === 'error' || errorMsg) && (
                  <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0, padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </p>
                )}

                <button
                  type="submit"
                  className="contact-form-submit"
                  disabled={status === 'loading'}
                  id="contact-submit-btn"
                >
                  {status === 'loading' ? (
                    <>
                      <span className="spinner" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Enquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

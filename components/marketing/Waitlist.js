'use client';
import { useState } from 'react';
import { Mail, Sparkles, Send, Check } from 'lucide-react';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setEmail('');
    }, 1200);
  };

  return (
    <section style={{ padding: '6rem 0 4rem 0', position: 'relative', overflow: 'hidden' }} className="reveal-on-scroll">
      
      {/* Background radial highlight */}
      <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '3.5rem 2.5rem', width: '100%', maxWidth: '750px', textAlign: 'center', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
          
          {/* Subtle grid lines background overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.15, pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.9rem', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              <Sparkles size={12} style={{ marginRight: '6px' }} /> Join Vault Drops
            </div>

            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-1px' }}>
              Be First To Access <span>New</span> Layouts
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.25rem auto', fontSize: '1rem', lineHeight: '1.5' }}>
              We release high-performance templates and theme systems bi-weekly. Subscribe to receive updates directly.
            </p>

            {submitted ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 189, 129, 0.08)', border: '1px solid rgba(16, 189, 129, 0.2)', padding: '0.8rem 1.5rem', borderRadius: '16px', color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.95rem' }}>
                <Check size={18} strokeWidth={3} /> You're on the list!
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px', margin: '0 auto', flexDirection: 'row' }} className="waitlist-form">
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '14px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s ease' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ borderRadius: '14px', padding: '0.85rem 1.5rem', flexShrink: 0 }}
                >
                  {loading ? 'Joining...' : <><Send size={14} /> Subscribe</>}
                </button>
              </form>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
              Zero spam. Unsubscribe at any time with one click.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

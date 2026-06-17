'use client';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const submitTicket = useMutation(api.support.create);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !problem) {
      setStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    setStatus('loading');
    try {
      await submitTicket({ name, email, problem });
      setStatus('success');
      setName('');
      setEmail('');
      setProblem('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Failed to submit your request. Please try again later.');
    }
  };

  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>

      <main style={{ minHeight: '80vh', paddingTop: '6rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>
              How can we <span style={{ color: 'var(--primary)' }}>help?</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Whether you have a question about a template or need help with a purchase, our team is here to assist you.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={64} color="var(--accent-emerald)" style={{ margin: '0 auto 1.5rem auto' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Request Submitted</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  Thank you for reaching out! We've received your support ticket and will get back to you at <strong>{email}</strong> shortly.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '12px' }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {status === 'error' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Your Name *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <MessageSquare size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>How can we help? *</label>
                  <textarea 
                    rows={5}
                    placeholder="Describe your problem or question in detail..." 
                    value={problem} 
                    onChange={(e) => setProblem(e.target.value)}
                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '14px', fontSize: '1.05rem', justifyContent: 'center', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {status === 'loading' ? (
                    'Submitting...'
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>

              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

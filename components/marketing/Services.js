'use client';
import { useState, useRef, useEffect } from 'react';
import { Palette, Zap, CheckCircle, Send, Sparkles, Clock, Shield, Monitor, Layout, X, QrCode } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const DEFAULT_CONFIG = {
  tier1_name: 'PHP Clone',
  tier1_price: 30,
  tier1_desc: 'Perfect for quick setups. Get a fully functional PHP script clone of your choice.',
  tier2_name: 'HTML Clone',
  tier2_price: 70,
  tier2_desc: 'High-quality HTML clone tailored to your specific requirements and design.',
  tier3_name: 'Custom High-End Website',
  tier3_desc: 'A premium, custom-built website tailored perfectly to your brand and business goals.',
  design_title: 'Custom Designs & Graphics',
  design_desc: 'Need a custom logo, banner, or infographics? Our elite design team will craft visually stunning assets for your brand.',
};

const CRYPTO_OPTIONS = [
  { id: 'btc', name: 'Bitcoin (BTC)' },
  { id: 'eth', name: 'Ethereum (ETH)' },
  { id: 'ltc', name: 'Litecoin (LTC)' },
  { id: 'usdttrc20', name: 'USDT (TRC20)' },
  { id: 'sol', name: 'Solana (SOL)' },
];

export default function Services() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [servicePrice, setServicePrice] = useState(0);
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  
  // Form State
  const [status, setStatus] = useState('idle'); // idle | loading | success | payment_generated | error
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', budget: '', message: '', coin: 'usdttrc20' });
  const [paymentInfo, setPaymentInfo] = useState(null);

  const configData = useQuery(api.services.getConfig);
  const createOrder = useMutation(api.services.createOrder);

  // Use DB config if available, else fallback
  const config = configData || DEFAULT_CONFIG;

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

  const openModal = (serviceType, price, requiresPayment = false) => {
    setSelectedService(serviceType);
    setServicePrice(price);
    setIsPaymentMode(requiresPayment);
    setIsModalOpen(true);
    setStatus('idle');
    setPaymentInfo(null);
    setForm({ name: '', email: '', budget: requiresPayment ? `$${price}` : '', message: '', coin: 'usdttrc20' });
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please fill in your name, email, and description.');
      return;
    }
    setErrorMsg('');
    setStatus('loading');

    try {
      if (isPaymentMode) {
        // Direct crypto checkout flow
        const res = await fetch('/api/checkout-service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            service_type: selectedService,
            message: form.message,
            price_usd: servicePrice,
            coin: form.coin,
          }),
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to generate payment.');

        setPaymentInfo(data);
        setStatus('payment_generated');

      } else {
        // Standard contact form flow
        await createOrder({
          name: form.name,
          email: form.email,
          service_type: selectedService,
          budget: form.budget,
          message: form.message,
        });

        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, projectType: selectedService }),
        });

        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  return (
    <section id="custom-order" ref={sectionRef} style={{ position: 'relative', padding: '6rem 0' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Sparkles size={14} /> Custom Development & Design
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            We Build It <span style={{ color: 'var(--primary)' }}>For You</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Whether you need a quick clone, a high-end custom website, or bespoke graphics, our expert team is ready to deliver exceptional results.
          </p>
        </div>

        {/* Website Tiers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* Tier 1 */}
          <div className="service-card" style={{ animationDelay: '0.1s' }}>
            <div className="service-icon"><Monitor size={24} /></div>
            <h3>{config.tier1_name}</h3>
            <div className="price">${config.tier1_price}</div>
            <p>{config.tier1_desc}</p>
            <button className="btn btn-primary" onClick={() => openModal('Tier 1: ' + config.tier1_name, config.tier1_price, true)}>Buy Now</button>
          </div>

          {/* Tier 2 */}
          <div className="service-card" style={{ animationDelay: '0.2s', border: '1px solid var(--primary)', background: 'linear-gradient(180deg, rgba(124,58,237,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
            <div className="service-icon" style={{ background: 'var(--primary)', color: '#fff' }}><Layout size={24} /></div>
            <h3>{config.tier2_name}</h3>
            <div className="price">${config.tier2_price}</div>
            <p>{config.tier2_desc}</p>
            <button className="btn btn-primary" onClick={() => openModal('Tier 2: ' + config.tier2_name, config.tier2_price, true)}>Buy Now</button>
          </div>

          {/* Tier 3 */}
          <div className="service-card" style={{ animationDelay: '0.3s' }}>
            <div className="service-icon"><Zap size={24} /></div>
            <h3>{config.tier3_name}</h3>
            <div className="price">Custom Quote</div>
            <p>{config.tier3_desc}</p>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => openModal('Tier 3: ' + config.tier3_name, 0, false)}>Contact Us</button>
          </div>

        </div>

        {/* Custom Design Banner */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              <Palette size={18} /> Creative Services
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>{config.design_title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{config.design_desc}</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={() => openModal('Custom Design', 0, false)}>
            Hire Our Designers
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Content */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', zIndex: 1001, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Request Sent!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>We've received your request for <strong>{selectedService}</strong> and will be in touch within 24 hours.</p>
                <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            ) : status === 'payment_generated' && paymentInfo ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <QrCode size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Awaiting Payment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Send exactly <strong>{paymentInfo.payAmount} {paymentInfo.payCurrency.toUpperCase()}</strong>
                </p>

                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${paymentInfo.payAddress}`} alt="QR Code" width="160" height="160" />
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Deposit Address:</div>
                  <div style={{ fontSize: '0.9rem', wordBreak: 'break-all', fontWeight: 600, color: 'var(--text-main)' }}>{paymentInfo.payAddress}</div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Once the transaction is confirmed on the blockchain, we will email you to begin your {selectedService} service!
                </p>
                <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setIsModalOpen(false)}>I've made the payment</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{isPaymentMode ? 'Checkout Service' : 'Start Your Project'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {isPaymentMode ? `Service: ` : `Requesting: `} 
                  <strong style={{ color: 'var(--primary)' }}>{selectedService}</strong>
                  {isPaymentMode && <span> - <strong>${servicePrice}</strong></span>}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Your Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Email Address</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                    </div>
                  </div>
                  
                  {!isPaymentMode && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Budget Range (Optional)</label>
                      <select name="budget" value={form.budget} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none', appearance: 'none' }}>
                        <option value="" disabled>Select a budget...</option>
                        <option value="<$200">Under $200</option>
                        <option value="$200-$500">$200 - $500</option>
                        <option value="$500-$1000">$500 - $1,000</option>
                        <option value="$1000+">$1,000+</option>
                      </select>
                    </div>
                  )}

                  {isPaymentMode && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Select Crypto Currency</label>
                      <select name="coin" value={form.coin} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none', appearance: 'none' }}>
                        {CRYPTO_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id} style={{ background: '#0a0a0f', color: '#fff' }}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{isPaymentMode ? 'Project Details / What do you need cloned?' : 'Project Details'}</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Tell us about your requirements..." style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'vertical' }} />
                  </div>

                  {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</div>}

                  <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    {status === 'loading' ? (isPaymentMode ? 'Generating Invoice...' : 'Sending...') : (isPaymentMode ? `Pay $${servicePrice} Now` : <><Send size={16} /> Submit Request</>)}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .service-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          opacity: 0;
          animation: fadeUp 0.8s ease forwards;
        }
        .service-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: var(--text-main);
        }
        .service-card h3 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .service-card .price {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 1rem;
        }
        .service-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          flex: 1;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

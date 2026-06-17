'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ShieldCheck, Mail, Check, AlertCircle, Copy, Loader2, ArrowRight, Star, Code, Zap } from 'lucide-react';

export default function ServicesPage() {
  const config = useQuery(api.services.getConfig);
  const createOrder = useMutation(api.services.createOrder);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null); // 1, 2, or 3
  
  // Checkout/Inquiry State
  const [step, setStep] = useState('input'); // 'input' -> 'payment' -> 'success'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [coin, setCoin] = useState('usdttrc20');

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [codeToCheck, setCodeToCheck] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment UI State
  const [orderId, setOrderId] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [depositAddress, setDepositAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [payCurrency, setPayCurrency] = useState('');
  const [usdPrice, setUsdPrice] = useState(0);
  const [timer, setTimer] = useState(1800);

  // Poll for live status of service orders
  const liveOrder = useQuery(api.services.getOrderStatusByTx, orderId ? { tx_hash: orderId } : 'skip');
  const promoData = useQuery(api.promo_codes.getByCode, codeToCheck ? { code: codeToCheck } : 'skip');

  useEffect(() => {
    if (codeToCheck) {
      if (promoData === undefined) return;
      if (promoData === null || !promoData.isActive) {
        setPromoError('Invalid or inactive promo code.');
        setPromoSuccess('');
        setAppliedPromo(null);
      } else {
        setPromoError('');
        setPromoSuccess('Promo code applied!');
        setAppliedPromo(promoData);
      }
    }
  }, [promoData, codeToCheck]);
  
  useEffect(() => {
    if (step === 'payment' && orderId && liveOrder) {
      if (liveOrder.status === 'paid') {
        setStep('success');
      } else if (liveOrder.status === 'failed' || liveOrder.status === 'expired') {
        setError('Payment failed or expired. Please try again.');
        setStep('input');
      }
    }
  }, [liveOrder, step, orderId]);

  // Timer countdown
  useEffect(() => {
    if (step !== 'payment') return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('Payment time expired. Please start over.');
          setStep('input');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openModal = (tierNum) => {
    setSelectedTier(tierNum);
    setStep('input');
    setError('');
    setName('');
    setEmail('');
    setMessage('');
    setBudget('');
    setPromoInput('');
    setCodeToCheck('');
    setAppliedPromo(null);
    setPromoError('');
    setPromoSuccess('');
    setModalOpen(true);
  };

  const getTierDetails = (tierNum) => {
    if (!config) return {};
    if (tierNum === 1) return { name: config.tier1_name, price: config.tier1_price };
    if (tierNum === 2) return { name: config.tier2_name, price: config.tier2_price };
    if (tierNum === 3) return { name: config.tier3_name, price: 'Custom' };
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const tierDetails = getTierDetails(selectedTier);

    try {
      if (selectedTier === 3) {
        // Direct inquiry, no crypto payment needed
        await createOrder({
          name,
          email,
          service_type: tierDetails.name,
          budget,
          message,
        });
        setStep('success');
      } else {
        // Crypto checkout for Tier 1 and 2
        const res = await fetch('/api/checkout-service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            service_type: tierDetails.name,
            message,
            price_usd: tierDetails.price,
            coin,
            promoCode: appliedPromo ? appliedPromo.code : null,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create payment');

        if (data.isFree) {
          setOrderId(data.orderId);
          setCryptoAmount(0);
          setStep('success');
        } else {
          setOrderId(data.orderId);
          setCryptoAmount(data.payAmount);
          setDepositAddress(data.payAddress);
          setPayCurrency(data.payCurrency);
          setPaymentId(data.paymentId);
          setUsdPrice(data.usdPrice);
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data.payCurrency}:${data.payAddress}?amount=${data.payAmount}`);
          setStep('payment');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (config === undefined) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <main style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '6rem' }}>
        <div className="container">
          
          {/* Hero Section */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }} className="animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <Zap size={14} /> Custom Solutions
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              {config?.design_title || 'Expert Custom Services'}
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
              {config?.design_desc || 'Need something built from scratch? Choose one of our service tiers below and let us bring your vision to life.'}
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="services-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
            
            {/* Tier 1 */}
            <div className="service-card">
              <div className="card-header">
                <h3 className="card-title">{config?.tier1_name || 'Basic Configuration'}</h3>
                <div className="card-price">
                  <span className="currency">$</span>
                  <span className="amount">{config?.tier1_price || 30}</span>
                </div>
              </div>
              <p className="card-desc">{config?.tier1_desc}</p>
              <button className="btn btn-primary btn-block" onClick={() => openModal(1)}>
                Order Now <ArrowRight size={16} />
              </button>
            </div>

            {/* Tier 2 (Highlighted) */}
            <div className="service-card highlighted">
              <div className="popular-badge"><Star size={12} /> Most Popular</div>
              <div className="card-header">
                <h3 className="card-title">{config?.tier2_name || 'Advanced Integration'}</h3>
                <div className="card-price">
                  <span className="currency">$</span>
                  <span className="amount">{config?.tier2_price || 70}</span>
                </div>
              </div>
              <p className="card-desc">{config?.tier2_desc}</p>
              <button className="btn btn-primary btn-block" onClick={() => openModal(2)}>
                Order Now <ArrowRight size={16} />
              </button>
            </div>

            {/* Tier 3 */}
            <div className="service-card">
              <div className="card-header">
                <h3 className="card-title">{config?.tier3_name || 'Custom Development'}</h3>
                <div className="card-price" style={{ marginTop: '0.5rem' }}>
                  <span className="amount" style={{ fontSize: '2rem' }}>Custom</span>
                </div>
              </div>
              <p className="card-desc">{config?.tier3_desc}</p>
              <button className="btn btn-secondary btn-block" onClick={() => openModal(3)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                Get a Quote <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Checkout / Inquiry Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            
            <div style={{ padding: '2.5rem' }}>
              {step === 'input' && (
                <form onSubmit={handleSubmit}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                      {selectedTier === 3 ? 'Request a Quote' : 'Checkout Service'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {getTierDetails(selectedTier).name} 
                      {selectedTier !== 3 && <span style={{ color: 'var(--text-main)', fontWeight: 600, marginLeft: '0.5rem' }}>(${getTierDetails(selectedTier).price})</span>}
                    </p>
                    {appliedPromo && selectedTier !== 3 && (
                      <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 189, 129, 0.1)', color: 'var(--accent-emerald)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% OFF` : `$${appliedPromo.discountValue} OFF`} PROMO APPLIED
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="error-box">
                      <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div>
                      <label className="input-label">Name</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="modal-input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="input-label">Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="modal-input" style={{ paddingLeft: '2.5rem' }} placeholder="your@email.com" />
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                    
                    {selectedTier === 3 && (
                      <div>
                        <label className="input-label">Estimated Budget (USD)</label>
                        <input type="text" required value={budget} onChange={(e) => setBudget(e.target.value)} className="modal-input" placeholder="e.g. $500 - $1000" />
                      </div>
                    )}

                    <div>
                      <label className="input-label">Project Requirements</label>
                      <textarea required value={message} onChange={(e) => setMessage(e.target.value)} className="modal-input" rows={4} placeholder="Tell us what you need built..." style={{ resize: 'vertical' }}></textarea>
                    </div>

                    {selectedTier !== 3 && (
                      <div>
                        <label className="input-label">Select Crypto Currency</label>
                        <div className="currency-grid">
                          {[
                            { id: 'usdttrc20', name: 'USDT', desc: 'TRC20 Network' },
                            { id: 'usdtbsc', name: 'USDT', desc: 'BEP20 Chain' },
                            { id: 'ltc', name: 'LTC', desc: 'Litecoin' },
                            { id: 'btc', name: 'BTC', desc: 'Bitcoin' },
                          ].map((item) => (
                            <div 
                              key={item.id}
                              onClick={() => setCoin(item.id)}
                              className={`currency-card ${coin === item.id ? 'active' : ''}`}
                            >
                              <div className="currency-name">{item.name}</div>
                              <div className="currency-desc">{item.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Promo Code Input */}
                    {selectedTier !== 3 && (
                      <div>
                        <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Promo Code (Optional)</span>
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            placeholder="SUMMER50"
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value.toUpperCase());
                              if (!e.target.value) {
                                setAppliedPromo(null);
                                setCodeToCheck('');
                                setPromoSuccess('');
                                setPromoError('');
                              }
                            }}
                            className="modal-input"
                          />
                          <button
                            type="button"
                            onClick={() => setCodeToCheck(promoInput)}
                            disabled={!promoInput || promoInput === codeToCheck}
                            style={{ padding: '0 1.2rem', background: 'var(--border-color)', border: 'none', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                          >
                            Apply
                          </button>
                        </div>
                        {promoError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>{promoError}</p>}
                        {promoSuccess && <p style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>{promoSuccess}</p>}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary btn-block">
                    {loading && <Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} />}
                    {loading ? 'Processing...' : selectedTier === 3 ? 'Submit Inquiry' : (appliedPromo && (appliedPromo.discountType === 'percentage' ? (getTierDetails(selectedTier).price * (1 - appliedPromo.discountValue / 100)) : Math.max(0, getTierDetails(selectedTier).price - appliedPromo.discountValue)) <= 0) ? 'Claim Free Service' : `Pay $${appliedPromo ? (appliedPromo.discountType === 'percentage' ? (getTierDetails(selectedTier).price * (1 - appliedPromo.discountValue / 100)).toFixed(2) : Math.max(0, getTierDetails(selectedTier).price - appliedPromo.discountValue).toFixed(2)) : getTierDetails(selectedTier).price} with Crypto`}
                  </button>
                </form>
              )}

              {/* Step 2: Payment Details (QR & Address) */}
              {step === 'payment' && selectedTier !== 3 && (
                <div className="payment-active-area animate-fade-in">
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                      Waiting for blockchain payment
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                      Send {payCurrency.toUpperCase()}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '0.75rem', borderRadius: '16px' }}>
                      <img src={qrCodeUrl} alt="QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
                    </div>
                  </div>

                  <div className="payment-info-box">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Amount to Send (Exact)</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                        {cryptoAmount} {payCurrency.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Equivalent to ${usdPrice.toFixed(2)} USD</div>
                  </div>

                  <div className="payment-info-box" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Deposit Address</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      <input readOnly value={depositAddress} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }} />
                      <button onClick={() => handleCopy(depositAddress)} className="copy-btn"><Copy size={14} /></button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div>Time: <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{formatTime(timer)}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)' }}>
                      <span className="dot-pulse"></span> <span style={{ fontWeight: 500 }}>Listening for tx...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Success Confirmation */}
              {step === 'success' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 189, 129, 0.1)', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {selectedTier === 3 ? 'Inquiry Sent!' : 'Payment Confirmed!'}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    {selectedTier === 3 
                      ? "We have received your custom project requirements. Our team will review the details and get back to you shortly."
                      : "Your payment was verified. Our team will contact you shortly to begin work on your service."}
                  </p>
                  <button onClick={() => { setModalOpen(false); setStep('input'); }} className="btn btn-primary btn-block">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .service-card {
          background: rgba(13, 13, 30, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          position: relative;
        }
        .service-card:hover {
          transform: translateY(-5px);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 20px 40px -20px rgba(139, 92, 246, 0.15);
        }
        .service-card.highlighted {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(13, 13, 30, 0.8) 100%);
          border: 1px solid rgba(139, 92, 246, 0.4);
          box-shadow: 0 0 30px -10px rgba(139, 92, 246, 0.3);
          transform: scale(1.02);
        }
        .service-card.highlighted:hover {
          transform: scale(1.02) translateY(-5px);
        }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .card-header {
          margin-bottom: 1.5rem;
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .card-price {
          display: flex;
          align-items: flex-start;
          gap: 0.25rem;
        }
        .currency {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 0.25rem;
        }
        .amount {
          font-size: 3rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--text-main);
          line-height: 1;
        }
        .card-desc {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2.5rem;
          flex-grow: 1;
        }
        .btn-block {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 2rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close:hover { color: white; }
        .input-label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .modal-input {
          width: 100%;
          min-width: 0;
          padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
        }
        .modal-input:focus {
          border-color: var(--primary);
        }
        .currency-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .currency-card {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s;
        }
        .currency-card.active {
          border-color: var(--primary);
          background: rgba(124, 58, 237, 0.08);
        }
        .currency-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .currency-card.active .currency-name { color: var(--text-main); }
        .currency-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .error-box {
          display: flex;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: #f87171;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .payment-info-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        .copy-btn {
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.2);
          padding: 0.4rem;
          border-radius: 8px;
          color: var(--primary);
          cursor: pointer;
        }
        .copy-btn:hover { background: var(--primary); color: white; }

        @media (max-width: 900px) {
          .services-grid {
            grid-template-columns: 1fr;
          }
          .service-card.highlighted {
            transform: scale(1);
          }
          .service-card.highlighted:hover {
            transform: translateY(-5px);
          }
        }
        @media (max-width: 600px) {
          .currency-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

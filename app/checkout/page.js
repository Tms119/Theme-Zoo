'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Check, AlertCircle, Copy, Loader2, Tag } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import useCart from '@/store/useCart';
import { useAuth, useUser } from '@clerk/nextjs';

export default function CheckoutCartPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Redirect if cart is empty or not loaded
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    } else if (isLoaded && items.length === 0 && step === 'input') {
      router.push('/templates');
    }
  }, [isLoaded, isSignedIn, items, router]);

  // Step state: 'input' (form) -> 'payment' (QR/Address) -> 'success' (paid)
  const [step, setStep] = useState('input');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [coin, setCoin] = useState('usdttrc20');
  
  // Promo Code
  const [promoInput, setPromoInput] = useState('');
  const [codeToCheck, setCodeToCheck] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment states from Backend
  const [cartId, setCartId] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [depositAddress, setDepositAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [payCurrency, setPayCurrency] = useState('');
  const [usdPrice, setUsdPrice] = useState(0);
  const [timer, setTimer] = useState(1800); // 30 mins
  
  // Real-time order tracking via Convex
  const liveOrders = useQuery(api.orders.listByTxHash, cartId ? { tx_hash: cartId } : 'skip');
  
  const promoData = useQuery(api.promo_codes.getByCode, codeToCheck ? { code: codeToCheck } : 'skip');
  const activeCampaign = useQuery(api.marketing.getActiveVolumeCampaign);

  useEffect(() => {
    if (codeToCheck) {
      if (promoData === undefined) {
        // loading
        return;
      }
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

  // Set default email/name if logged in
  useEffect(() => {
    if (user && !email) {
      setEmail(user.primaryEmailAddress?.emailAddress || '');
      setName(user.fullName || '');
    }
  }, [user, email]);

  // Watch liveOrders status to transition to success page
  useEffect(() => {
    if (liveOrders && liveOrders.length > 0 && step === 'payment') {
      const allPaid = liveOrders.every(o => o.status === 'paid');
      const anyFailed = liveOrders.some(o => o.status === 'failed' || o.status === 'expired');

      if (allPaid) {
        clearCart();
        setStep('success');
      } else if (anyFailed) {
        setError('Payment failed or expired. Please try again.');
        setStep('input');
      }
    }
  }, [liveOrders, step, clearCart]);

  // Copy helper
  const [copied, setCopied] = useState(false);
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/checkout-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items,
          buyerEmail: email,
          buyerName: name,
          buyerId: user?.id,
          coin: coin,
          promoCode: appliedPromo ? appliedPromo.code : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setCartId(data.cartId);

      // If it was a 100% discount, the API will immediately return paymentId = 'promo_...' and payAmount = 0
      if (data.isFree) {
        clearCart();
        setCryptoAmount(0);
        setStep('success');
      } else {
        setCryptoAmount(data.payAmount);
        setDepositAddress(data.payAddress);
        setPayCurrency(data.payCurrency);
        setPaymentId(data.paymentId);
        setUsdPrice(data.usdPrice);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data.payCurrency}:${data.payAddress}?amount=${data.payAmount}`);
        setStep('payment');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const totalCartUsd = items.reduce((sum, item) => sum + (item.price_usd || 0), 0);
  
  // Calculate discounted total
  let finalTotalUsd = totalCartUsd;
  let activeDiscountLabel = null;

  // Manual Promo Codes completely override Volume Campaigns (NO STACKING)
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      finalTotalUsd = totalCartUsd * (1 - appliedPromo.discountValue / 100);
    } else if (appliedPromo.discountType === 'fixed') {
      finalTotalUsd = Math.max(0, totalCartUsd - appliedPromo.discountValue);
    }
    activeDiscountLabel = `${appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% OFF` : `$${appliedPromo.discountValue} OFF`} PROMO`;
  } else if (activeCampaign && items.length >= activeCampaign.minItems) {
    if (activeCampaign.discountType === 'percentage') {
      finalTotalUsd = totalCartUsd * (1 - activeCampaign.discountValue / 100);
    } else if (activeCampaign.discountType === 'fixed') {
      finalTotalUsd = Math.max(0, totalCartUsd - activeCampaign.discountValue);
    }
    activeDiscountLabel = `${activeCampaign.name} Applied`;
  }
  
  const isFree = finalTotalUsd <= 0;

  if (!isLoaded) {
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
      
      <main style={{ minHeight: '85vh', paddingTop: 'calc(var(--header-height) + 3rem)', paddingBottom: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          
          <div className="checkout-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '28px', width: '100%', maxWidth: '520px', backdropFilter: 'blur(12px)', margin: '0 auto' }}>
            
            {/* Step 1: Input Form */}
            {step === 'input' && (
              <form onSubmit={handleSubmit}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Cart Checkout
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Purchasing <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{items.length} items</span> for a total of <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>${totalCartUsd.toFixed(2)}</span>
                  </p>
                  {activeDiscountLabel && (
                    <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 189, 129, 0.1)', color: 'var(--accent-emerald)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Tag size={14} /> 
                      {activeDiscountLabel}
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-main)' }}>Final Total: ${finalTotalUsd.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                      Email Address (For file delivery)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" 
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                      />
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                      Name (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 500 }}>
                      Select Crypto Currency
                    </label>
                    <div className="currency-grid">
                      {[
                        { id: 'usdttrc20', name: 'USDT', desc: 'TRC20 Network' },
                        { id: 'usdtbsc', name: 'USDT', desc: 'BEP20 / BNB Chain' },
                        { id: 'ltc', name: 'LTC', desc: 'Litecoin' },
                        { id: 'btc', name: 'BTC', desc: 'Bitcoin' },
                        { id: 'eth', name: 'ETH', desc: 'Ethereum (ERC20)' },
                      ].map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setCoin(item.id)}
                          style={{ 
                            padding: '0.75rem 1rem', 
                            borderRadius: '14px', 
                            border: '1px solid',
                            borderColor: coin === item.id ? 'var(--primary)' : 'var(--border-color)',
                            background: coin === item.id ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: coin === item.id ? 'var(--text-main)' : 'var(--text-secondary)' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
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
                        style={{ flex: 1, padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
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

                </div>

                <button 
                  type="submit" 
                  disabled={loading || items.length === 0}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? 'Processing...' : isFree ? 'Claim Free Templates' : `Pay $${finalTotalUsd.toFixed(2)} with Crypto`}
                </button>
              </form>
            )}

            {/* Step 2: Payment Details (QR & Address) */}
            {step === 'payment' && (
              <div className="payment-active-area animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                    Waiting for blockchain payment
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                    Send {payCurrency.toUpperCase()}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Payment ID: {paymentId}
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                  </div>
                </div>

                {/* Amount */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>Amount to Send (Exact)</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                      {cryptoAmount} {payCurrency.toUpperCase()}
                    </span>
                    <button 
                      onClick={() => handleCopy(cryptoAmount.toString())}
                      style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '0.4rem', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                      className="hover-bg-primary hover-text-white"
                      title="Copy Amount"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Equivalent to ${usdPrice.toFixed(2)} USD
                  </div>
                </div>

                {/* Address */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '0.5px' }}>Deposit Address</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input 
                      readOnly 
                      value={depositAddress}
                      style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }}
                    />
                    <button 
                      onClick={() => handleCopy(depositAddress)}
                      style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '0.4rem', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                      className="hover-bg-primary hover-text-white"
                      title="Copy Address"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Timer & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <div>Time remaining: <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{formatTime(timer)}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '20px', color: 'var(--accent-amber)' }}>
                    <span className="dot-pulse"></span> <span style={{ fontWeight: 500 }}>Listening for tx...</span>
                  </div>
                </div>

                {copied && (
                  <div style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600, animation: 'fade-in-out 2s forwards' }}>
                    Copied to clipboard!
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem', lineHeight: '1.5' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Do not close this page.</strong> Once the payment is verified on the blockchain, this screen will automatically refresh.
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 'success' && (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 189, 129, 0.1)', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '16px', boxShadow: '0 0 0 8px rgba(16, 189, 129, 0.05)' }}>
                  <Check size={32} strokeWidth={3} />
                </div>
                
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  {cryptoAmount === 0 ? 'Order Confirmed!' : 'Payment Confirmed!'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                  Your order has been successfully processed. We have sent the download instructions to <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{email}</span>.
                </p>

                <button 
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 600 }}
                >
                  Go to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <style jsx global>{`
        .dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-amber);
          display: inline-block;
          animation: dot-pulse-anim 1.5s infinite ease-in-out;
        }
        @keyframes dot-pulse-anim {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(5px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        .hover-bg-primary:hover {
          background-color: var(--primary) !important;
        }
        .hover-text-white:hover {
          color: white !important;
        }
        .checkout-card {
          padding: 2.5rem;
        }
        .currency-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 640px) {
          .checkout-card {
            padding: 1.5rem;
          }
          .currency-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

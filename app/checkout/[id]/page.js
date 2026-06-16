'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Coins, ArrowRight, Check, AlertCircle, Copy } from 'lucide-react';

const PRODUCTS_DB = {
  "1-wp-neon": { name: "AstraGlow - Cyberpunk Portfolio", price_usd: 29.00 },
  "2-react-saas": { name: "SaaSify - Minimalist landing page", price_usd: 19.00 },
  "3-wp-agency": { name: "Apex agency - WordPress theme", price_usd: 35.00 },
  "4-html-portal": { name: "NFTHub - Marketplace template", price_usd: 15.00 }
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = params?.id || '';
  const product = PRODUCTS_DB[id] || PRODUCTS_DB["1-wp-neon"];

  // Step state: 'input' (form) -> 'payment' (QR/Address) -> 'success' (paid)
  const [step, setStep] = useState('input');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [coin, setCoin] = useState('USDT');
  
  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment states
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [depositAddress, setDepositAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [timer, setTimer] = useState(1200); // 20 mins

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
          setError('Payment time expired. Please try again.');
          setStep('input');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Mock payment completion check after 10 seconds on payment page
  useEffect(() => {
    if (step !== 'payment') return;
    const completeTimeout = setTimeout(() => {
      setStep('success');
    }, 15000); // simulate payment validation
    return () => clearTimeout(completeTimeout);
  }, [step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate API call to NOWPayments checkout creator
    setTimeout(() => {
      // Set static conversion rates for demo purposes
      let rate = 1;
      let address = '0xMockDepositAddressForCryptoVerification';
      
      if (coin === 'BTC') {
        rate = 0.000015;
        address = 'bc1qmockaddress728347892347923489237';
      } else if (coin === 'ETH') {
        rate = 0.00032;
        address = '0xMockEthereumDepositAddress73248923748927';
      } else if (coin === 'USDT') {
        rate = 1.0;
        address = 'TXMockTetherTrc20DepositAddress73482348927';
      } else if (coin === 'SOL') {
        rate = 0.0065;
        address = 'SolMockDepositAddress782347892347892734';
      }
      
      setCryptoAmount(product.price_usd * rate);
      setDepositAddress(address);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`);
      setPaymentId(`pay_${Math.random().toString(36).substr(2, 9)}`);
      
      setLoading(false);
      setStep('payment');
    }, 1500);
  };

  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      
      <main style={{ minHeight: '85vh', paddingTop: 'calc(var(--header-height) + 3rem)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '2.5rem', width: '100%', maxWidth: '520px', backdropFilter: 'blur(12px)' }}>
            
            {/* Step 1: Input Form */}
            {step === 'input' && (
              <form onSubmit={handleSubmit}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Crypto Checkout
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Purchasing: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
                  </p>
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
                      Select Crypto Coin
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        { id: 'USDT', name: 'USDT (TRC20)', desc: 'Tether' },
                        { id: 'SOL', name: 'SOL', desc: 'Solana' },
                        { id: 'ETH', name: 'ETH', desc: 'Ethereum' },
                        { id: 'BTC', name: 'BTC', desc: 'Bitcoin' },
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
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem' }}
                >
                  {loading ? 'Generating Invoice...' : `Pay $${product.price_usd.toFixed(2)} with Crypto`}
                </button>
              </form>
            )}

            {/* Step 2: Payment Details (QR & Address) */}
            {step === 'payment' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                    Waiting for blockchain payment
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
                    Send {coin}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Payment ID: {paymentId}
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '150px', height: '150px' }} />
                  </div>
                </div>

                {/* Amount */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Amount to Send</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {cryptoAmount.toFixed(coin === 'BTC' || coin === 'ETH' ? 6 : 2)} {coin}
                    </span>
                    <button 
                      onClick={() => handleCopy(cryptoAmount.toString())}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    ~ ${product.price_usd.toFixed(2)} USD
                  </div>
                </div>

                {/* Address */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center' }}>Deposit Address</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      readOnly 
                      value={depositAddress}
                      style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontFamily: 'monospace', outline: 'none' }}
                    />
                    <button 
                      onClick={() => handleCopy(depositAddress)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Timer & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <div>Time remaining: <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{formatTime(timer)}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span className="dot-pulse"></span> Listening for tx...
                  </div>
                </div>

                {copied && (
                  <div style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 600 }}>
                    Copied to clipboard!
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                  <div>
                    Do not close this page. Once paid, this screen will automatically refresh and redirect.
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 189, 129, 0.1)', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', justifyContents: 'center', marginBottom: '1.5rem', padding: '14px' }}>
                  <Check size={28} strokeWidth={3} />
                </div>
                
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Payment Confirmed!
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                  Your payment of {cryptoAmount.toFixed(4)} {coin} has been verified. We have sent the download instructions to <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{email}</span>.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Product Purchased:</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>{product.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Download links are valid for 48 hours. Please check your spam folder if you do not receive the email within 2 minutes.
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/templates')}
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px' }}
                >
                  Return to Store
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
      `}</style>
    </>
  );
}

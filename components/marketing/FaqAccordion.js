'use client';
import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FaqAccordion() {
  const faqs = [
    {
      q: "How does the file delivery work after payment?",
      a: "Once our node detects your crypto transaction on the blockchain (usually takes 1-3 minutes depending on network congestion), our server automatically generates a unique download token. This token is sent instantly to your email address and allows you to download your source files. The link is secure and valid for 48 hours."
    },
    {
      q: "Can I manage template pricing and edit assets?",
      a: "Yes, absolutely. We have built a secure administrator panel at `/admin`. Once logged in, you can configure template prices (in USD, which automatically calculate equivalent crypto amounts at checkout), upload new files, modify titles/descriptions, and delete old listings."
    },
    {
      q: "Which cryptocurrencies do you support?",
      a: "We currently support Bitcoin (BTC), Ethereum (ETH), Solana (SOL), and Tether (USDT on Tron/TRC-20 protocol). Paying with SOL or USDT (TRC-20) offers the fastest confirmation speeds (seconds) and near-zero network gas fees."
    },
    {
      q: "Are there any recurring monthly subscription fees?",
      a: "No. This system has been designed with a serverless architecture, using free tiers of Vercel, Supabase (PostgreSQL), and GitHub Releases. Your ongoing storage and hosting costs are $0. The only fees are the standard blockchain gas fees and a tiny processing fee from the crypto gateway."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section style={{ padding: '6rem 0 8rem 0', position: 'relative' }} className="reveal-on-scroll">
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h2 className="section-title">
            Frequently Asked <span>Questions</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Everything you need to know about purchasing templates and managing updates.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid',
                  borderColor: isOpen ? 'var(--border-hover)' : 'var(--border-color)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-main)'
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <HelpCircle size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                    {faq.q}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', flexShrink: 0 }}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                
                {/* Expandable Panel */}
                <div 
                  style={{
                    maxHeight: isOpen ? '250px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ padding: '0 1.5rem 1.5rem 2.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '1rem' }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

'use client';
import Link from 'next/link';
import { LayoutGrid, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TwitterIcon = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = useQuery(api.settings?.getSocialLinks);

  return (
    <footer style={{ padding: '3rem 0 2rem 0', borderTop: '1px solid var(--border-color)', marginTop: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
          {/* Left Side: Brand & Copyright */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                <LayoutGrid size={18} style={{ color: 'var(--primary)' }} />
                THEMES ZOO
              </span>
            </Link>
          </div>

          {/* Right Side: Links */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/templates" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              Templates
            </Link>
            <Link href="/services" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              Custom Services
            </Link>
            <a href="mailto:hello@themeszoo.com" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              Contact
            </a>

            {/* Dynamic Social Links */}
            {socialLinks && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                {socialLinks.x && (
                  <a href={socialLinks.x} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'} title="X (Twitter)">
                    <TwitterIcon size={16} />
                  </a>
                )}
                {socialLinks.reddit && (
                  <a href={socialLinks.reddit} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#ff4500'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'} title="Reddit">
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#06060c', fontWeight: 800 }}>R</span>
                    </div>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#E1306C'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'} title="Instagram">
                    <InstagramIcon size={16} />
                  </a>
                )}
                {socialLinks.pinterest && (
                  <a href={socialLinks.pinterest} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#e60023'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'} title="Pinterest">
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#06060c', fontWeight: 800 }}>P</span>
                    </div>
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#25D366'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'} title="WhatsApp">
                    <MessageCircle size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {year} Themes Zoo. All rights reserved.
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', animation: 'pulse 2s infinite' }}></div>
            All systems operational
          </span>
        </div>
        
      </div>
    </footer>
  );
}

'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GlobalBanner() {
  const bannerSetting = useQuery(api.marketing.getGlobalSetting, { key: "announcement_banner" });
  const [isVisible, setIsVisible] = useState(true);

  // If loading or no setting exists, don't show
  if (bannerSetting === undefined) return null;
  
  const bannerData = bannerSetting?.value;
  
  if (!bannerData || !bannerData.isActive || !isVisible) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 230, 118, 0.2)',
      color: 'var(--text-main)',
      position: 'relative',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem 1rem',
      fontSize: '0.85rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0 2.5rem', textAlign: 'center' }}>
        <span style={{ 
          background: 'rgba(0, 230, 118, 0.1)', 
          color: 'var(--primary)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
          padding: '0.15rem 0.6rem', 
          borderRadius: '100px', 
          fontSize: '0.65rem', 
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: '0 0 10px rgba(0, 230, 118, 0.15)'
        }}>
          NEW
        </span>
        <span dangerouslySetInnerHTML={{ __html: bannerData.text }} style={{ color: 'var(--text-main)', fontWeight: 600 }} />
        
        {bannerData.linkUrl && (
          <Link href={bannerData.linkUrl} style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            color: 'var(--primary)', 
            textDecoration: 'none',
            fontWeight: 700,
            borderBottom: '1px solid rgba(0, 230, 118, 0.3)',
            marginLeft: '0.25rem',
            transition: 'all 0.2s'
          }}>
            {bannerData.linkText || 'Learn More'} <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          right: '1rem',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.25rem',
          borderRadius: '4px',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
        }}
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}

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
      background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-fuchsia) 100%)',
      color: '#fff',
      position: 'relative',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.6rem 1rem',
      fontSize: '0.85rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '2rem' }}>
        <span style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '0.15rem 0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          NEW
        </span>
        <span dangerouslySetInnerHTML={{ __html: bannerData.text }} />
        
        {bannerData.linkUrl && (
          <Link href={bannerData.linkUrl} style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            color: '#fff', 
            textDecoration: 'none',
            fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            marginLeft: '0.25rem'
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

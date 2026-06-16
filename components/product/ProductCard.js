'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';

const WordPressLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365a9.8 9.8 0 0 0 3.328-.577c-.12-.218-.24-.447-.33-.679l-2.84-6.949zm5.342 3.125c.783-1.354 1.341-2.909 1.341-4.593 0-1.28-.276-2.5-.758-3.597l-4.103 11.238c1.378-.456 2.585-1.464 3.52-3.048zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 1.25c4.78 0 8.825 3.09 10.25 7.376-.046-.003-.092-.008-.14-.008-1.042 0-1.772.87-1.772 1.83 0 .807.48 1.498.924 2.128.444.629.9 1.258.9 2.217 0 .506-.118.995-.333 1.442L15.9 5.86c.662-.27 1.32-.45 1.32-.45V4.66s-1.05.09-2.07.09-2.07-.09-2.07-.09v.75s.6.06.99.18l-2.22 6.18-1.89-5.61c.42-.09.78-.18.78-.18v-.75s-.96.09-1.92.09c-.93 0-1.86-.09-1.86-.09v.75s.51.09.84.18l1.41 4.14-1.74 5.25L4.542 6.09c.414-.09.804-.15.804-.15v-.75s-1.01.09-1.97.09c-.542 0-1.154-.03-1.68-.09A10.706 10.706 0 0 1 12 1.25zM2.203 14.544c1.139-.24 2.249-.57 2.249-1.799 0-1.05-.87-1.62-1.62-2.13-.509-.36-.96-.78-.96-1.38 0-.54.45-.96.96-1.29.155-.098.317-.184.484-.263a10.707 10.707 0 0 0-1.968 5.753c.245.39.524.757.855 1.109z" />
  </svg>
);

const NextjsLogo = () => (
  <svg width="12" height="12" viewBox="0 0 128 128" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M64 0C28.65 0 0 28.65 0 64s28.65 64 64 64 64-28.65 64-64S99.35 0 64 0zm37.28 100.28L63.53 53.07v32.61h-7.62V42.32h7.62l34.8 49.33c.89-1.33 1.69-2.73 2.38-4.22-3.43-1.95-6.93-3.89-10.43-5.83V50c4.13 2.29 8.27 4.59 12.4 6.89v23.23c-1.25 7.42-4.82 14.07-10.02 19.16zM64 7.62c26.69 0 49.03 18.73 54.8 43.83l-34.8-49.33h-7.62v28.84c-3.15-1.75-6.3-3.5-9.45-5.25V7.62z" />
  </svg>
);

export default function ProductCard({ product }) {
  const { slug, name, category, price_usd, images, is_featured } = product;

  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const isWordPress = category?.toLowerCase() === 'wordpress';
  const cardCategoryClass = isWordPress ? 'card-wp' : 'card-tech';
  const tagLabel = isWordPress ? 'WordPress' : 'Next.js';
  const imageUrl = (images && images.length > 0) ? images[0] : `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`;
  const isFeatured = is_featured;

  return (
    <Link 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      href={`/templates/${slug}`}
      className={`card ${cardCategoryClass}`}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '0.6rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Spotlight cursor glow overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `radial-gradient(180px circle at ${coords.x}px ${coords.y}px, rgba(0, 230, 118, 0.08), transparent 80%)`,
          zIndex: 1,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {/* Image Container with Badges */}
        <div className="card-image-wrapper">
          {isFeatured && (
            <span className="card-badge-featured">
              Featured
            </span>
          )}
          <span className="card-badge-software">
            {isWordPress ? <WordPressLogo /> : <NextjsLogo />}
            {tagLabel}
          </span>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <Image 
              src={imageUrl} 
              alt={name} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="card-image"
            />
          </div>
        </div>
        
        {/* Info Rows */}
        <div className="card-info-row">
          <div className="card-info-left">
            <h3 className="card-title-new">{name}</h3>
            <div className="card-price-value">${price_usd.toFixed(2)} value</div>
          </div>
          <div className="card-info-right">
            <span className={`card-pill-tag ${price_usd === 0 ? 'tag-free' : 'tag-premium'}`}>
              {price_usd === 0 ? 'Free' : 'Premium'}
            </span>
          </div>
        </div>

        {/* Flat sliding bottom accent line */}
        <div className="card-accent-line" />
      </div>
    </Link>
  );
}

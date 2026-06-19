'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export default function ImageGallery({ images = [], alt = '' }) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const switchTo = useCallback((idx) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 200);
  }, [active]);

  const prev = useCallback(() => switchTo((active - 1 + images.length) % images.length), [active, images.length, switchTo]);
  const next = useCallback(() => switchTo((active + 1) % images.length), [active, images.length, switchTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, isLightboxOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  if (!images.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main image */}
      <div
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          aspectRatio: '16/10',
          background: '#0a0a0f',
          position: 'relative',
        }}
      >
        <Image
          src={images[active]}
          alt={`${alt} — screenshot ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
          style={{
            objectFit: 'cover',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.2s ease',
            cursor: 'zoom-in',
          }}
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Maximize Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(7,7,14,0.75)', border: '1px solid var(--border-color)',
            color: 'var(--text-main)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease', zIndex: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,7,14,0.75)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Prev / Next arrows — only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(7,7,14,0.75)', border: '1px solid var(--border-color)',
                color: 'var(--text-main)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease', zIndex: 5,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,7,14,0.75)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(7,7,14,0.75)', border: '1px solid var(--border-color)',
                color: 'var(--text-main)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease', zIndex: 5,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,7,14,0.75)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <ChevronRight size={18} />
            </button>

            {/* Counter pill */}
            <div style={{
              position: 'absolute', bottom: '12px', right: '12px',
              background: 'rgba(7,7,14,0.8)', border: '1px solid var(--border-color)',
              borderRadius: '100px', padding: '0.25rem 0.65rem',
              fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)',
              backdropFilter: 'blur(8px)', zIndex: 5,
            }}>
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip — only show if multiple images */}
      {images.length > 1 && (
        <div style={{
          display: 'flex', gap: '0.6rem',
          overflowX: 'auto', paddingBottom: '4px',
          scrollbarWidth: 'thin',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              aria-label={`View screenshot ${i + 1}`}
              style={{
                flexShrink: 0,
                width: '80px', height: '54px',
                borderRadius: '10px', overflow: 'hidden',
                border: i === active
                  ? '2px solid var(--primary)'
                  : '2px solid var(--border-color)',
                cursor: 'pointer', padding: 0, background: '#0a0a0f',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                transform: i === active ? 'scale(1.05)' : 'scale(1)',
                boxShadow: i === active ? '0 0 12px rgba(139,92,246,0.35)' : 'none',
                position: 'relative',
                scrollSnapAlign: 'start',
              }}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="80px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 3, 7, 0.95)', backdropFilter: 'blur(12px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Close Button */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10000, transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <X size={24} />
          </button>

          {/* Prev/Next for Lightbox */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                style={{
                  position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10000, transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={next}
                style={{
                  position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10000, transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Fullscreen Image */}
          <div style={{ position: 'relative', width: '90vw', height: '90vh' }}>
            <Image
              src={images[active]}
              alt={`${alt} — fullscreen ${active + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <div style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '100px',
            color: '#fff', fontSize: '0.9rem', fontWeight: 600
          }}>
            {active + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/product/ImageGallery';
import { ArrowLeft, Check, Sparkles, FileCode, Cpu, ShieldCheck, Tag, ShoppingCart, FileText, Layers } from 'lucide-react';
import useCart from '@/store/useCart';
import toast from 'react-hot-toast';
import ProductCard from '@/components/product/ProductCard';

// ─── Badge helpers ───────────────────────────────────────────────
const WPLogo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365a9.8 9.8 0 0 0 3.328-.577c-.12-.218-.24-.447-.33-.679l-2.84-6.949zm5.342 3.125c.783-1.354 1.341-2.909 1.341-4.593 0-1.28-.276-2.5-.758-3.597l-4.103 11.238c1.378-.456 2.585-1.464 3.52-3.048zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
);

export default function ProductClient({ product, relatedProducts }) {
  const { addItem, items, openCart } = useCart();
  
  const inCart = product && items.some(item => item._id === product._id);

  if (product === undefined) {
    return (
      <>
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--header-height)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading template details...</p>
        </main>
      </>
    );
  }

  // 404-like state for unknown slug
  if (product === null) {
    return (
      <>
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', paddingTop: 'var(--header-height)' }}>
          <p style={{ fontSize: '4rem' }}>🔍</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Product not found</h1>
          <Link href="/templates" className="btn btn-primary">Browse All Templates</Link>
        </main>
      </>
    );
  }

  const isWordPress = product.category?.toLowerCase() === 'wordpress';

  return (
    <>
      {/* Ambient background */}
      <div className="bg-glow-container">
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>

      <main style={{ minHeight: '80vh', paddingTop: '4rem', paddingBottom: '6rem' }}>
        <div className="product-container">

          {/* Back button */}
          <Link
            href="/templates"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={15} /> Back to Templates
          </Link>

          {/* 2-col layout */}
          <div className="product-detail-grid">

            {/* ── Left: Gallery + Description ───────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

              {/* Image Gallery */}
              <ImageGallery images={product.images} alt={product.name} />

              {/* Overview */}
              <div>
                <h2 className="product-overview-title">
                  Overview
                </h2>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1rem', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
                  {product.desc}
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Core Features
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', listStyle: 'none', padding: 0 }}>
                  {product.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)',
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Right: Purchase Sidebar ──────────── */}
            <div>
              <div className="product-sidebar-card" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '24px', position: 'sticky', top: '100px',
                maxHeight: 'calc(100vh - 120px)', overflowY: 'auto'
              }}>
                {/* Verified badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  <Sparkles size={11} /> Verified Product
                </div>

                {/* Category pill */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: isWordPress ? 'rgba(139,92,246,0.08)' : 'rgba(6,182,212,0.08)', border: `1px solid ${isWordPress ? 'rgba(139,92,246,0.2)' : 'rgba(6,182,212,0.2)'}`, borderRadius: '100px', color: isWordPress ? 'var(--primary)' : 'var(--accent-cyan)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '1rem', marginLeft: '0.5rem' }}>
                  {isWordPress ? <WPLogo /> : <Tag size={10} />}
                  {isWordPress ? 'WordPress' : 'Website Template'}
                </div>

                <h1 className="product-title">
                  {product.name}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                  {product.short_desc}
                </p>

                {/* Price */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem 0', marginBottom: '1.75rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>One-time Price</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900 }}>
                    ${product.price_usd.toFixed(2)}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Cpu size={14} /> Technology
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>{product.tech}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FileCode size={14} /> File Size
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>{product.filesize}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      📸 Screenshots
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>{product.images.length} included</span>
                  </div>
                </div>

                {/* CTA */}
                {product.pdf_url && (
                  <Link
                    href={product.pdf_url}
                    target="_blank"
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', justifyContent: 'center', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(56, 189, 248, 0.05)', color: 'var(--accent-cyan)' }}
                  >
                    <FileText size={16} /> View Documentation
                  </Link>
                )}

                {product.demo_url && (
                  <Link
                    href={product.demo_url}
                    target="_blank"
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', justifyContent: 'center', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
                  >
                    <Sparkles size={16} /> Live Preview
                  </Link>
                )}

                <button
                  onClick={() => {
                    if (!inCart) {
                      addItem(product);
                      toast.success(`${product.name} added to cart!`);
                      openCart();
                    } else {
                      openCart();
                    }
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '54px' }}
                >
                  <ShoppingCart size={18} /> {inCart ? 'View in Cart' : 'Add to Cart'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <ShieldCheck size={13} color="var(--accent-emerald)" />
                  Secure automated file delivery via email
                </div>
              </div>
            </div>

          </div>

          {/* ── Related Products ────────────── */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <Layers size={24} color="var(--primary)" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
                  You might also like
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {relatedProducts.map(relProd => (
                  <ProductCard key={relProd._id} product={relProd} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Sticky Checkout */}
      <div className="mobile-sticky-checkout">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>One-time Price</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-main)', lineHeight: 1 }}>${product.price_usd.toFixed(2)}</span>
        </div>
        <button
          onClick={() => {
            if (!inCart) {
              addItem(product);
              toast.success(`${product.name} added to cart!`);
              openCart();
            } else {
              openCart();
            }
          }}
          className="btn btn-primary"
          style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem', minHeight: '48px', flexShrink: 0 }}
        >
          {inCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </>
  );
}

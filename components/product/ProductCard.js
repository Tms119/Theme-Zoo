'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast from 'react-hot-toast';
import useCart from '@/store/useCart';

export default function ProductCard({ product }) {
  const { slug, name, category, price_usd, images, is_featured } = product;
  const { user } = useUser();
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { addItem, openCart } = useCart();

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isWishlisted = useQuery(api.wishlist.check, userEmail ? { user_email: userEmail, product_id: product._id } : 'skip');
  const toggleWishlist = useMutation(api.wishlist.toggle);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userEmail) {
      toast.error('Please sign in to save templates to your wishlist.');
      return;
    }
    try {
      const added = await toggleWishlist({ user_email: userEmail, product_id: product._id });
      toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist.');
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    openCart();
    toast.success('Added to cart!');
  };

  const isWordPress = category?.toLowerCase() === 'wordpress';
  const cardCategoryClass = isWordPress ? 'card-wp' : 'card-tech';
  const tagLabel = isWordPress ? 'WordPress' : 'Next.js';
  const imageUrl = product.thumbnail_url || ((images && images.length > 0) ? images[0] : `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`);
  const isFeatured = is_featured;

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`card ${cardCategoryClass}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '0.6rem',
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}
    >
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
      
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <Link href={`/templates/${slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div className="card-image-wrapper">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                color: isWishlisted ? '#ef4444' : '#fff'
              }}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              className="wishlist-btn"
            >
              <Heart size={18} fill={isWishlisted ? '#ef4444' : 'transparent'} stroke={isWishlisted ? '#ef4444' : 'currentColor'} />
            </button>

            {isFeatured && (
              <span className="card-badge-featured">
                Featured
              </span>
            )}

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
          
          <div className="card-info-row" style={{ paddingBottom: '0.5rem', flexGrow: 1, alignItems: 'flex-start' }}>
            <div className="card-info-left" style={{ flexGrow: 1, paddingRight: '0.5rem' }}>
              <h3 className="card-title-new" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{name}</h3>
              <span className={`card-pill-tag ${price_usd === 0 ? 'tag-free' : 'tag-premium'}`} style={{ display: 'inline-block' }}>
                {price_usd === 0 ? 'Free' : 'Premium'}
              </span>
            </div>
          </div>
        </Link>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            ${price_usd.toFixed(2)}
          </div>
          
          <button 
            onClick={handleAddToCart}
            style={{
              background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '10px',
              padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 230, 118, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>

        {/* Flat sliding bottom accent line */}
        <div className="card-accent-line" />
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCart from '@/store/useCart';
import { X, Trash2, ShoppingCart, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth, SignInButton } from '@clerk/nextjs';

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, getCartTotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const { isSignedIn } = useAuth();
  
  // Prevent hydration errors with Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              zIndex: 9999
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '400px',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-color)',
              zIndex: 10000,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} /> Your Cart
              </h2>
              <button onClick={closeCart} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--border-color)', overflow: 'hidden', flexShrink: 0 }}>
                      {item.images && item.images[0] && (
                        <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem', lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.category}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>${item.price_usd.toFixed(2)}</div>
                    </div>
                    <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', height: 'fit-content' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                
                {isSignedIn ? (
                  <button 
                    onClick={() => {
                      // Redirect to dummy checkout flow
                      window.location.href = '/checkout';
                    }}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
                  >
                    <Lock size={16} /> Secure Checkout
                  </button>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>You must sign in to checkout.</div>
                    <SignInButton mode="modal" fallbackRedirectUrl="/checkout" signUpFallbackRedirectUrl="/checkout">
                      <button className="btn" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={16} /> Sign In
                      </button>
                    </SignInButton>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

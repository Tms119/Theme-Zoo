'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutGrid, Menu, X, ShoppingCart } from 'lucide-react';
import useCart from '@/store/useCart';
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { openCart, items } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // 1. Calculate scroll progress percentage
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }

      // 2. Hide / Reveal navbar based on scroll direction
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true); // scrolling down
        setMenuOpen(false); // auto close menu on scroll down
      } else {
        setHidden(false); // scrolling up
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Viewport Scroll Progress Line */}
      <div 
        className="scroll-progress-indicator" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <nav 
        className="navbar" 
        style={{
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999
        }}
      >
        <div className="container navbar-inner">
          <Link href="/" className="logo">
            <img src="/themezoo_logo.png" alt="Themes Zoo Logo" className="brand-logo-img" />
          </Link>
          
          <ul className="nav-links">
            <li>
              <Link href="/" className="nav-link">Home</Link>
            </li>
            <li>
              <Link href="/templates" className="nav-link">Templates</Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="nav-link">How It Works</Link>
            </li>
            <li>
              <Link href="/#custom-order" className="nav-link">Custom Services</Link>
            </li>
          </ul>
          
          <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {mounted && (
              <button 
                onClick={openCart} 
                style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <ShoppingCart size={18} />
                {items.length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {items.length}
                  </span>
                )}
              </button>
            )}
            
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px' }}>Sign In</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/dashboard" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Dashboard</Link>
                <div style={{ transform: 'scale(1.2)', transformOrigin: 'center', display: 'flex' }}>
                  <UserButton />
                </div>
              </div>
            </Show>
          </div>

          {/* Hamburger Menu Trigger for Mobile */}
          <button 
            className="nav-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              padding: '0.5rem',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Panel */}
      <div 
        className={`nav-mobile-drawer ${menuOpen ? 'active' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          background: 'rgba(3, 3, 7, 0.96)',
          backdropFilter: 'blur(24px)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ width: '80%', maxWidth: '400px', textAlign: 'center' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2rem', padding: 0, margin: '0 0 2rem 0' }}>
            <li>
              <Link 
                href="/" 
                onClick={() => setMenuOpen(false)} 
                style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/templates" 
                onClick={() => setMenuOpen(false)} 
                style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              >
                Templates
              </Link>
            </li>
            <li>
              <Link 
                href="/#how-it-works" 
                onClick={() => setMenuOpen(false)} 
                style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                href="/#custom-order" 
                onClick={() => setMenuOpen(false)} 
                style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              >
                Custom Services
              </Link>
            </li>
          </ul>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }} 
              className="btn" 
              style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <ShoppingCart size={18} style={{ marginRight: '0.5rem' }} /> View Cart ({mounted ? items.length : 0})
            </button>
            
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link 
                href="/dashboard" 
                onClick={() => setMenuOpen(false)} 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}

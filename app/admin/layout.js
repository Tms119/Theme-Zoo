'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, LayoutDashboard, FilePlus, LogOut, ArrowLeft, KeySquare, Archive, Tags, Package, Tag, LifeBuoy, Briefcase, Megaphone } from 'lucide-react';

import { useUser, SignInButton } from '@clerk/nextjs';

export default function AdminLayout({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const pathname = usePathname();

  const tabLinks = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/templates', label: 'Templates' },
    { href: '/admin/sales', label: 'Sales' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/promo', label: 'Promo Codes' },
    { href: '/admin/marketing', label: 'Marketing' },
    { href: '/admin/services', label: 'Custom Services' },
    { href: '/admin/support', label: 'Support Tickets' },
    { href: '/admin/settings', label: 'Settings' },
    { href: '/admin/blog', label: 'Blog Posts' },
  ];

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#06060c', color: '#fff' }}>
        <p>Verifying Access...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#06060c', color: '#fff', fontFamily: 'sans-serif', padding: '1rem' }}>
        <div style={{ background: 'rgba(15,15,27,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '420px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '14px' }}>
            <KeySquare size={28} />
          </div>
          
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Admin Panel</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>Please sign in to access the administrator dashboard.</p>
          
          <SignInButton mode="modal">
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px' }}>
              Sign In
            </button>
          </SignInButton>

          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.85rem', marginTop: '1.5rem' }}>
            <ArrowLeft size={14} /> Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const adminEmails = ['mohammadsayemweb@gmail.com', 'htmlocean@gmail.com'];
  const isAuthorized = userEmail && adminEmails.includes(userEmail);

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#06060c', color: '#fff', fontFamily: 'sans-serif', padding: '1rem' }}>
        <div style={{ background: 'rgba(15,15,27,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '420px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '14px' }}>
            <ShieldAlert size={28} />
          </div>
          
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Access Denied</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>Your account ({userEmail}) does not have administrator privileges.</p>
          
          <Link href="/" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', display: 'flex', justifyContent: 'center' }}>
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#06060c', color: '#f9fafb' }}>
      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-header-left">
            <Link href="/admin" className="admin-logo">
              Themes Zoo <span className="admin-badge">ADMIN</span>
            </Link>
          </div>

          <div className="admin-header-right">
            <Link href="/" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '8px' }}>
              Storefront
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="admin-main">
        <div className="admin-content-wrapper">
          {/* Global Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
            {tabLinks.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
          {children}
        </div>
      </main>

      <style jsx global>{`
        .admin-header {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(6,6,12,0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .admin-header-container {
          width: 100%;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .admin-header-left, .admin-header-right {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .admin-nav {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 0.5rem;
          margin-bottom: -0.5rem;
        }
        .admin-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .admin-badge {
          font-size: 0.7rem;
          background: #7c3aed;
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
          color: #fff;
          font-weight: 600;
        }
        .admin-nav-link {
          color: #9ca3af;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .admin-nav-link span {
          display: none;
        }
        .admin-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .admin-logout-btn span {
          display: none;
        }
        .admin-main {
          flex-grow: 1;
          padding: 1.5rem 1rem;
        }
        .admin-content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        @media (min-width: 768px) {
          .admin-header-container {
            flex-direction: row;
            justify-content: space-between;
            padding: 0 2rem;
            height: 70px;
          }
          .admin-nav {
            gap: 1.5rem;
            margin-left: 1rem;
          }
          .admin-logo {
            font-size: 1.25rem;
          }
          .admin-nav-link span, .admin-logout-btn span {
            display: inline;
          }
          .admin-main {
            padding: 2.5rem 2rem;
          }
        }
      `}</style>
    </div>
  );
}

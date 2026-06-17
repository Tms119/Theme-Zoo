'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, Layers, ShoppingBag, Settings, LogOut, Tags, X, Shield, FileText, LifeBuoy, Briefcase } from 'lucide-react';
import { useAuth, useUser, SignInButton, SignOutButton } from '@clerk/nextjs';

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user?.primaryEmailAddress?.emailAddress === adminEmail;

  const navItems = [
    { name: 'Discover', href: '/', icon: <Compass size={18} /> },
    { name: 'Templates', href: '/templates', icon: <Layers size={18} /> },
    { name: 'Custom Services', href: '/#custom-order', icon: <Briefcase size={18} /> },
    { name: 'Privacy Policy', href: '/privacy', icon: <Shield size={18} /> },
    { name: 'Terms & Conditions', href: '/terms', icon: <FileText size={18} /> },
  ];

  if (isSignedIn) {
    navItems.push({ name: 'Purchases', href: '/dashboard', icon: <ShoppingBag size={18} /> });
    navItems.push({ name: 'Support', href: '/support', icon: <LifeBuoy size={18} /> });
  }

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', href: '/admin', icon: <Settings size={18} /> });
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          THEMES ZOO
        </span>
        {/* Mobile Close Button */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Balance Block */}
      <div className="sidebar-bottom">
        {isSignedIn ? (
          <div className="balance-card">
            <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Profile</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <img src={user?.imageUrl} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {user?.fullName || user?.firstName || 'User'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '2px' }}>
                  <Link href="/settings" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Settings</Link>
                  <span style={{ color: '#444' }}>•</span>
                  <SignOutButton>
                    <button style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', color: '#999', cursor: 'pointer' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#999'}>
                      Log out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="connect-wallet-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              SIGN IN
            </button>
          </SignInButton>
        )}
      </div>

    </aside>
  );
}

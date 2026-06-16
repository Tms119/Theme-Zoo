'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Layers, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user?.primaryEmailAddress?.emailAddress === adminEmail;

  // Base items
  const navItems = [
    { name: 'Discover', href: '/', icon: <Compass size={22} /> },
    { name: 'Templates', href: '/templates', icon: <Layers size={22} /> },
  ];

  if (isSignedIn) {
    navItems.push({ name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={22} /> });
  }

  // Profile/Settings or Admin
  if (isAdmin) {
    navItems.push({ name: 'Admin', href: '/admin', icon: <Settings size={22} /> });
  } else if (isSignedIn) {
    navItems.push({ name: 'Profile', href: '/settings', icon: <Settings size={22} /> });
  }

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <div className="bottom-nav-icon">{item.icon}</div>
            <span className="bottom-nav-label">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

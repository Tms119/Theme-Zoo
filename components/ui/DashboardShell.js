'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import TopHeader from '@/components/ui/TopHeader';

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // If we are in the admin panel, DO NOT apply the dashboard layout shell
  if (pathname && pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="dashboard-layout">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="dashboard-main">
        <TopHeader setSidebarOpen={setIsSidebarOpen} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

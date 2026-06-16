'use client';
import { ShoppingCart, Menu } from 'lucide-react';
import useCart from '@/store/useCart';

export default function TopHeader({ setSidebarOpen }) {
  const { items, openCart } = useCart();
  const itemCount = items.length;

  return (
    <header className="top-header">
      <div className="mobile-menu-btn">
        <button 
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0.5rem' }}
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="header-spacer"></div>
      
      <div className="header-actions">
        <button className="cart-btn" onClick={() => openCart()}>
          <ShoppingCart size={18} />
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
      </div>

    </header>
  );
}

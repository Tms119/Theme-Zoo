'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from 'next/link';
import { PlusCircle, FileText, CheckCircle2, TrendingUp, DollarSign, ExternalLink, Eye, EyeOff, LifeBuoy, Mail, Copy, Users, GripVertical, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import RevenueChart from '@/components/admin/RevenueChart';

export default function AdminDashboard() {
  const products = useQuery(api.products.listAll);
  
  const {
    results: orders,
  } = usePaginatedQuery(api.orders.listPaginated, {}, { initialNumItems: 20 });
  
  const orderStats = useQuery(api.orders.getStats);

  const [extMetrics, setExtMetrics] = useState({ totalUsers: 0 });
  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/metrics');
        if (res.ok) {
          const data = await res.json();
          setExtMetrics({ totalUsers: data.totalUsers || 0 });
        }
      } catch (e) {
        console.error("Metrics Error:", e);
      }
    };
    fetchMetrics();
  }, []);

  if (products === undefined || orders === undefined || orderStats === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Data...</p>
      </div>
    );
  }

  // Calculate total revenue dynamically
  const totalRevenue = orderStats ? orderStats.totalRevenue : 0;
  const totalOrders = orderStats ? orderStats.totalOrders : 0;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage templates, view pricing configurations, and monitor sales transaction status.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', maxWidth: 'max-content' }} className="admin-header-actions">
          <Link href="/admin/products" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', flexGrow: 1, textAlign: 'center', justifyContent: 'center' }}>
            <PlusCircle size={16} /> Add New Template
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)} USD`, desc: 'Total gross volume', icon: <DollarSign size={20} color="var(--accent-emerald)" />, glow: 'rgba(16, 189, 129, 0.04)' },
          { label: 'Total Sales', value: `${totalOrders} Completed`, desc: '100% automatic delivery', icon: <CheckCircle2 size={20} color="var(--primary)" />, glow: 'rgba(124, 58, 237, 0.04)' },
          { label: 'Total Users', value: `${extMetrics.totalUsers}`, desc: 'Registered accounts via Clerk', icon: <Users size={20} color="var(--accent-amber)" />, glow: 'rgba(245, 158, 11, 0.04)' },
          { label: 'Active Items', value: `${products.filter(p => p.is_active).length} Listed`, desc: 'WordPress & HTML themes', icon: <FileText size={20} color="var(--accent-cyan)" />, glow: 'rgba(6, 182, 212, 0.04)' },
        ].map((card, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: `0 4px 30px ${card.glow}` }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{card.desc}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.5rem', display: 'flex' }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Overview */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Latest Sales</h2>
          <Link href="/admin/sales" style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>View All →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Template</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Buyer</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.slice(0, 5).map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{o.product_name}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{o.buyer_email}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>${o.price_usd.toFixed(2)}</td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .show-mobile-cell, .show-mobile-row {
          display: none !important;
        }
        @media (min-width: 992px) {
          .admin-grid-double {
            grid-template-columns: 1fr 1.2fr !important;
          }
        }
        @media (max-width: 768px) {
          .admin-header-actions {
            max-width: 100% !important;
          }
          .hide-mobile {
            display: none !important;
          }
          .show-mobile-cell {
            display: table-cell !important;
          }
          .show-mobile-row {
            display: table-row !important;
          }
        }
      `}</style>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Download, PackageOpen, FileText } from 'lucide-react';

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const convex = useConvex();
  const orders = useQuery(api.orders.listByUser, user ? { buyer_id: user.id } : "skip");
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (orderId) => {
    try {
      setDownloading(orderId);
      const url = await convex.query(api.orders.getDownloadUrl, { 
        order_id: orderId, 
        buyer_id: user.id 
      });
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      alert("Error generating download link: " + err.message);
    } finally {
      setDownloading(null);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Please sign in to view your purchases.</p>
        </div>
        </>
    );
  }

  return (
    <>
      <main style={{ minHeight: '80vh', paddingTop: '100px', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Welcome, {user?.firstName || 'User'}!</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your purchased templates and downloads.</p>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PackageOpen size={20} /> Your Templates
          </h2>

          {orders === undefined ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }}></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You haven't purchased any templates yet.</p>
              <Link href="/templates" className="btn btn-primary">Browse Templates</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {orders.map((order) => (
                <div key={order._id} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{order.product_name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Purchased: {new Date(order._creationTime).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', borderRadius: '100px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Tx ID: {order.tx_hash ? `${order.tx_hash.substr(0, 10)}...` : 'N/A'}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleDownload(order._id)}
                      disabled={downloading === order._id}
                      className="btn btn-primary" 
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <Download size={16} /> 
                      {downloading === order._id ? 'Wait...' : 'Download'}
                    </button>
                    <Link
                      href={`/invoice/${order._id}`}
                      className="btn btn-secondary"
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)' }}
                    >
                      <FileText size={16} /> Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

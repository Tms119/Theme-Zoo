'use client';
import { useState } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { Download, PackageOpen, FileText, Heart, Receipt } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const convex = useConvex();
  const [activeTab, setActiveTab] = useState('purchases');
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const orders = useQuery(api.orders.listByEmail, userEmail ? { email: userEmail } : "skip");
  const customServices = useQuery(api.services.listOrdersByEmail, userEmail ? { email: userEmail } : "skip");
  const wishlistedProducts = useQuery(api.wishlist.listByUser, userEmail ? { user_email: userEmail } : "skip");
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (orderId) => {
    try {
      setDownloading(orderId);
      const url = await convex.query(api.orders.getDownloadUrl, { 
        order_id: orderId, 
        email: userEmail 
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
            <p style={{ color: 'var(--text-secondary)' }}>Manage your account, purchases, and saved items.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setActiveTab('purchases')}
              style={{ background: activeTab === 'purchases' ? 'var(--primary)' : 'transparent', color: activeTab === 'purchases' ? '#fff' : 'var(--text-secondary)', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <PackageOpen size={18} /> Purchases
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              style={{ background: activeTab === 'wishlist' ? 'var(--primary)' : 'transparent', color: activeTab === 'wishlist' ? '#fff' : 'var(--text-secondary)', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <Heart size={18} /> Wishlist
            </button>
          </div>

          {activeTab === 'purchases' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PackageOpen size={20} /> Your Templates
              </h2>

              {orders === undefined || customServices === undefined ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }}></div>
                  ))}
                </div>
              ) : orders.length === 0 && customServices.length === 0 ? (
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
                  
                  {/* Custom Services Rendering */}
                  {customServices && customServices.length > 0 && customServices.map((service) => (
                    <div key={service._id} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#c084fc' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: '#c084fc' }}>Custom Service: {service.service_type === 'tier1' ? 'Theme Installation' : service.service_type === 'tier2' ? 'Pro Customization' : 'Custom Build'}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Requested: {new Date(service._creationTime).toLocaleDateString()}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: service.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245, 158, 11, 0.1)', color: service.status === 'paid' ? 'var(--accent-emerald)' : 'var(--accent-amber)', borderRadius: '100px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {service.status}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Tx ID: {service.tx_hash ? `${service.tx_hash.substr(0, 10)}...` : 'N/A'}<br/>
                        Budget: {service.budget || `$${service.price_usd}`}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {service.status === 'paid' ? 'Payment received. An admin will contact you shortly to begin the project.' : service.status === 'pending' ? 'Waiting for blockchain confirmation...' : 'Inquiry submitted. We will contact you soon.'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                Saved Templates
              </h2>
              
              {!wishlistedProducts || wishlistedProducts.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                  <Heart size={48} color="var(--border-color)" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any templates yet.</p>
                  <Link href="/templates" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Browse Templates
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                  {wishlistedProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

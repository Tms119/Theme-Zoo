'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Download, ShieldCheck, FileArchive, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token || '';
  
  const [expiresAt, setExpiresAt] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the order data live from Convex
  // We skip if no token is present
  const order = useQuery(api.orders.getById, token ? { id: token } : 'skip');
  const product = useQuery(api.products.getById, order?.product_id ? { id: order.product_id } : 'skip');
  
  // The secure mutation to fetch the actual file URL
  const getDownloadUrl = useMutation(api.orders.getGuestDownloadUrl);

  useEffect(() => {
    // 48 hours from delivery time, or from now if not loaded
    if (order?.delivered_at) {
      setExpiresAt(new Date(order.delivered_at + 172800000).toLocaleString());
    } else {
      setExpiresAt(new Date(Date.now() + 172800000).toLocaleString());
    }
  }, [order]);

  const handleDownloadTrigger = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setError('');
    
    try {
      // Securely fetch the URL via Convex mutation, which double-checks the paid status
      const fileUrl = await getDownloadUrl({ order_id: token });
      
      if (!fileUrl) {
        throw new Error("Download link could not be generated.");
      }
      
      // Proxy all direct file links to enforce our custom filename.
      // We skip viewer sites like Google Drive or Dropbox since proxying them would just download their HTML pages.
      const isViewerSite = fileUrl.includes('drive.google.com') || fileUrl.includes('dropbox.com');
      
      if (!isViewerSite) {
        const cleanName = product.name ? product.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'template';
        const timestamp = new Date().getTime();
        const proxyUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(cleanName)}&t=${timestamp}`;
        window.location.href = proxyUrl;
      } else {
        // Trigger the download by navigating to the secure URL (external links)
        window.location.href = fileUrl;
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to initiate download. Ensure your payment was successful.");
    } finally {
      setDownloading(false);
    }
  };

  if (order === undefined || product === undefined) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (order === null || product === null) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2>Invalid Download Link</h2>
        <p style={{ marginTop: '0.5rem' }}>This order does not exist or has been removed.</p>
        <button onClick={() => router.push('/')} className="btn btn-secondary" style={{ marginTop: '2rem' }}>Return Home</button>
      </div>
    );
  }

  if (order.status !== 'paid') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <ShieldCheck size={48} color="var(--accent-amber)" style={{ marginBottom: '1rem' }} />
        <h2>Payment Pending</h2>
        <p style={{ marginTop: '0.5rem' }}>This order has not been fully verified on the blockchain yet.</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>Please wait a few minutes and refresh this page.</p>
        <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ marginTop: '2rem' }}>Refresh Page</button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      
      <main style={{ minHeight: '85vh', paddingTop: 'calc(var(--header-height) + 3rem)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '3rem', width: '100%', maxWidth: '560px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
            
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', padding: '16px' }}>
              <FileArchive size={32} />
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
              Download Template
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Secure transaction verified. Click below to retrieve your source files.
            </p>

            {error && (
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                <span>{error}</span>
              </div>
            )}

            {/* Info Table */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Asset</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{product.name}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>File Size</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{product.filesize || 'Unknown'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Authorized For</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{order.buyer_email}</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Link Expiration</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', fontWeight: 500 }}>{expiresAt}</div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button 
              onClick={handleDownloadTrigger}
              disabled={downloading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {downloading ? <Loader2 className="animate-spin" size={20} /> : null}
              {downloading ? 'Preparing Download...' : 'Download Asset'}
              {!downloading && <Download size={18} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> Verified safe and scanned by blockchain delivery.
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

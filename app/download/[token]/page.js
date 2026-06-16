'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Download, ShieldCheck, FileArchive } from 'lucide-react';

export default function DownloadPage() {
  const params = useParams();
  const token = params?.token || '';
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    // Generate dates on the client to avoid server-client static mismatch
    setExpiresAt(new Date(Date.now() + 172800000).toLocaleString());
  }, []);

  const purchase = {
    productName: "AstraGlow - Cyberpunk Portfolio WordPress Theme",
    buyerEmail: "customer@domain.com",
    fileUrl: "#", // mock download trigger
    fileSize: "14.2 MB"
  };

  const handleDownloadTrigger = (e) => {
    e.preventDefault();
    alert("Starting download of AstraGlow-Cyberpunk-Theme.zip (14.2 MB)...");
  };

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

            {/* Info Table */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Asset</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{purchase.productName}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>File Size</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{purchase.fileSize}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Authorized For</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{purchase.buyerEmail}</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Link Expiration</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', fontWeight: 500 }}>{expiresAt || 'Verifying...'} (48 hours)</div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <a 
              href="#" 
              onClick={handleDownloadTrigger}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', marginBottom: '1.5rem' }}
            >
              Download ZIP Archive <Download size={18} style={{ marginLeft: '6px' }} />
            </a>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> Verified safe and scanned by blockchain delivery.
            </div>

          </div>
        </div>
      </main>

    </>
  );
}

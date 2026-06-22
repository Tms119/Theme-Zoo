'use client';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileArchive, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkUploadPage() {
  const [uploads, setUploads] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createProduct = useMutation(api.products.create);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files) => {
    // Only accept zip/tar
    const validFiles = files.filter(f => f.name.endsWith('.zip') || f.name.endsWith('.tar.gz') || f.name.endsWith('.rar'));

    if (validFiles.length === 0) {
      alert("Please upload valid archive files (.zip, .rar, .tar.gz)");
      return;
    }

    const newUploads = validFiles.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending', // pending, uploading, processing, complete, error
      errorMsg: ''
    }));

    setUploads(prev => [...newUploads, ...prev]);

    // Start uploading them immediately
    newUploads.forEach(uploadItem => {
      uploadFileAndCreateDraft(uploadItem);
    });
  };

  const uploadFileAndCreateDraft = async (uploadItem) => {
    try {
      // 1. Upload to storage
      updateUploadStatus(uploadItem.id, { status: 'uploading', progress: 50 });

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": uploadItem.file.type || "application/zip" },
        body: uploadItem.file,
      });

      const { storageId } = await result.json();

      const urlObj = new URL(process.env.NEXT_PUBLIC_CONVEX_URL);
      const publicUrl = `https://${urlObj.hostname}/api/storage/${storageId}`;

      // 2. Create Draft Product
      updateUploadStatus(uploadItem.id, { status: 'processing', progress: 90 });

      const name = uploadItem.file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const slug = `draft-${Math.random().toString(36).substr(2, 6)}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      await createProduct({
        name: name,
        slug: slug,
        category: 'wordpress',
        short_desc: 'Draft uploaded via Bulk Uploader. Please edit this text.',
        desc: 'Draft uploaded via Bulk Uploader. Please edit this text before publishing.',
        price_usd: 0.00,
        images: [],
        features: ['Draft Feature 1', 'Draft Feature 2'],
        tech: 'WordPress',
        filesize: `${(uploadItem.file.size / (1024 * 1024)).toFixed(1)} MB`,
        is_active: false,
        file_id: storageId,
        file_url: publicUrl,
      });

      updateUploadStatus(uploadItem.id, { status: 'complete', progress: 100 });
    } catch (err) {
      console.error("Upload failed", err);
      updateUploadStatus(uploadItem.id, { status: 'error', errorMsg: err.message });
    }
  };

  const updateUploadStatus = (id, updates) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 }}>
          Bulk Asset Uploader
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Drop multiple ZIP source files here. They will automatically be uploaded to cloud storage and saved as "Hidden" Drafts.
        </p>
      </div>

      <div className="bulk-grid">
        {/* Dropzone */}
        <div>
          <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: isDragging ? 'var(--primary)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDragging ? '#000' : 'var(--accent-cyan)', transition: 'all 0.3s ease' }}>
                <UploadCloud size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Drag & Drop Archive Files</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Supports .zip, .rar, .tar.gz up to 50MB per file.</p>
                <label className="btn btn-secondary">
                  Browse Files
                  <input type="file" multiple accept=".zip,.rar,.tar.gz" style={{ display: 'none' }} onChange={handleFileSelect} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Queue */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', height: '100%', minHeight: '400px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Upload Queue</h2>

            {uploads.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                <FileArchive size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No files in queue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {uploads.map((upload) => (
                  <div key={upload.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: upload.status === 'complete' ? 'var(--accent-emerald)' : upload.status === 'error' ? '#ef4444' : 'var(--primary)' }}>
                          {upload.status === 'complete' ? <CheckCircle size={20} /> : upload.status === 'error' ? <AlertCircle size={20} /> : <FileArchive size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>{upload.file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: upload.status === 'complete' ? 'var(--accent-emerald)' : upload.status === 'error' ? '#ef4444' : 'var(--accent-cyan)' }}>
                        {upload.status}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {upload.status !== 'error' && upload.status !== 'complete' && (
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ width: `${upload.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan))', transition: 'width 0.3s ease' }} />
                      </div>
                    )}

                    {upload.status === 'error' && (
                      <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>
                        {upload.errorMsg}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .bulk-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 992px) {
          .bulk-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .dropzone {
          border: 2px dashed var(--border-color);
          border-radius: 24px;
          background: rgba(255,255,255,0.01);
          padding: 4rem 2rem;
          height: 100%;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dropzone.dragging {
          border-color: var(--primary);
          background: rgba(139, 92, 246, 0.05);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

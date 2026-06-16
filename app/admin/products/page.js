'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, UploadCloud, FileArchive, Image as ImageIcon, X, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import ProductCard from '@/components/product/ProductCard';

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;

  const existingProduct = useQuery(api.products.getById, isEditMode ? { id: productId } : "skip");
  const dbCategories = useQuery(api.categories.listAll);
  
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const getFileUrl = useMutation(api.products.getFileUrl);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const createCategory = useMutation(api.categories.create);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('wordpress');
  const [demoUrl, setDemoUrl] = useState('');
  const [features, setFeatures] = useState('');
  
  // Inline Category Creator
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [catCreating, setCatCreating] = useState(false);
  
  // File State
  const [images, setImages] = useState([]); // File objects for new uploads
  const [existingImages, setExistingImages] = useState([]); // Strings of URLs
  const [zipFile, setZipFile] = useState(null);
  const [existingZipUrl, setExistingZipUrl] = useState('');

  // Live Preview Object
  const livePreviewData = {
    _id: "preview-id",
    slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : "preview-slug",
    name: name || "Product Name",
    short_desc: shortDesc || "Your short tagline will appear here...",
    price_usd: parseFloat(price) || 0.00,
    images: images.length > 0 ? [URL.createObjectURL(images[0])] : (existingImages.length > 0 ? existingImages : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"]),
    category: category
  };

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || '');
      setShortDesc(existingProduct.short_desc || '');
      setDesc(existingProduct.desc || '');
      setPrice(existingProduct.price_usd?.toString() || '');
      setCategory(existingProduct.category || 'wordpress');
      setDemoUrl(existingProduct.demo_url || '');
      setFeatures(existingProduct.features?.join('\n') || '');
      setExistingImages(existingProduct.images || []);
      setExistingZipUrl(existingProduct.file_url || '');
    }
  }, [existingProduct]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file sizes (5MB limit)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`One or more images exceed the 5MB limit. Please choose smaller images.`);
      return;
    }
    
    setError('');
    setImages(prev => [...prev, ...files]);
  };

  const handleZipChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check ZIP size (50MB limit for browser stability)
    const MAX_ZIP_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_ZIP_SIZE) {
      setError(`The ZIP file exceeds the 50MB limit. Consider compressing it further or splitting assets.`);
      return;
    }
    
    setError('');
    setZipFile(file);
  }

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFileToConvex = async (file) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !shortDesc || !price) {
      setError('Please fill in Name, Short Description, and Price.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. Upload new images
      let finalImages = [...existingImages];
      if (images.length > 0) {
        setUploadProgress('Uploading images...');
        for (const imgFile of images) {
          const storageId = await uploadFileToConvex(imgFile);
          const publicUrl = await getFileUrl({ storageId });
          finalImages.push(publicUrl);
        }
      }

      // 2. Upload ZIP file if present
      let finalFileId = existingProduct?.file_id;
      let finalFileUrl = existingZipUrl;
      
      if (zipFile) {
        setUploadProgress('Uploading source ZIP file (this may take a moment)...');
        finalFileId = await uploadFileToConvex(zipFile);
        finalFileUrl = await getFileUrl({ storageId: finalFileId });
      }

      setUploadProgress('Saving product details...');

      const payload = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        short_desc: shortDesc,
        desc,
        price_usd: parseFloat(price),
        images: finalImages,
        features: features.split('\n').map(f => f.trim()).filter(Boolean),
        tech: category === 'wordpress' ? 'WordPress' : 'HTML/React',
        filesize: zipFile ? `${(zipFile.size / (1024 * 1024)).toFixed(1)} MB` : (existingProduct?.filesize || '0 MB'),
        demo_url: demoUrl,
        file_id: finalFileId,
        file_url: finalFileUrl,
      };

      if (isEditMode) {
        await updateProduct({ id: productId, ...payload });
      } else {
        await createProduct({ ...payload, is_active: true });
      }

      setLoading(false);
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('An error occurred during upload: ' + err.message);
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
          {isEditMode ? 'Edit Template' : 'Add New Template'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Upload files, configure pricing models, and set template information.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '14px', color: '#f87171', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {loading && uploadProgress && (
        <div style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '1rem', borderRadius: '14px', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
          <span className="spinner" style={{ width: '18px', height: '18px', border: '2px solid var(--primary)', borderBottomColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
          {uploadProgress}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="admin-form-grid">
        
        {/* Left Side: FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>General Information</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Product Name *</label>
                <input type="text" placeholder="e.g. AstraGlow Theme" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Short Tagline *</label>
                <input type="text" placeholder="A futuristic theme..." maxLength={120} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Live Demo URL</label>
                <input type="url" placeholder="https://my-demo-site.com" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Full Description</label>
                <textarea rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Bullet Features (One per line)</label>
                <textarea rows={4} placeholder="Feature 1&#10;Feature 2" value={features} onChange={(e) => setFeatures(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Media & Files</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 500 }}>Product Images (Max 5MB each)</label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {existingImages.map((img, i) => (
                    <div key={`ex-${i}`} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeExistingImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}><X size={12}/></button>
                    </div>
                  ))}
                  {images.map((file, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--primary)' }}>
                      <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeNewImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}><X size={12}/></button>
                    </div>
                  ))}
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <ImageIcon size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click to add images</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)' }} />

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 500 }}>Source ZIP File (Max 50MB)</label>
                
                {existingZipUrl && !zipFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                      <FileArchive size={16} /> Existing file attached
                    </div>
                    <button type="button" onClick={() => setExistingZipUrl('')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}><Trash2 size={14}/></button>
                  </div>
                )}

                {zipFile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem' }}>
                      <FileArchive size={16} /> {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                    <button type="button" onClick={() => setZipFile(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}><X size={14}/></button>
                  </div>
                )}

                {!zipFile && (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer' }}>
                    <UploadCloud size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload new ZIP package</span>
                    <input type="file" accept=".zip,.rar,.tar.gz" onChange={handleZipChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Pricing</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Pricing (USD) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                  <input type="number" step="0.01" placeholder="29.00" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '0.8rem 1.25rem 0.8rem 2.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
                
                {!showNewCatInput ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flexGrow: 1, padding: '0.8rem 1rem', background: '#0c0c14', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                      {dbCategories && dbCategories.map(c => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))}
                      {(!dbCategories || dbCategories.length === 0) && (
                        <option value="wordpress">WordPress Template</option>
                      )}
                    </select>
                    <button type="button" onClick={() => setShowNewCatInput(true)} style={{ padding: '0 1.25rem', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '12px', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      + New
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Create New Category</div>
                    <input 
                      type="text" 
                      placeholder="Category Name" 
                      value={newCatName} 
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }} 
                      style={{ width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '0.85rem' }} 
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        disabled={!newCatName || catCreating}
                        onClick={async () => {
                          setCatCreating(true);
                          try {
                            await createCategory({ name: newCatName, slug: newCatSlug });
                            setCategory(newCatSlug);
                            setShowNewCatInput(false);
                            setNewCatName('');
                            setNewCatSlug('');
                          } catch (err) {
                            alert(err.message);
                          }
                          setCatCreating(false);
                        }}
                        className="btn btn-primary" 
                        style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        {catCreating ? 'Saving...' : 'Save & Select'}
                      </button>
                      <button type="button" onClick={() => setShowNewCatInput(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 0.5rem' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '16px', fontSize: '1.05rem', position: 'sticky', bottom: '2rem', zIndex: 10 }}>
            {loading ? 'Processing...' : <><Save size={18} /> {isEditMode ? 'Save Changes' : 'Publish Template'}</>}
          </button>

        </form>

        {/* Right Side: LIVE PREVIEW */}
        <div className="preview-column">
          <div style={{ position: 'sticky', top: '90px' }}>
             <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Eye size={16} /> Live Card Preview
            </h2>
            <div style={{ pointerEvents: 'none' }}>
              <ProductCard product={livePreviewData} />
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-main)' }}>Storefront Simulation</strong><br/>
              This is exactly how your template will appear to customers on the homepage and store grids.
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .admin-form-grid {
          grid-template-columns: 1fr;
        }
        .preview-column {
          display: none;
        }
        @media (min-width: 992px) {
          .admin-form-grid {
            grid-template-columns: 1.4fr 1fr !important;
            align-items: start;
          }
          .preview-column {
            display: block;
          }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

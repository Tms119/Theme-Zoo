'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function BlogEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get('id');

  const post = useQuery(api.posts.getById, postId ? { id: postId } : "skip");
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    short_desc: '',
    cover_image_url: '',
    author: 'Themes Zoo',
    status: 'draft',
    meta_title: '',
    meta_desc: '',
    meta_keywords: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        short_desc: post.short_desc || '',
        cover_image_url: post.cover_image_url || '',
        author: post.author || 'Themes Zoo',
        status: post.status || 'draft',
        meta_title: post.meta_title || '',
        meta_desc: post.meta_desc || '',
        meta_keywords: post.meta_keywords || ''
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSlugify = () => {
    setFormData(prev => ({
      ...prev,
      slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
  };

  const handleSave = async (statusOverride) => {
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        status: statusOverride || formData.status
      };

      if (postId) {
        await updatePost({ id: postId, ...payload });
      } else {
        await createPost(payload);
      }
      router.push('/admin/blog');
    } catch (err) {
      setError(err.message || "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            {postId ? 'Edit Post' : 'New Post'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => handleSave('draft')} 
            disabled={isSaving}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('published')} 
            disabled={isSaving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
          >
            <Save size={16} /> Publish
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Main Editor Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={!postId && formData.slug === '' ? handleSlugify : undefined}
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Content (HTML / Markdown Supported)</label>
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', minHeight: '400px', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.95rem', fontFamily: 'var(--font-geist-mono), monospace', lineHeight: '1.6' }}
                required
              />
            </div>

          </div>
        </div>

        {/* Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Meta & Basic Info */}
          <div className="admin-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Slug / URL</label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cover Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ImageIcon size={18} style={{ color: 'var(--text-muted)', marginTop: '0.6rem' }} />
                <input 
                  type="url" 
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Short Description</label>
              <textarea 
                name="short_desc"
                value={formData.short_desc}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', minHeight: '80px', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Author</label>
              <input 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="admin-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)' }}>SEO Settings</h3>
            
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Meta Title</span>
                <span style={{ color: formData.meta_title.length > 60 ? '#ef4444' : 'var(--text-muted)' }}>{formData.meta_title.length}/60</span>
              </label>
              <input 
                type="text" 
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Meta Description</span>
                <span style={{ color: formData.meta_desc.length > 160 ? '#ef4444' : 'var(--text-muted)' }}>{formData.meta_desc.length}/160</span>
              </label>
              <textarea 
                name="meta_desc"
                value={formData.meta_desc}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', minHeight: '80px', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Keywords (Comma separated)</label>
              <input 
                type="text" 
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleChange}
                className="form-input"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

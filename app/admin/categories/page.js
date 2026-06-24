'use client';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { PlusCircle, Tag, ArrowLeft, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function CategoriesPage() {
  const categories = useQuery(api.categories.listAll);
  const createCategory = useMutation(api.categories.create);
  const removeCategory = useMutation(api.categories.remove);
  const reorderCategories = useMutation(api.categories.reorder);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      setError('');
      await createCategory({ name, slug });
      setName('');
      setSlug('');
    } catch (err) {
      setError(err.message || 'Failed to create category.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await removeCategory({ id });
    }
  };

  const handleReorder = async (direction, index) => {
    if (!categories || isReordering) return;
    
    // Check bounds
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    setIsReordering(true);
    try {
      const newArray = [...categories];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap elements
      const temp = newArray[index];
      newArray[index] = newArray[targetIndex];
      newArray[targetIndex] = temp;

      // Create payload with exact order matching index
      const payload = newArray.map((cat, i) => ({
        id: cat._id,
        sort_order: i + 1
      }));

      await reorderCategories({ items: payload });
    } catch (err) {
      setError(err.message || 'Failed to reorder categories.');
    } finally {
      setIsReordering(false);
    }
  };

  if (categories === undefined) {
    return <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading categories...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 }}>
          Manage Categories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Create and manage dynamic categories for your template marketplace.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="admin-grid-double">
        {/* Category Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', alignSelf: 'start' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="var(--primary)" /> Add Category
          </h2>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '10px', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Category Name</label>
              <input 
                type="text" 
                value={name}
                onChange={handleNameChange}
                required
                placeholder="e.g. React Templates"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>URL Slug</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-muted)', outline: 'none' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', borderRadius: '10px', padding: '0.75rem' }}>
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={20} color="var(--accent-cyan)" /> Active Categories
          </h2>

          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
              No categories found. Create one to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.map((c, i) => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px', opacity: isReordering ? 0.7 : 1 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{c.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>slug: {c.slug}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button 
                        onClick={() => handleReorder('up', i)}
                        disabled={i === 0 || isReordering}
                        style={{ background: 'transparent', color: i === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-secondary)', border: 'none', padding: '0.1rem', cursor: i === 0 ? 'not-allowed' : 'pointer' }}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleReorder('down', i)}
                        disabled={i === categories.length - 1 || isReordering}
                        style={{ background: 'transparent', color: i === categories.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--text-secondary)', border: 'none', padding: '0.1rem', cursor: i === categories.length - 1 ? 'not-allowed' : 'pointer' }}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDelete(c._id)}
                      disabled={isReordering}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: isReordering ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 992px) {
          .admin-grid-double {
            grid-template-columns: 1fr 1.5fr !important;
          }
        }
      `}</style>
    </div>
  );
}

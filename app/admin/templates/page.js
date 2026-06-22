'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from 'next/link';
import { PlusCircle, ExternalLink, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
  const products = useQuery(api.products.listAll);
  
  const toggleActive = useMutation(api.products.toggleActive);
  const removeProduct = useMutation(api.products.remove);
  const updateSortOrders = useMutation(api.products.updateSortOrders);

  const [localProducts, setLocalProducts] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

  React.useEffect(() => {
    if (products) {
      setLocalProducts([...products]);
    }
  }, [products]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex || isNaN(dragIndex)) return;

    const newArray = [...localProducts];
    const [draggedItem] = newArray.splice(dragIndex, 1);
    newArray.splice(dropIndex, 0, draggedItem);

    setLocalProducts(newArray);

    const updates = newArray.map((p, i) => ({
      id: p._id,
      sort_order: i + 1
    }));

    try {
      await updateSortOrders({ updates });
      toast.success('Display order saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save order.');
    }
  };

  const handleDeleteProduct = (id) => {
    if (confirm("Are you sure you want to permanently delete this product?")) {
      removeProduct({ id });
    }
  };

  if (products === undefined || localProducts === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Templates...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Templates</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage your digital products, rearrange their display order, and configure listings.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', maxWidth: 'max-content' }} className="admin-header-actions">
          <Link href="/admin/products" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', flexGrow: 1, textAlign: 'center', justifyContent: 'center' }}>
            <PlusCircle size={16} /> Add New Template
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ width: '40px' }}></th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Name</th>
                <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Category</th>
                <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Price</th>
                <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                <th className="show-mobile-cell" style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {localProducts.map((p, index) => (
                <React.Fragment key={p._id}>
                  <tr 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{ 
                      borderBottom: expandedProduct === p._id ? 'none' : '1px solid rgba(255,255,255,0.03)',
                      transition: 'background 0.2s',
                      background: 'transparent'
                    }}
                    onDragEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onDragLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    onDropCapture={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', cursor: 'grab' }} title="Drag to reorder">
                      <GripVertical size={16} />
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'normal' }}>
                      {p.name}
                      {!p.is_active && <span style={{ marginLeft: '0.5rem', color: '#ef4444', fontSize: '0.7rem' }}>(Hidden)</span>}
                    </td>
                    <td className="hide-mobile" style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.category}</td>
                    <td className="hide-mobile" style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>${p.price_usd.toFixed(2)}</td>
                    <td className="hide-mobile" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <Link href={`/templates/${p.slug}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                          View <ExternalLink size={12} style={{ marginLeft: '2px' }} />
                        </Link>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => toggleActive({ id: p._id, is_active: !p.is_active })}
                            style={{ 
                              position: 'relative', width: '36px', height: '20px', 
                              background: p.is_active ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)', 
                              borderRadius: '20px', border: 'none', cursor: 'pointer', transition: 'background 0.3s ease', padding: 0
                            }}
                            title={p.is_active ? "Hide Product" : "Show Product"}
                          >
                            <div style={{ 
                              position: 'absolute', top: '2px', left: p.is_active ? '18px' : '2px', width: '16px', height: '16px', 
                              background: '#fff', borderRadius: '50%', transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} />
                          </button>
                        </div>
                        <Link 
                          href={`/admin/products?id=${p._id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
                          title="Edit Product"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(p._id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="show-mobile-cell" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => setExpandedProduct(expandedProduct === p._id ? null : p._id)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {expandedProduct === p._id ? 'Less' : 'More'}
                      </button>
                    </td>
                  </tr>
                  {expandedProduct === p._id && (
                    <tr className="show-mobile-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                      <td colSpan={3} style={{ padding: '0 0.5rem 1rem 0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                            <span style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{p.category}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${p.price_usd.toFixed(2)}</span>
                          </div>
                          <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                            <Link href={`/templates/${p.slug}`} target="_blank" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>View</Link>
                            <Link href={`/admin/products?id=${p._id}`} style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>Edit</Link>
                            <button onClick={() => toggleActive({ id: p._id, is_active: !p.is_active })} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                              {p.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button onClick={() => handleDeleteProduct(p._id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem' }}>Delete</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .show-mobile-cell, .show-mobile-row {
          display: none !important;
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

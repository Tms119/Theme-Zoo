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
    status: ordersStatus,
    loadMore: loadMoreOrders,
  } = usePaginatedQuery(api.orders.listPaginated, {}, { initialNumItems: 20 });
  
  const orderStats = useQuery(api.orders.getStats);
  const supportTickets = useQuery(api.support.listAll);
  const customOrders = useQuery(api.services.listOrders);
  
  const toggleActive = useMutation(api.products.toggleActive);
  const removeProduct = useMutation(api.products.remove);
  const updateSupportStatus = useMutation(api.support.updateStatus);
  const updateCustomOrderStatus = useMutation(api.services.updateOrderStatus);
  const updateSortOrders = useMutation(api.products.updateSortOrders);

  const [localProducts, setLocalProducts] = useState(null);
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

  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const getFileUrl = useMutation(api.products.getFileUrl);
  
  // Mobile expansion state
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [supportFilter, setSupportFilter] = useState('all'); // 'all', 'open', 'replied', 'closed'

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

  const uploadBlobToConvex = async (blob) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  if (products === undefined || localProducts === null || ordersStatus === "LoadingFirstPage" || supportTickets === undefined || orderStats === undefined || customOrders === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Data...</p>
      </div>
    );
  }

  // Calculate total revenue dynamically
  const totalRevenue = orderStats ? orderStats.totalRevenue : 0;
  const totalOrders = orderStats ? orderStats.totalOrders : 0;

  const filteredTickets = supportTickets ? supportTickets.filter(t => supportFilter === 'all' || t.status === supportFilter) : [];

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="admin-grid-double">
        {/* Templates List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Your Templates</h2>
          
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
                    {/* Mobile Expanded Row */}
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

        {/* Recent Orders */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Recent Orders</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tx ID</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Template</th>
                  <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Buyer</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</th>
                  <th className="hide-mobile" style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Status</th>
                  <th className="show-mobile-cell" style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <React.Fragment key={o._id}>
                    <tr style={{ borderBottom: expandedOrder === o._id ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="hide-mobile" style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{o._id.substring(0, 8)}...</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500, whiteSpace: 'normal' }}>{o.product_name}</td>
                      <td className="hide-mobile" style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{o.buyer_email}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>${o.price_usd.toFixed(2)}</td>
                      <td className="hide-mobile" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(16, 189, 129, 0.1)', border: '1px solid rgba(16, 189, 129, 0.2)', color: 'var(--accent-emerald)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="show-mobile-cell" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          {expandedOrder === o._id ? 'Less' : 'More'}
                        </button>
                      </td>
                    </tr>
                    {/* Mobile Expanded Row */}
                    {expandedOrder === o._id && (
                      <tr className="show-mobile-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                        <td colSpan={3} style={{ padding: '0 0.5rem 1rem 0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Tx ID:</span>
                              <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{o._id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Buyer:</span>
                              <span style={{ color: 'var(--text-main)' }}>{o.buyer_email}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 189, 129, 0.1)', border: '1px solid rgba(16, 189, 129, 0.2)', color: 'var(--accent-emerald)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {ordersStatus === "CanLoadMore" && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => loadMoreOrders(20)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '100px' }}
                >
                  Load More Orders
                </button>
              </div>
            )}
            {ordersStatus === "LoadingMore" && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Custom Orders */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', marginTop: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={20} color="var(--primary)" /> Custom Orders
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Service / Budget</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customOrders && customOrders.map((co) => (
                <tr key={co._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(co._creationTime).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{co.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{co.email}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(co.email);
                          toast.success('Email copied!');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                        title="Copy Email"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{co.service_type}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{co.budget}</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: co.status === 'pending' ? 'rgba(239, 68, 68, 0.1)' : co.status === 'open' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 189, 129, 0.1)', 
                      border: `1px solid ${co.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : co.status === 'open' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 189, 129, 0.2)'}`, 
                      color: co.status === 'pending' ? '#ef4444' : co.status === 'open' ? 'var(--accent-amber)' : 'var(--accent-emerald)', 
                      padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' 
                    }}>
                      {co.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <select
                      value={co.status}
                      onChange={(e) => updateCustomOrderStatus({ id: co._id, status: e.target.value })}
                      style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="open">Open</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {customOrders && customOrders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No custom orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Tickets */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LifeBuoy size={20} color="var(--primary)" /> Support Tickets
          </h2>
          <select 
            value={supportFilter} 
            onChange={(e) => setSupportFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Problem</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(t._creationTime).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.email}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(t.email);
                          toast.success('Email copied!');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                        title="Copy Email"
                      >
                        <Copy size={14} />
                      </button>
                      <a 
                        href={`mailto:${t.email}?subject=Re: Your Support Ticket - ThemeZoo`} 
                        style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', padding: '0.2rem' }}
                        title="Reply via Email"
                      >
                        <Mail size={14} />
                      </a>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', whiteSpace: 'normal', maxWidth: '300px' }}>{t.problem}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: t.status === 'open' ? 'rgba(239, 68, 68, 0.1)' : t.status === 'replied' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 189, 129, 0.1)', 
                      border: `1px solid ${t.status === 'open' ? 'rgba(239, 68, 68, 0.2)' : t.status === 'replied' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 189, 129, 0.2)'}`, 
                      color: t.status === 'open' ? '#ef4444' : t.status === 'replied' ? 'var(--accent-cyan)' : 'var(--accent-emerald)', 
                      padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600, textTransform: 'uppercase' 
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <select
                      value={t.status}
                      onChange={(e) => updateSupportStatus({ id: t._id, status: e.target.value })}
                      style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="open">Mark Open</option>
                      <option value="replied">Mark Replied</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No support tickets found for this filter.
                  </td>
                </tr>
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

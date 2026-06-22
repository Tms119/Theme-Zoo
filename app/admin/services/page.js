'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Save, Plus, Loader2, CheckCircle, Mail, Briefcase, Filter, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState('config'); // config | orders
  
  // -- Config State (Banner) --
  const configData = useQuery(api.services.getConfig);
  const updateConfig = useMutation(api.services.updateConfig);
  const [bannerForm, setBannerForm] = useState({ design_title: '', design_desc: '' });
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    if (configData) {
      setBannerForm({
        design_title: configData.design_title || 'Custom Designs & Graphics',
        design_desc: configData.design_desc || 'Need a custom logo, banner, or infographics? Our elite design team will craft visually stunning assets for your brand.',
      });
    } else {
      setBannerForm({
        design_title: 'Custom Designs & Graphics',
        design_desc: 'Need a custom logo, banner, or infographics? Our elite design team will craft visually stunning assets for your brand.',
      });
    }
  }, [configData]);

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      await updateConfig({ id: configData?._id, ...bannerForm });
      toast.success('Banner configuration saved!');
    } catch (err) {
      toast.error('Failed to save banner.');
    }
    setSavingBanner(false);
  };

  // -- Dynamic Tiers State --
  const tiersData = useQuery(api.services.listTiers);
  const addTier = useMutation(api.services.addTier);
  const updateTier = useMutation(api.services.updateTier);
  const deleteTier = useMutation(api.services.deleteTier);

  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({ name: '', price: 30, description: '', icon: 'Monitor', is_active: true, sort_order: 0 });

  const openAddTierModal = () => {
    setEditingTier(null);
    setTierForm({ name: '', price: 30, description: '', icon: 'Monitor', is_active: true, sort_order: (tiersData?.length || 0) + 1 });
    setIsTierModalOpen(true);
  };

  const openEditTierModal = (tier) => {
    setEditingTier(tier);
    setTierForm({ name: tier.name, price: tier.price, description: tier.description, icon: tier.icon || 'Monitor', is_active: tier.is_active, sort_order: tier.sort_order });
    setIsTierModalOpen(true);
  };

  const handleSaveTier = async (e) => {
    e.preventDefault();
    try {
      if (editingTier) {
        await updateTier({ id: editingTier._id, ...tierForm });
        toast.success('Service updated!');
      } else {
        await addTier(tierForm);
        toast.success('Service added!');
      }
      setIsTierModalOpen(false);
    } catch (err) {
      toast.error('Failed to save service.');
    }
  };

  const handleDeleteTier = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteTier({ id });
        toast.success('Service deleted.');
      } catch (err) {
        toast.error('Failed to delete.');
      }
    }
  };

  // -- Orders State --
  const ordersData = useQuery(api.services.listOrders);
  const updateStatus = useMutation(api.services.updateOrderStatus);
  
  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus({ id, status });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Custom Services
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage service configurations and custom orders</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('config')}
          style={{ background: activeTab === 'config' ? 'var(--primary)' : 'transparent', color: activeTab === 'config' ? '#fff' : 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Service Config
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? '#fff' : 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Orders & Inquiries
        </button>
      </div>

      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Tiers Management */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Dynamic Services</h3>
              <button onClick={openAddTierModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add New Service
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tiersData === undefined ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
              ) : tiersData.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  No services configured. Click "Add New Service" to create one.
                </div>
              ) : (
                tiersData.map(tier => (
                  <div key={tier._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {tier.name}
                        {!tier.is_active && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px' }}>Hidden</span>}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {tier.price === 0 ? 'Custom Quote' : `$${tier.price}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditTierModal(tier)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteTier(tier._id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Banner Management */}
          <form onSubmit={handleSaveBanner} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>Custom Design Banner</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Banner Title</label>
              <input type="text" value={bannerForm.design_title} onChange={(e) => setBannerForm({...bannerForm, design_title: e.target.value})} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
            </div>
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Banner Description</label>
              <textarea value={bannerForm.design_desc} onChange={(e) => setBannerForm({...bannerForm, design_desc: e.target.value})} required rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
            </div>
            <button type="submit" disabled={savingBanner} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {savingBanner ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Banner
            </button>
          </form>

        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Client</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Service & Budget</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Message</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersData === undefined ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                ) : ordersData.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No custom orders yet.</td></tr>
                ) : (
                  ordersData.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1.5rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {order.email} 
                          <a href={`mailto:${order.email}`} style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}><Mail size={12} /></a>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem', verticalAlign: 'top' }}>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          {order.service_type}
                        </span>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Budget: <strong style={{ color: 'var(--text-main)' }}>{order.budget || 'Not specified'}</strong></div>
                      </td>
                      <td style={{ padding: '1.5rem', verticalAlign: 'top', maxWidth: '300px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto' }}>
                          {order.message}
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(order._creationTime).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1.5rem', verticalAlign: 'top', textAlign: 'right' }}>
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: order.status === 'open' ? 'rgba(239,68,68,0.1)' : order.status === 'contacted' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                            color: order.status === 'open' ? '#ef4444' : order.status === 'contacted' ? '#f59e0b' : '#10b981',
                            outline: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="open">Open</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Modal */}
      {isTierModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setIsTierModalOpen(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', zIndex: 1001, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingTier ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setIsTierModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveTier} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Service Name</label>
                  <input type="text" value={tierForm.name} onChange={(e) => setTierForm({...tierForm, name: e.target.value})} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Price ($) (0 = Custom Quote)</label>
                  <input type="number" value={tierForm.price} onChange={(e) => setTierForm({...tierForm, price: Number(e.target.value)})} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</label>
                <textarea value={tierForm.description} onChange={(e) => setTierForm({...tierForm, description: e.target.value})} required rows={3} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Icon</label>
                  <select value={tierForm.icon} onChange={(e) => setTierForm({...tierForm, icon: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                    <option value="Monitor" style={{background: '#0a0a0f'}}>Monitor</option>
                    <option value="Layout" style={{background: '#0a0a0f'}}>Layout</option>
                    <option value="Zap" style={{background: '#0a0a0f'}}>Zap (Lightning)</option>
                    <option value="Code" style={{background: '#0a0a0f'}}>Code</option>
                    <option value="Palette" style={{background: '#0a0a0f'}}>Palette</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sort Order</label>
                  <input type="number" value={tierForm.sort_order} onChange={(e) => setTierForm({...tierForm, sort_order: Number(e.target.value)})} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="isActive" checked={tierForm.is_active} onChange={(e) => setTierForm({...tierForm, is_active: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>Active (Visible on Website)</label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {editingTier ? 'Update Service' : 'Add Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

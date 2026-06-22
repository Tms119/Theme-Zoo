'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Save, Plus, Loader2, CheckCircle, Mail, Briefcase, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_CONFIG = {
  tier1_name: 'PHP Clone',
  tier1_price: 30,
  tier1_desc: 'Perfect for quick setups. Get a fully functional PHP script clone of your choice.',
  tier2_name: 'HTML Clone',
  tier2_price: 70,
  tier2_desc: 'High-quality HTML clone tailored to your specific requirements and design.',
  tier3_name: 'Custom High-End Website',
  tier3_desc: 'A premium, custom-built website tailored perfectly to your brand and business goals.',
  design_title: 'Custom Designs & Graphics',
  design_desc: 'Need a custom logo, banner, or infographics? Our elite design team will craft visually stunning assets for your brand.',
};

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState('config'); // config | orders
  
  // -- Config State --
  const configData = useQuery(api.services.getConfig);
  const updateConfig = useMutation(api.services.updateConfig);
  
  const [form, setForm] = useState({
    tier1_name: DEFAULT_CONFIG.tier1_name, tier1_price: DEFAULT_CONFIG.tier1_price, tier1_desc: DEFAULT_CONFIG.tier1_desc,
    tier2_name: DEFAULT_CONFIG.tier2_name, tier2_price: DEFAULT_CONFIG.tier2_price, tier2_desc: DEFAULT_CONFIG.tier2_desc,
    tier3_name: DEFAULT_CONFIG.tier3_name, tier3_desc: DEFAULT_CONFIG.tier3_desc,
    design_title: DEFAULT_CONFIG.design_title, design_desc: DEFAULT_CONFIG.design_desc
  });
  
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (configData) {
      setForm({
        tier1_name: configData.tier1_name || DEFAULT_CONFIG.tier1_name, tier1_price: configData.tier1_price || DEFAULT_CONFIG.tier1_price, tier1_desc: configData.tier1_desc || DEFAULT_CONFIG.tier1_desc,
        tier2_name: configData.tier2_name || DEFAULT_CONFIG.tier2_name, tier2_price: configData.tier2_price || DEFAULT_CONFIG.tier2_price, tier2_desc: configData.tier2_desc || DEFAULT_CONFIG.tier2_desc,
        tier3_name: configData.tier3_name || DEFAULT_CONFIG.tier3_name, tier3_desc: configData.tier3_desc || DEFAULT_CONFIG.tier3_desc,
        design_title: configData.design_title || DEFAULT_CONFIG.design_title, design_desc: configData.design_desc || DEFAULT_CONFIG.design_desc,
      });
    }
  }, [configData]);

  const handleConfigChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateConfig({ id: configData?._id, ...form });
      toast.success('Services configuration saved successfully!');
    } catch (err) {
      toast.error('Failed to save configuration.');
    }
    setSavingConfig(false);
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
          Frontend Config
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? '#fff' : 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Custom Orders & Inquiries
        </button>
      </div>

      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary)' }}>Tier 1 (e.g. PHP Clone)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Service Name</label>
              <input type="text" name="tier1_name" value={form.tier1_name} onChange={handleConfigChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Price ($)</label>
              <input type="number" name="tier1_price" value={form.tier1_price} onChange={handleConfigChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
            </div>
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</label>
            <textarea name="tier1_desc" value={form.tier1_desc} onChange={handleConfigChange} required rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary)' }}>Tier 2 (e.g. HTML Clone)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Service Name</label>
              <input type="text" name="tier2_name" value={form.tier2_name} onChange={handleConfigChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Price ($)</label>
              <input type="number" name="tier2_price" value={form.tier2_price} onChange={handleConfigChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
            </div>
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</label>
            <textarea name="tier2_desc" value={form.tier2_desc} onChange={handleConfigChange} required rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary)' }}>Tier 3 (e.g. High-End Custom)</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Service Name</label>
            <input type="text" name="tier3_name" value={form.tier3_name} onChange={handleConfigChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</label>
            <textarea name="tier3_desc" value={form.tier3_desc} onChange={handleConfigChange} required rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>Custom Design Banner</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Banner Title</label>
            <input type="text" name="design_title" value={form.design_title} onChange={handleConfigChange} required style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Banner Description</label>
            <textarea name="design_desc" value={form.design_desc} onChange={handleConfigChange} required rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff' }} />
          </div>

          <button type="submit" disabled={savingConfig} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {savingConfig ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Configuration
          </button>
        </form>
      )}

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
    </div>
  );
}

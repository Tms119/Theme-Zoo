'use client';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Tag, Plus, CheckCircle2, XCircle, Trash2, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPromoCodes() {
  const promoCodes = useQuery(api.promo_codes.listAll);
  const createCode = useMutation(api.promo_codes.create);
  const toggleStatus = useMutation(api.promo_codes.toggleStatus);
  const deleteCode = useMutation(api.promo_codes.deleteCode);

  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Code cannot be empty');
    if (form.discountValue <= 0) return toast.error('Discount must be greater than 0');
    
    setIsCreating(true);
    try {
      await createCode({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        isActive: form.isActive,
      });
      toast.success('Promo code created successfully!');
      setForm({ code: '', discountType: 'percentage', discountValue: 10, isActive: true });
    } catch (error) {
      toast.error('Failed to create promo code');
    }
    setIsCreating(false);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleStatus({ id, isActive: !currentStatus });
      toast.success(`Promo code ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await deleteCode({ id });
      toast.success('Promo code deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            Promo Codes
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage discount codes and promotional offers.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        
        {/* Create Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} className="text-primary" /> Create New Code
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Code (e.g. SUMMER50)</label>
              <input 
                type="text" 
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="PROMO2026"
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Discount Type</label>
              <select 
                value={form.discountType}
                onChange={e => setForm({...form, discountType: e.target.value})}
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', appearance: 'none' }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Value</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  {form.discountType === 'percentage' ? '%' : '$'}
                </span>
                <input 
                  type="number" 
                  min="1"
                  max={form.discountType === 'percentage' ? "100" : undefined}
                  value={form.discountValue}
                  onChange={e => setForm({...form, discountValue: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)' }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Add Code'}
            </button>

          </form>
        </div>

        {/* Codes List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Promo Code</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Discount</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Uses</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes === undefined ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 size={24} className="animate-spin mx-auto" /></td></tr>
                ) : promoCodes.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No promo codes created yet.</td></tr>
                ) : (
                  promoCodes.map((promo) => (
                    <tr key={promo._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 800, letterSpacing: '1px' }}>
                          <Tag size={14} /> {promo.code}
                          <button onClick={() => handleCopy(promo.code)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, marginLeft: '0.25rem' }}>
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {promo.uses} times
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <button 
                          onClick={() => handleToggle(promo._id, promo.isActive)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                            background: promo.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: promo.isActive ? 'var(--accent-emerald)' : '#ef4444'
                          }}
                        >
                          {promo.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {promo.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(promo._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                          title="Delete Code"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

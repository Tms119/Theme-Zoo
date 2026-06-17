'use client';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Mail, Trash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSupport() {
  const contactsData = useQuery(api.contacts.listAll);
  const updateStatus = useMutation(api.contacts.updateStatus);
  const [updating, setUpdating] = useState(null);

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdating(id);
      await updateStatus({ id, status });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Support Tickets & Contacts
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage general contact form submissions</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Subject / Type</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Message</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {contactsData === undefined ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tickets...</td></tr>
              ) : contactsData.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No support tickets yet.</td></tr>
              ) : (
                contactsData.map((contact) => (
                  <tr key={contact._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1.5rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{contact.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        {contact.email} 
                        <a href={`mailto:${contact.email}`} style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}><Mail size={12} /></a>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', verticalAlign: 'top' }}>
                      {contact.project_type ? (
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          {contact.project_type}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          General Inquiry
                        </span>
                      )}
                      {contact.budget && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Budget: <strong style={{ color: 'var(--text-main)' }}>{contact.budget}</strong></div>}
                    </td>
                    <td style={{ padding: '1.5rem', verticalAlign: 'top', maxWidth: '300px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto' }}>
                        {contact.message}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(contact._creationTime).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1.5rem', verticalAlign: 'top', textAlign: 'right' }}>
                      {updating === contact._id ? (
                        <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)', display: 'inline-block' }} />
                      ) : (
                        <select 
                          value={contact.status || 'new'}
                          onChange={(e) => handleUpdateStatus(contact._id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: contact.status === 'new' ? 'rgba(239,68,68,0.1)' : contact.status === 'replied' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                            color: contact.status === 'new' ? '#ef4444' : contact.status === 'replied' ? '#10b981' : 'var(--text-secondary)',
                            outline: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="new">New</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

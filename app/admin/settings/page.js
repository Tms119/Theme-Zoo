'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Save, MessageCircle, Link as LinkIcon, Facebook, Youtube } from 'lucide-react';

const TwitterIcon = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function SettingsAdmin() {
  const socialLinks = useQuery(api.settings.getSocialLinks);
  const updateSocialLinks = useMutation(api.settings.updateSocialLinks);
  
    x: '',
    facebook: '',
    youtube: '',
    reddit: '',
    instagram: '',
    pinterest: '',
    whatsapp: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (socialLinks) {
      setFormData({
        x: socialLinks.x || '',
        facebook: socialLinks.facebook || '',
        youtube: socialLinks.youtube || '',
        reddit: socialLinks.reddit || '',
        instagram: socialLinks.instagram || '',
        pinterest: socialLinks.pinterest || '',
        whatsapp: socialLinks.whatsapp || ''
      });
    }
  }, [socialLinks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSocialLinks(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (socialLinks === undefined) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Global Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage social links and global configurations.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Settings successfully saved!
        </div>
      )}

      {/* Social Links Section */}
      <div className="admin-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <LinkIcon size={18} /> Social Media Links
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* X (Twitter) */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <TwitterIcon size={14} /> X (Twitter) URL
            </label>
            <input 
              type="url" 
              name="x"
              value={formData.x}
              onChange={handleChange}
              placeholder="https://x.com/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* Reddit */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff4500', display: 'inline-block' }} /> Reddit URL
            </label>
            <input 
              type="url" 
              name="reddit"
              value={formData.reddit}
              onChange={handleChange}
              placeholder="https://reddit.com/user/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* Facebook */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Facebook size={14} /> Facebook URL
            </label>
            <input 
              type="url" 
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* YouTube */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Youtube size={14} /> YouTube URL
            </label>
            <input 
              type="url" 
              name="youtube"
              value={formData.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/c/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* Facebook */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Facebook size={14} /> Facebook URL
            </label>
            <input 
              type="url" 
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* YouTube */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Youtube size={14} /> YouTube URL
            </label>
            <input 
              type="url" 
              name="youtube"
              value={formData.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/c/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* Instagram */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <InstagramIcon size={14} /> Instagram URL
            </label>
            <input 
              type="url" 
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* Pinterest */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#e60023', display: 'inline-block' }} /> Pinterest URL
            </label>
            <input 
              type="url" 
              name="pinterest"
              value={formData.pinterest}
              onChange={handleChange}
              placeholder="https://pinterest.com/yourprofile" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          {/* WhatsApp */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <MessageCircle size={14} /> WhatsApp URL
            </label>
            <input 
              type="url" 
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="https://wa.me/1234567890" 
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Save, Megaphone, Tag, Plus, Trash2, CheckCircle2, MailWarning } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarketingAdminPage() {
  const [activeTab, setActiveTab] = useState('banner');

  // --- Banner State ---
  // --- Global State ---
  const setGlobalSetting = useMutation(api.marketing.setGlobalSetting);

  // --- Banner State ---
  const bannerSetting = useQuery(api.marketing.getGlobalSetting, { key: "announcement_banner" });
  
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLinkText, setBannerLinkText] = useState('');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('');

  useEffect(() => {
    if (bannerSetting && bannerSetting.value) {
      setBannerActive(bannerSetting.value.isActive || false);
      setBannerText(bannerSetting.value.text || '');
      setBannerLinkText(bannerSetting.value.linkText || '');
      setBannerLinkUrl(bannerSetting.value.linkUrl || '');
    }
  }, [bannerSetting]);

  const saveBanner = async () => {
    try {
      await setGlobalSetting({
        key: "announcement_banner",
        value: {
          isActive: bannerActive,
          text: bannerText,
          linkText: bannerLinkText,
          linkUrl: bannerLinkUrl
        }
      });
      toast.success('Banner settings saved');
    } catch (e) {
      toast.error('Failed to save banner settings');
    }
  };

  // --- Cart Recovery State ---
  const recoveryEnabledSetting = useQuery(api.marketing.getGlobalSetting, { key: "abandoned_cart_enabled" });
  const recoveryCouponSetting = useQuery(api.marketing.getGlobalSetting, { key: "abandoned_cart_coupon" });
  
  const [recoveryActive, setRecoveryActive] = useState(false);
  const [recoveryCoupon, setRecoveryCoupon] = useState('');

  useEffect(() => {
    if (recoveryEnabledSetting) {
      setRecoveryActive(recoveryEnabledSetting.value === true);
    }
    if (recoveryCouponSetting) {
      setRecoveryCoupon(recoveryCouponSetting.value || '');
    }
  }, [recoveryEnabledSetting, recoveryCouponSetting]);

  const saveRecoverySettings = async () => {
    try {
      await setGlobalSetting({ key: "abandoned_cart_enabled", value: recoveryActive });
      await setGlobalSetting({ key: "abandoned_cart_coupon", value: recoveryCoupon });
      toast.success('Cart recovery settings saved');
    } catch (e) {
      toast.error('Failed to save recovery settings');
    }
  };

  // --- Campaigns State ---
  const campaigns = useQuery(api.marketing.listCampaigns);
  const createCampaign = useMutation(api.marketing.createCampaign);
  const updateCampaign = useMutation(api.marketing.updateCampaign);
  const deleteCampaign = useMutation(api.marketing.deleteCampaign);

  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'volume_discount',
    isActive: false,
    minItems: 2,
    discountType: 'percentage',
    discountValue: 10,
  });

  const handleCreateCampaign = async () => {
    try {
      if (!newCampaign.name) return toast.error('Name is required');
      await createCampaign(newCampaign);
      toast.success('Campaign created');
      setShowNewCampaign(false);
      setNewCampaign({
        name: '',
        type: 'volume_discount',
        isActive: false,
        minItems: 2,
        discountType: 'percentage',
        discountValue: 10,
      });
    } catch (e) {
      toast.error('Failed to create campaign');
    }
  };

  const handleToggleCampaign = async (id, currentStatus) => {
    try {
      await updateCampaign({ id, isActive: !currentStatus });
      toast.success(`Campaign ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (e) {
      toast.error('Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign({ id });
        toast.success('Campaign deleted');
      } catch (e) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Marketing & Promotions</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your global announcement banners and automated volume campaigns.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('banner')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: '12px',
            border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
            background: activeTab === 'banner' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: activeTab === 'banner' ? '#c084fc' : 'var(--text-secondary)'
          }}
        >
          <Megaphone size={18} /> Global Banner
        </button>
        <button 
          onClick={() => setActiveTab('campaigns')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: '12px',
            border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
            background: activeTab === 'campaigns' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'campaigns' ? 'var(--accent-emerald)' : 'var(--text-secondary)'
          }}
        >
          <Tag size={18} /> Volume Campaigns
        </button>
        <button 
          onClick={() => setActiveTab('recovery')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: '12px',
            border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
            background: activeTab === 'recovery' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            color: activeTab === 'recovery' ? '#ef4444' : 'var(--text-secondary)'
          }}
        >
          <MailWarning size={18} /> Cart Recovery
        </button>
      </div>

      {activeTab === 'banner' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Megaphone size={20} style={{ color: '#c084fc' }} /> Announcement Banner Configuration
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Enable Banner</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Show the announcement banner globally across the site.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" style={{ display: 'none' }} checked={bannerActive} onChange={(e) => setBannerActive(e.target.checked)} />
                <div style={{ 
                  width: '44px', height: '24px', background: bannerActive ? '#c084fc' : 'var(--border-color)', 
                  borderRadius: '100px', position: 'relative', transition: 'background 0.3s' 
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: bannerActive ? '22px' : '2px',
                    width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
                    transition: 'left 0.3s'
                  }}></div>
                </div>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Banner Message (HTML allowed)</label>
              <input 
                type="text" 
                value={bannerText} 
                onChange={(e) => setBannerText(e.target.value)} 
                placeholder="e.g. Flash Sale! Get 50% off all templates." 
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Button Text (Optional)</label>
                <input 
                  type="text" 
                  value={bannerLinkText} 
                  onChange={(e) => setBannerLinkText(e.target.value)} 
                  placeholder="e.g. Shop Now" 
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Button URL (Optional)</label>
                <input 
                  type="text" 
                  value={bannerLinkUrl} 
                  onChange={(e) => setBannerLinkUrl(e.target.value)} 
                  placeholder="e.g. /templates" 
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <button onClick={saveBanner} className="btn" style={{ background: '#c084fc', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={18} /> Save Banner Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'recovery' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <MailWarning size={20} style={{ color: '#ef4444' }} /> Abandoned Cart Recovery Automation
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Enable Automated Emails</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Send an automated email to users who leave items in their cart for 2 hours.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" style={{ display: 'none' }} checked={recoveryActive} onChange={(e) => setRecoveryActive(e.target.checked)} />
                <div style={{ 
                  width: '44px', height: '24px', background: recoveryActive ? '#ef4444' : 'var(--border-color)', 
                  borderRadius: '100px', position: 'relative', transition: 'background 0.3s' 
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: recoveryActive ? '22px' : '2px',
                    width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
                    transition: 'left 0.3s'
                  }}></div>
                </div>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Discount Coupon Code to Send</label>
              <input 
                type="text" 
                value={recoveryCoupon} 
                onChange={(e) => setRecoveryCoupon(e.target.value.toUpperCase())} 
                placeholder="e.g. BONUS10" 
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This exact code will be highlighted in the automated email.</p>
            </div>

            <button onClick={saveRecoverySettings} className="btn" style={{ background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={18} /> Save Recovery Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Tag size={20} style={{ color: 'var(--accent-emerald)' }} /> Automated Volume Campaigns
            </h2>
            <button onClick={() => setShowNewCampaign(!showNewCampaign)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> New Campaign
            </button>
          </div>

          {showNewCampaign && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '2rem', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-emerald)' }}></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create New Campaign</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Campaign Name</label>
                  <input type="text" value={newCampaign.name} onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="e.g. Buy 2 Get 10% Off" style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Minimum Items (Buy X)</label>
                  <input type="number" min="2" value={newCampaign.minItems} onChange={(e) => setNewCampaign({...newCampaign, minItems: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Discount Type</label>
                  <select value={newCampaign.discountType} onChange={(e) => setNewCampaign({...newCampaign, discountType: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }}>
                    <option value="percentage" style={{ background: '#111' }}>Percentage (%)</option>
                    <option value="fixed" style={{ background: '#111' }}>Fixed Amount ($)</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Discount Value</label>
                  <input type="number" min="1" value={newCampaign.discountValue} onChange={(e) => setNewCampaign({...newCampaign, discountValue: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', items: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" checked={newCampaign.isActive} onChange={(e) => setNewCampaign({...newCampaign, isActive: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-emerald)' }} />
                    <span style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>Activate immediately (disables other campaigns)</span>
                  </label>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setShowNewCampaign(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreateCampaign} className="btn btn-primary">Save Campaign</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {campaigns?.map((campaign) => (
              <div key={campaign._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderRadius: '16px', border: '1px solid', borderColor: campaign.isActive ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)', background: campaign.isActive ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: campaign.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: campaign.isActive ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {campaign.name}
                      {campaign.isActive && <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={12} /> ACTIVE</span>}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Buy <strong style={{ color: 'var(--text-main)' }}>{campaign.minItems} or more items</strong> and get <strong style={{ color: 'var(--text-main)' }}>{campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : `$${campaign.discountValue}`} off</strong> the total cart value.
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleToggleCampaign(campaign._id, campaign.isActive)}
                    className={campaign.isActive ? "btn btn-secondary" : "btn btn-primary"}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    {campaign.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteCampaign(campaign._id)}
                    style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {campaigns?.length === 0 && !showNewCampaign && (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                <Tag size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No campaigns created yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Create a volume discount campaign to boost sales.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

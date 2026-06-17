'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Save, Megaphone, Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarketingAdminPage() {
  const [activeTab, setActiveTab] = useState('banner');

  // --- Banner State ---
  const bannerSetting = useQuery(api.marketing.getGlobalSetting, { key: "announcement_banner" });
  const setBannerSetting = useMutation(api.marketing.setGlobalSetting);
  
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
      await setBannerSetting({
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketing & Promotions</h1>
        <p className="text-gray-400">Manage your global announcement banners and automated volume campaigns.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-800 mb-8 pb-4">
        <button 
          onClick={() => setActiveTab('banner')}
          className={\`px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${activeTab === 'banner' ? 'bg-purple-600/20 text-purple-400 font-semibold' : 'text-gray-400 hover:bg-white/5'}\`}
        >
          <Megaphone size={18} /> Global Banner
        </button>
        <button 
          onClick={() => setActiveTab('campaigns')}
          className={\`px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${activeTab === 'campaigns' ? 'bg-emerald-600/20 text-emerald-400 font-semibold' : 'text-gray-400 hover:bg-white/5'}\`}
        >
          <Tag size={18} /> Volume Campaigns
        </button>
      </div>

      {activeTab === 'banner' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Megaphone size={20} className="text-purple-400" /> Announcement Banner Configuration</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div>
                <h3 className="font-semibold text-white">Enable Banner</h3>
                <p className="text-sm text-gray-400">Show the announcement banner globally across the site.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={bannerActive} onChange={(e) => setBannerActive(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Banner Message (HTML allowed)</label>
              <input 
                type="text" 
                value={bannerText} 
                onChange={(e) => setBannerText(e.target.value)} 
                placeholder="e.g. Flash Sale! Get 50% off all templates." 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Button Text (Optional)</label>
                <input 
                  type="text" 
                  value={bannerLinkText} 
                  onChange={(e) => setBannerLinkText(e.target.value)} 
                  placeholder="e.g. Shop Now" 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Button URL (Optional)</label>
                <input 
                  type="text" 
                  value={bannerLinkUrl} 
                  onChange={(e) => setBannerLinkUrl(e.target.value)} 
                  placeholder="e.g. /templates" 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button onClick={saveBanner} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
              <Save size={18} /> Save Banner Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><Tag size={20} className="text-emerald-400" /> Automated Volume Campaigns</h2>
            <button onClick={() => setShowNewCampaign(!showNewCampaign)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              <Plus size={18} /> New Campaign
            </button>
          </div>

          {showNewCampaign && (
            <div className="bg-gray-900 border border-emerald-900/50 rounded-xl p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h3 className="text-lg font-bold mb-4">Create New Campaign</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Name</label>
                  <input type="text" value={newCampaign.name} onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="e.g. Buy 2 Get 10% Off" className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Items (Buy X)</label>
                  <input type="number" min="2" value={newCampaign.minItems} onChange={(e) => setNewCampaign({...newCampaign, minItems: parseInt(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Discount Type</label>
                  <select value={newCampaign.discountType} onChange={(e) => setNewCampaign({...newCampaign, discountType: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Discount Value</label>
                  <input type="number" min="1" value={newCampaign.discountValue} onChange={(e) => setNewCampaign({...newCampaign, discountValue: parseInt(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="col-span-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-800/50 rounded-lg border border-gray-700 w-full">
                    <input type="checkbox" checked={newCampaign.isActive} onChange={(e) => setNewCampaign({...newCampaign, isActive: e.target.checked})} className="w-4 h-4 text-emerald-500 rounded border-gray-700 focus:ring-emerald-500 focus:ring-2 bg-gray-900" />
                    <span className="text-white font-medium">Activate immediately (disables other campaigns)</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowNewCampaign(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleCreateCampaign} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">Save Campaign</button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {campaigns?.map((campaign) => (
              <div key={campaign._id} className={\`flex items-center justify-between p-5 rounded-xl border \${campaign.isActive ? 'bg-emerald-900/10 border-emerald-900/50' : 'bg-gray-900 border-gray-800'}\`}>
                <div className="flex items-center gap-4">
                  <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${campaign.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}\`}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {campaign.name}
                      {campaign.isActive && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={12} /> ACTIVE</span>}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Buy <strong className="text-white">{campaign.minItems} or more items</strong> and get <strong className="text-white">{campaign.discountType === 'percentage' ? \`\${campaign.discountValue}%\` : \`$\${campaign.discountValue}\`} off</strong> the total cart value.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleCampaign(campaign._id, campaign.isActive)}
                    className={\`px-4 py-2 rounded-lg text-sm font-semibold transition-all \${campaign.isActive ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'}\`}
                  >
                    {campaign.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDeleteCampaign(campaign._id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {campaigns?.length === 0 && !showNewCampaign && (
              <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
                <Tag size={32} className="mx-auto text-gray-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-300 mb-1">No campaigns created yet</h3>
                <p className="text-gray-500 text-sm">Create a volume discount campaign to boost sales.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

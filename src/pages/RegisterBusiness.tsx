import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, MapPin, Store, Image as ImageIcon, Briefcase, Phone, Mail, Star, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { newsService } from '../services/newsService';
import { ALL_TINKHUNDLA, REGIONS } from '../constants';
import { BusinessLocation } from '../types';
import MediaUpload from '../components/MediaUpload';

const BUSINESS_CATEGORIES = [
  'Agriculture & Farming',
  'Construction & Properties',
  'Education & Tutors',
  'Health & Clinics',
  'Legal & Financial',
  'Retail & Shops',
  'Transport & Logistics',
  'Other Services',
];

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: BUSINESS_CATEGORIES[0],
    description: '',
    imageURL: '',
    contactPhone: '',
    contactEmail: '',
  });

  const [locations, setLocations] = useState<BusinessLocation[]>([
    { address: '', region: REGIONS[0], constituency: ALL_TINKHUNDLA[0] }
  ]);

  const [simulateUpgrade, setSimulateUpgrade] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newLocations = [...locations];
    (newLocations[index] as any)[name] = value;
    setLocations(newLocations);
  };

  const addLocation = () => {
    setLocations([...locations, { address: '', region: REGIONS[0], constituency: ALL_TINKHUNDLA[0] }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length === 1) return;
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.contactPhone) {
        throw new Error("Please fill in all required fields (Name, Description, Phone).");
      }

      const validLocations = locations.filter(l => l.address && l.region && l.constituency);
      if (validLocations.length === 0) {
        throw new Error("Please add at least one valid location.");
      }

      // Simulate the featured upgrade status for demonstration purposes
      const businessData = {
        ...formData,
        locations: validLocations,
        isFeatured: simulateUpgrade,
        featuredUntil: simulateUpgrade ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null // 30 days
      };

      await newsService.registerBusiness(businessData);
      
      toast.success(
        simulateUpgrade 
          ? "Business successfully registered as a Featured Listing!" 
          : "Business successfully registered!"
      );
      navigate('/directory');

    } catch (error: any) {
      toast.error(error.message || "Failed to register business.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white mb-4">
              Register Your Business
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
              Join the local directory and get discovered by thousands in your constituency.
            </p>
          </motion.div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-950/5 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <Briefcase size={20} className="text-rose-600" /> Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Business Name <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                    placeholder="e.g. Malindza Hardware"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                  >
                    {BUSINESS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Summary / Description <span className="text-rose-600">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white resize-none"
                  placeholder="Describe your services, specialties, and hours..."
                  required
                ></textarea>
              </div>

              <MediaUpload 
                label="Business / Storefront Image"
                onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageURL: url }))}
                accept="image"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <Phone size={20} className="text-rose-600" /> Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5"><Phone size={14} /> Phone Number <span className="text-rose-600">*</span></label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                    placeholder="+268 7600 0000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5"><Mail size={14} /> Email Address</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                    placeholder="contact@business.com"
                  />
                </div>
              </div>
            </div>

            {/* Locations (Branches) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <MapPin size={20} className="text-rose-600" /> Business Locations / Branches
                </h3>
                <button 
                  type="button"
                  onClick={addLocation}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <Plus size={14} /> Add Branch
                </button>
              </div>

              <div className="space-y-8">
                {locations.map((loc, index) => (
                  <div key={index} className="relative p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    {locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-600 transition-colors shadow-sm z-10"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Region</label>
                        <select
                          name="region"
                          value={loc.region}
                          onChange={(e) => handleLocationChange(index, e)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                        >
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Constituency</label>
                        <select
                          name="constituency"
                          value={loc.constituency}
                          onChange={(e) => handleLocationChange(index, e)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                        >
                          {ALL_TINKHUNDLA.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Physical Address</label>
                        <input
                          type="text"
                          name="address"
                          value={loc.address}
                          onChange={(e) => handleLocationChange(index, e)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                          placeholder="e.g. Next to the main plaza..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Branch Contact Number</label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={loc.contactNumber || ''}
                          onChange={(e) => handleLocationChange(index, e)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                          placeholder="+268 7600 0000"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Section (Mock) */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full text-amber-500 shrink-0">
                  <Star size={24} className="fill-current" />
                </div>
                <div>
                  <h4 className="text-lg font-black dark:text-white mb-2">Upgrade to Featured Listing</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200/70 mb-4 font-medium leading-relaxed">
                    Get 5x more visibility. Featured businesses appear at the top of the directory and get a special highlight badge. Support local journalism while growing your business!
                  </p>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={simulateUpgrade}
                        onChange={(e) => setSimulateUpgrade(e.target.checked)}
                      />
                      <div className="w-12 h-6 bg-amber-200 dark:bg-amber-900/30 rounded-full peer-checked:bg-amber-500 transition-colors"></div>
                      <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-sm"></div>
                    </div>
                    <span className="text-sm font-bold dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {simulateUpgrade ? "Selected! (+250 SZL / month)" : "Add Featured Upgrade (+250 SZL / month)"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-10 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white hover:scale-105 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? 'Processing...' : (simulateUpgrade ? 'Pay & Register Business' : 'Register List')} <Save size={16} />
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}

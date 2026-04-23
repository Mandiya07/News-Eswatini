import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Shield, Plus, Trash2, ExternalLink, FileText, ChevronRight, AlertCircle, CheckCircle2, History, DollarSign, TrendingUp, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Article } from '../types';
import { formatDate, truncate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function MinistryPortal() {
  const { userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<'gazette' | 'sponsorship'>('gazette');
  
  // Sponsorship State (Mocked for dashboard)
  const [sponsorshipTiers, setSponsorshipTiers] = useState([
    { id: 1, name: 'Standard Notice', price: 1500, active: true },
    { id: 2, name: 'Premium Notice (Pinned)', price: 3000, active: true },
    { id: 3, name: 'Constituency Takeover', price: 5000, active: false }
  ]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('National');
  const [region, setRegion] = useState('');
  const [imageURL, setImageURL] = useState('');

  const isMinistryAdmin = userData?.role === 'ministry_admin' || userData?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !isMinistryAdmin) {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [authLoading, isMinistryAdmin, navigate]);

  const fetchNotices = async () => {
    try {
      const q = query(
        collection(db, 'articles'),
        where('isGovernmentNotice', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMinistryAdmin) {
      fetchNotices();
    }
  }, [isMinistryAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPosting(true);
    try {
      const noticeData = {
        title,
        content,
        category,
        region: region || 'National',
        imageURL: imageURL || null,
        authorId: auth.currentUser?.uid,
        authorName: userData?.department || 'Ministry of Tinkhundla',
        isGovernmentNotice: true,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        contentLabel: 'Official'
      };

      await addDoc(collection(db, 'articles'), noticeData);
      toast.success('Official Notice Published Successfully');
      
      // Reset form
      setTitle('');
      setContent('');
      setImageURL('');
      
      fetchNotices();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'articles');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to retract this official notice?')) return;
    
    try {
      await deleteDoc(doc(db, 'articles', id));
      toast.success('Notice Retracted');
      fetchNotices();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'articles');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Portal Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20">
                <Shield size={20} className="text-white" />
              </div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-rose-600">Ministerial Portal</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white leading-none">Government Gazette Management</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 font-medium max-w-xl">
              Official communication platform for the {userData?.department || 'Ministry of Tinkhundla'}. Publish verified notices directly to the national feed.
            </p>
          </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={() => setActiveTab('gazette')}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gazette' ? 'bg-white dark:bg-zinc-800 text-rose-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Gazette Notices
              </button>
              <button 
                onClick={() => setActiveTab('sponsorship')}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sponsorship' ? 'bg-white dark:bg-zinc-800 text-rose-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Sponsorship & Analytics
              </button>
            </div>
            {/* Authenticated As Badge */}
            <div className="hidden lg:flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authenticated As</p>
                <p className="text-sm font-bold dark:text-white">{userData?.officialTitle || 'Ministerial Official'}</p>
              </div>
            </div>
        </div>

        {activeTab === 'gazette' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* New Notice Form */}
            <div className="lg:col-span-12 xl:col-span-5">
              <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 sticky top-32">
                <h3 className="text-xl font-black uppercase tracking-widest dark:text-white mb-10 flex items-center gap-3">
                  <Plus size={20} className="text-rose-600" /> New Gazette Notice
                </h3>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Notice Title</label>
                  <input 
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                    placeholder="e.g. National Census 2026 Participation"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Detailed Content (Markdown Supported)</label>
                  <textarea 
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-6 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                    placeholder="Provide the full official text of the notice..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all appearance-none"
                    >
                      <option>National</option>
                      <option>Development</option>
                      <option>Health</option>
                      <option>Education</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Target Region</label>
                    <select 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all appearance-none"
                    >
                      <option value="">All Regions</option>
                      <option>Hhohho</option>
                      <option>Manzini</option>
                      <option>Lubombo</option>
                      <option>Shiselweni</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Header Image URL (Optional)</label>
                  <input 
                    type="url"
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isPosting}
                  className="w-full bg-rose-600 text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isPosting ? 'Publishing Official Record...' : (
                    <>
                      <FileText size={16} /> Publish to Gazette
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                <AlertCircle size={18} className="text-amber-600 mt-1 flex-shrink-0" />
                <p className="text-[9px] font-bold text-amber-900 dark:text-amber-400 leading-relaxed uppercase tracking-widest">
                  Notices published here carry the official government badge and are legally binding public records on this platform.
                </p>
              </div>
            </form>
          </div>

          {/* Activity Logs / Existing Notices */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3">
                <History size={24} className="text-zinc-400" /> Recent Gazette Activity
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 rounded-full">{notices.length} Active Records</span>
            </div>

            <div className="space-y-6">
              {notices.map((notice) => (
                <div key={notice.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 hover:border-rose-600 transition-all group shadow-sm hover:shadow-xl hover:shadow-rose-600/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full">Official</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{formatDate(notice.createdAt)}</span>
                      </div>
                      <h4 className="text-xl font-black dark:text-white uppercase tracking-tight line-clamp-1">{notice.title}</h4>
                      <p className="text-sm text-zinc-500 font-medium line-clamp-2">{truncate(notice.content, 120)}</p>
                    </div>
                    <div className="flex items-center gap-3 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-800 lg:pl-10">
                      <button 
                        onClick={() => navigate(`/article/${notice.id}`)}
                        className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-600 transition-all border border-zinc-100 dark:border-zinc-700"
                        title="View Official Page"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(notice.id)}
                        className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-600 transition-all border border-zinc-100 dark:border-zinc-700"
                        title="Retract Notice"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {notices.length === 0 && (
                <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  <FileText size={48} className="mx-auto text-zinc-200 mb-6" />
                  <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No gazette history on file.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-48 group hover:border-emerald-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <DollarSign size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">+12%</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Monthly Sponsorship Revenue</p>
                  <p className="text-4xl font-black dark:text-white tracking-tighter">SZL 45,500</p>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-48 group hover:border-rose-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Active Sponsored Posts</p>
                  <p className="text-4xl font-black dark:text-white tracking-tighter">18</p>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-48 group hover:border-blue-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                    <BarChart3 size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Avg. Views Per Sponsored Article</p>
                  <p className="text-4xl font-black dark:text-white tracking-tighter">14,200</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Sponsorship Tiers Management */}
              <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black uppercase tracking-widest dark:text-white flex items-center gap-3">
                    <Settings size={20} className="text-rose-600" /> Sponsorship Tiers
                  </h3>
                  <button className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full hover:bg-rose-600 hover:text-white transition-colors">
                    + Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {sponsorshipTiers.map(tier => (
                    <div key={tier.id} className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold dark:text-white">{tier.name}</h4>
                          <span className={`w-2 h-2 rounded-full ${tier.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </div>
                        <p className="text-xs text-zinc-500">Rate: SZL {tier.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-6 text-zinc-400 text-center uppercase tracking-widest font-bold">Rates are currently set in SZL (Eswatini Lilangeni)</p>
              </div>

              {/* Recent Sponsorship Transactions */}
              <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-10">
                <h3 className="text-xl font-black uppercase tracking-widest dark:text-white flex items-center gap-3 mb-8">
                  <History size={20} className="text-rose-600" /> Recent Transactions
                </h3>
                <div className="space-y-6">
                  {[
                    { entity: 'MTN Eswatini', tier: 'Constituency Takeover', amount: 5000, status: 'Paid', date: 'Today' },
                    { entity: 'Eswatini Bank', tier: 'Premium Notice', amount: 3000, status: 'Paid', date: 'Yesterday' },
                    { entity: 'UNICEF Eswatini', tier: 'Standard Notice', amount: 1500, status: 'Pending', date: '3 days ago' },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold dark:text-white">{tx.entity}</p>
                        <p className="text-xs text-zinc-500">{tx.tier} • {tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black dark:text-white tracking-tight">SZL {tx.amount.toLocaleString()}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-100 hover:dark:bg-zinc-700 transition-colors dark:text-white">
                  Download Full Report (CSV)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

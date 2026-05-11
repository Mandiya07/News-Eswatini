import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Shield, Megaphone, CheckCircle2, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../lib/utils';
import { ALL_TINKHUNDLA } from '../constants';

export default function PoliticianPortal() {
  const { userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [constituency, setConstituency] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!authLoading && !userData) {
      navigate('/login');
      return;
    }
    // For demo purposes, we will treat any logged in user as potentially able to subscribe
    // and check a local state 'isSubscribed'.
    // Typically, we would check a user document property like `isVerifiedPolitician`.
    if (userData?.role === 'admin' || userData?.isVerifiedPolitician) {
      setIsSubscribed(true);
    }
  }, [authLoading, userData, navigate]);

  useEffect(() => {
    if (!isSubscribed || !auth.currentUser) {
      setLoading(false);
      return;
    }
    fetchUpdates();
  }, [isSubscribed]);

  const fetchUpdates = async () => {
    try {
      const q = query(
        collection(db, 'articles'),
        where('authorId', '==', auth.currentUser?.uid),
        where('contentLabel', '==', 'Official'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setUpdates(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    // Simulate payment subscription
    toast.success('Simulating Mobile Money Payment...');
    setTimeout(() => {
      setIsSubscribed(true);
      toast.success('Successfully Subscribed! Welcome to the Premium Politician Portal.');
    }, 2000);
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !constituency) return;
    setIsPosting(true);
    
    try {
      await addDoc(collection(db, 'articles'), {
        title,
        content,
        category: 'Politics',
        inkhundla: constituency,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Verified Politician',
        contentLabel: 'Official',
        status: 'published',
        createdAt: serverTimestamp()
      });
      toast.success('Official update posted to constituency feed!');
      setTitle('');
      setContent('');
      fetchUpdates();
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Failed to post update');
    } finally {
      setIsPosting(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-24 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 p-12 rounded-[3rem] shadow-2xl text-center border border-zinc-100 dark:border-zinc-800">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <Shield size={48} />
            <span className="absolute bottom-0 right-0 bg-white dark:bg-zinc-900 rounded-full p-1"><CheckCircle2 size={24} className="text-blue-500" /></span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white mb-4">Premium Verified Politician</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed max-w-lg mx-auto">
            Upgrade your account to instantly post official updates, achievements, and announcements directly to your constituency's news feed. Connect with your voters directly.
          </p>
          
          <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl text-left space-y-4 mb-10 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
               <CheckCircle2 className="text-emerald-500" size={20} />
               <span className="text-sm font-bold dark:text-zinc-300">Blue Tick Verification Badge</span>
            </div>
            <div className="flex items-center gap-3">
               <CheckCircle2 className="text-emerald-500" size={20} />
               <span className="text-sm font-bold dark:text-zinc-300">Push Notifications to Local Voters</span>
            </div>
            <div className="flex items-center gap-3">
               <CheckCircle2 className="text-emerald-500" size={20} />
               <span className="text-sm font-bold dark:text-zinc-300">Unlimited Official Updates</span>
            </div>
          </div>

          <button 
            onClick={handleSubscribe}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
          >
            Subscribe via Mobile Money (SZL 250/mo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar sidebar-style layout typically, but let's just make it a clean centralized dashboard for simplicity */}
      <div className="max-w-4xl mx-auto w-full py-24 px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3">
              Politician Portal <CheckCircle2 size={28} className="text-blue-500" />
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">Manage your constituency communications.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <Megaphone size={24} className="text-blue-500 mb-4" />
            <h3 className="text-2xl font-black dark:text-white">{updates.length}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Updates</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <TrendingUp size={24} className="text-emerald-500 mb-4" />
            <h3 className="text-2xl font-black dark:text-white">12.4k</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Reach (Est)</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <Heart size={24} className="text-rose-500 mb-4" />
            <h3 className="text-2xl font-black dark:text-white">845</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Engagements</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800 mb-12">
          <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">Post Official Update</h2>
          <form onSubmit={handlePostUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Constituency <span className="text-rose-500">*</span></label>
              <select 
                value={constituency}
                onChange={e => setConstituency(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-600 font-medium dark:text-white"
                required
              >
                <option value="">Select Inkhundla</option>
                {ALL_TINKHUNDLA.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Headline <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. New Water Project Completed in Region 3..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-600 font-medium dark:text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Details <span className="text-rose-500">*</span></label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write the full update here..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 min-h-[150px] outline-none focus:ring-2 focus:ring-blue-600 font-medium dark:text-white resize-none"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isPosting}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {isPosting ? 'Publishing...' : 'Publish Update to Feed'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-6">Recent Updates</h2>
          {updates.length === 0 ? (
            <div className="text-center bg-zinc-50 dark:bg-zinc-900/50 p-12 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-zinc-500 font-medium">
              You haven't posted any updates yet.
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map(update => (
                <div key={update.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h4 className="font-bold dark:text-white text-lg">{update.title}</h4>
                    <div className="flex gap-4 mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>{formatDate(update.createdAt)}</span>
                      <span>Target: {update.inkhundla}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-max flex items-center gap-1">
                    <CheckCircle2 size={12} /> Published
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

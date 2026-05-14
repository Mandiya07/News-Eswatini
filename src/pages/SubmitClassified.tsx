import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { ALL_TINKHUNDLA } from '../constants';
import { Megaphone, CreditCard, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import MediaUpload from '../components/MediaUpload';

export default function SubmitClassified() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'For Sale',
    constituency: '',
    price: '',
    contactInfo: '',
    imageURL: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Please log in to post a classified.');
      navigate('/login');
      return;
    }

    if (!formData.title || !formData.description || !formData.constituency) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Simulate Mobile Money Payment Delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const classifiedData = {
        ...formData,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        isActive: true
      };

      await addDoc(collection(db, 'classifieds'), classifiedData);
      setSuccess(true);
      toast.success('Payment successful! Classified posted.');
    } catch (error) {
      console.error('Error posting classified:', error);
      toast.error('Failed to post classified.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-4">Classified Posted</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">Your classified ad is now live in {formData.constituency}.</p>
          <button 
            onClick={() => navigate('/classifieds')}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
          >
            View Classifieds
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-max mx-auto mb-6">
            <Megaphone size={14} /> Community Board
          </span>
          <h1 className="text-5xl font-black dark:text-white uppercase tracking-tighter mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">Post a Classified</span></h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Post obituaries, lost & found, or items for sale in your constituency.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white"
              >
                <option value="For Sale">For Sale</option>
                <option value="Lost & Found">Lost & Found</option>
                <option value="Obituary">Obituary</option>
                <option value="Services">Services / Jobs</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Constituency</label>
              <select 
                value={formData.constituency}
                onChange={e => setFormData({ ...formData, constituency: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white"
                required
              >
                <option value="">Select Inkhundla</option>
                {ALL_TINKHUNDLA.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ad Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lost Brown Puppy near Mbabane Market"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about your ad..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 min-h-[120px] outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Price / Reward (Optional)</label>
              <input 
                type="text" 
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. SZL 500"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Contact Info</label>
              <input 
                type="text" 
                value={formData.contactInfo}
                onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="Phone or email"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <MediaUpload 
              label="Upload Ad Image (Optional)"
              onUploadComplete={(url) => setFormData({ ...formData, imageURL: url })}
              accept="image"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
            <CreditCard className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-amber-900 dark:text-amber-400 mb-1">Posting Fee: SZL 5.00</h4>
              <p className="text-xs text-amber-800/70 dark:text-amber-500/80 font-medium leading-relaxed">
                A tiny fee helps us keep the platform spam-free and supports local community servers. Payment will be processed via Mobile Money upon submission.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900 rounded-full animate-spin"></span> Processing...</>
            ) : (
              'Pay SZL 5.00 & Post Ad'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Shield, Calendar, Bookmark, Heart, MessageSquare, Edit2, Camera, ArrowRight, TrendingUp, Award, Wallet } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { ALL_TINKHUNDLA } from '../constants';

export default function Profile() {
  const { user, userData, loading, isContributor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [constituency, setConstituency] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userData) {
      setName(userData.name || user.displayName || '');
      setConstituency(userData.constituency || '');
    }
  }, [user, userData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user, { displayName: name });
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { name, constituency });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] p-10 border border-zinc-100 dark:border-zinc-800 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-600"></div>
              
              <div className="relative inline-block mb-8">
                <div className="w-40 h-40 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-8 border-white dark:border-zinc-800 shadow-2xl mx-auto transition-transform duration-500 group-hover:scale-105">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={80} className="text-zinc-200 dark:text-zinc-700" />
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-3 bg-rose-600 text-white rounded-2xl shadow-xl hover:bg-rose-700 transition-all hover:scale-110 active:scale-95">
                  <Camera size={20} />
                </button>
              </div>
              
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-black dark:text-white tracking-tighter leading-none">{userData?.name || user.displayName || 'User'}</h2>
                <p className="text-sm text-zinc-500 font-medium">{user.email}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-10">
                <span className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <Shield size={12} className="text-rose-500" /> {userData?.role || 'Reader'}
                </span>
                <span className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <Calendar size={12} className="text-rose-500" /> Joined {formatDate(userData?.createdAt?.toDate() || new Date())}
                </span>
              </div>

              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/10"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>

            <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-zinc-950/20 border border-white/5 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl"></div>
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                <TrendingUp size={14} /> Account Stats
              </h3>
              <div className="grid grid-cols-1 gap-8">
                {isContributor ? (
                  <>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Earnings</p>
                        <p className="text-3xl font-black text-white tracking-tighter">SZL {(userData.earnings || 0).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Wallet size={24} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Views</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{(userData.totalViews || 0).toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Reputation</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{userData.reputationPoints || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Award size={24} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Bookmarks</p>
                        <p className="text-3xl font-black text-white tracking-tighter">12</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Bookmark size={24} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Likes Given</p>
                        <p className="text-3xl font-black text-white tracking-tighter">45</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Heart size={24} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Comments</p>
                        <p className="text-3xl font-black text-white tracking-tighter">8</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <MessageSquare size={24} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] p-12 border border-zinc-100 dark:border-zinc-800 shadow-sm"
                >
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-10 dark:text-white leading-none">Edit Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Display Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Constituency</label>
                      <select
                        value={constituency}
                        onChange={(e) => setConstituency(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                      >
                        <option value="">Select a constituency</option>
                        {ALL_TINKHUNDLA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Email Address (Read Only)</label>
                      <input 
                        type="email" 
                        value={user.email}
                        disabled
                        className="w-full bg-zinc-100 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm text-zinc-500 font-medium outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="flex justify-end gap-4 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-rose-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="profile-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  {/* Bookmarks */}
                  <section className="space-y-10">
                    <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-6">
                      <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-4">
                        <Bookmark size={28} className="text-rose-600" /> Bookmarked Stories
                      </h3>
                      <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline flex items-center gap-2 group">
                        View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {[1, 2].map(i => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -5 }}
                          className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col group"
                        >
                          <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                            <img 
                              src={`https://picsum.photos/seed/bookmark-${i}/600/400`} 
                              alt="Bookmark" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Politics</span>
                            </div>
                          </div>
                          <div className="p-8 space-y-4">
                            <h4 className="text-xl font-black dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors">New infrastructure project announced for Manzini</h4>
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">2 days ago</p>
                              <button className="text-zinc-400 hover:text-rose-600 transition-colors">
                                <Bookmark size={16} fill="currentColor" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Recent Comments */}
                  <section className="space-y-10">
                    <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-6">
                      <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-4">
                        <MessageSquare size={28} className="text-rose-600" /> Recent Comments
                      </h3>
                    </div>
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 5 }}
                          className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-rose-600/20"></div>
                          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium italic">
                            "This is a great development for our region. We've been waiting for this for a long time."
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-xs font-black dark:text-zinc-200 uppercase tracking-widest">On: Eswatini Economic Outlook 2026</p>
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">3 days ago</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

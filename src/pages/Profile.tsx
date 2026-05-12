import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Shield, Calendar, Bookmark, Heart, MessageSquare, Edit2, Camera, ArrowRight, TrendingUp, Award, Wallet, MapPin, Twitter, Facebook, Instagram, Globe, Eye, Coins, FileText, ChevronUp } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { ALL_TINKHUNDLA } from '../constants';
import { Article } from '../types';

import MediaUpload from '../components/MediaUpload';

export default function Profile() {
  const { user, userData, loading, isContributor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [name, setName] = useState('');
  const [constituency, setConstituency] = useState('');
  const [videoBio, setVideoBio] = useState('');
  const [officialTitle, setOfficialTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [socials, setSocials] = useState({
    twitter: '',
    facebook: '',
    instagram: '',
    website: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userData) {
      setName(userData.name || user.displayName || '');
      setConstituency(userData.constituency || '');
      setVideoBio(userData.videoBio || '');
      setOfficialTitle(userData.officialTitle || '');
      setDepartment(userData.department || '');
      if (userData.socials) {
        setSocials({
          twitter: userData.socials.twitter || '',
          facebook: userData.socials.facebook || '',
          instagram: userData.socials.instagram || '',
          website: userData.socials.website || ''
        });
      }
    }
  }, [user, userData]);

  useEffect(() => {
    if (user && isContributor) {
      const fetchMyArticles = async () => {
        setLoadingArticles(true);
        try {
          const q = query(
            collection(db, 'articles'),
            where('authorId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const snapshot = await getDocs(q);
          setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
        } catch (error) {
          console.error('Error fetching articles:', error);
        } finally {
          setLoadingArticles(false);
        }
      };
      fetchMyArticles();
    }
  }, [user, isContributor]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user, { displayName: name });
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { 
          name, 
          constituency, 
          videoBio,
          officialTitle,
          department,
          socials: {
            twitter: socials.twitter,
            facebook: socials.facebook,
            instagram: socials.instagram,
            website: socials.website
          }
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const updatePhoto = async (url: string) => {
    if (!user) return;
    try {
      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to update profile picture');
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
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] p-12 border border-zinc-100 dark:border-zinc-800 shadow-sm text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600"></div>
              
              <div className="relative inline-block mb-10">
                <div className="w-48 h-48 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-8 border-white dark:border-zinc-800 shadow-2xl mx-auto transition-transform duration-700 group-hover:scale-105 relative">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={96} className="text-zinc-200 dark:text-zinc-700" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
                <MediaUpload 
                  onUploadComplete={(url) => updatePhoto(url)}
                  accept="image"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>
              
              <div className="space-y-3 mb-10">
                <h2 className="serif text-4xl font-black dark:text-white tracking-tighter leading-none">{userData?.name || user.displayName || 'User'}</h2>
                <p className="text-sm text-zinc-500 font-medium">{user.email}</p>
                {userData?.constituency && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <MapPin size={12} /> {userData.constituency}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <span className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <Shield size={14} className="text-rose-500" /> {userData?.role || 'Reader'}
                </span>
                {(userData?.role === 'admin' || userData?.role === 'ministry_admin') && userData.officialTitle && (
                  <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg shadow-rose-600/20">
                    <Shield size={14} /> {userData.officialTitle}
                  </span>
                )}
                <span className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <Calendar size={14} className="text-rose-500" /> Joined {formatDate(userData?.createdAt?.toDate() || new Date())}
                </span>
              </div>

              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-zinc-950/10 mb-4"
              >
                <Edit2 size={18} /> Edit Profile
              </button>

              {(userData?.role === 'ministry_admin' || userData?.role === 'admin') && (
                <button 
                  onClick={() => navigate('/ministry-portal')}
                  className="w-full py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-rose-600/20 mb-4"
                >
                  <Shield size={18} /> Ministry Admin Portal
                </button>
              )}

              {(userData?.role === 'editor' || userData?.role === 'admin') && (
                <button 
                  onClick={() => navigate('/editor-portal')}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/20"
                >
                  <Shield size={18} /> Editor Dashboard
                </button>
              )}
            </div>

            <div className="bg-zinc-950 text-white rounded-[3rem] p-12 shadow-2xl shadow-zinc-950/20 border border-white/5 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl"></div>
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                <TrendingUp size={16} /> Account Stats
              </h3>
              <div className="grid grid-cols-1 gap-10">
                {isContributor ? (
                  <>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Earnings</p>
                        <p className="serif text-4xl font-black text-white tracking-tighter italic">SZL {(userData.earnings || 0).toFixed(2)}</p>
                      </div>
                      <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Wallet size={28} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Views</p>
                        <p className="serif text-4xl font-black text-white tracking-tighter italic">{(userData.totalViews || 0).toLocaleString()}</p>
                      </div>
                      <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <TrendingUp size={28} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Reputation</p>
                        <p className="serif text-4xl font-black text-white tracking-tighter italic">{userData.reputationPoints || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Award size={28} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Bookmarks</p>
                        <p className="serif text-4xl font-black text-white tracking-tighter italic">12</p>
                      </div>
                      <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Bookmark size={28} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Likes Given</p>
                        <p className="serif text-4xl font-black text-white tracking-tighter italic">45</p>
                      </div>
                      <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <Heart size={28} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Comments</p>
                        <p className="serif text-4xl font-black text-white tracking-tighter italic">8</p>
                      </div>
                      <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <MessageSquare size={28} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] p-12 border border-zinc-100 dark:border-zinc-800 shadow-sm"
                >
                  <h3 className="serif text-5xl font-black uppercase tracking-tighter mb-12 dark:text-white leading-none">Edit Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Display Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Constituency</label>
                      <select
                        value={constituency}
                        onChange={(e) => setConstituency(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all appearance-none"
                      >
                        <option value="">Select your constituency</option>
                        {ALL_TINKHUNDLA.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {(userData?.role === 'admin' || userData?.role === 'ministry_admin') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 flex items-center gap-2">
                            <Shield size={12} className="text-rose-600" /> Official Title
                          </label>
                          <input 
                            type="text" 
                            value={officialTitle}
                            onChange={(e) => setOfficialTitle(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="e.g. Director of Communications"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 flex items-center gap-2">
                             <Shield size={12} className="text-rose-600" /> Department/Ministry
                          </label>
                          <input 
                            type="text" 
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] px-8 py-5 text-sm font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="e.g. Ministry of Tinkhundla"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Video Biography</label>
                      {videoBio && (
                        <div className="mb-4 aspect-video rounded-[1.5rem] overflow-hidden bg-black border border-zinc-200 dark:border-zinc-800 shadow-lg">
                          <video 
                            src={videoBio} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <MediaUpload 
                        label={videoBio ? "Change Video Biography" : "Upload Video Biography"}
                        accept="video"
                        onUploadComplete={(url) => setVideoBio(url)}
                        className="bg-white dark:bg-zinc-800 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 p-2"
                      />
                      <div className="pt-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 opacity-60">Or paste a video URL</label>
                        <input 
                          type="url" 
                          value={videoBio}
                          onChange={(e) => setVideoBio(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] px-8 py-4 text-xs font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all mt-2"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 mb-6">Social Media & Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Twitter size={14} className="text-[#1DA1F2]" /> Twitter URL
                          </label>
                          <input 
                            type="url" 
                            value={socials.twitter}
                            onChange={(e) => setSocials(prev => ({ ...prev, twitter: e.target.value }))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 text-xs font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="https://twitter.com/yourhandle"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Facebook size={14} className="text-[#1877F2]" /> Facebook URL
                          </label>
                          <input 
                            type="url" 
                            value={socials.facebook}
                            onChange={(e) => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 text-xs font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="https://facebook.com/yourprofile"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Instagram size={14} className="text-[#E4405F]" /> Instagram URL
                          </label>
                          <input 
                            type="url" 
                            value={socials.instagram}
                            onChange={(e) => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 text-xs font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="https://instagram.com/yourhandle"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Globe size={14} className="text-zinc-400" /> Website URL
                          </label>
                          <input 
                            type="url" 
                            value={socials.website}
                            onChange={(e) => setSocials(prev => ({ ...prev, website: e.target.value }))}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-6 py-4 text-xs font-medium focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Email Address (Read Only)</label>
                      <input 
                        type="email" 
                        value={user.email}
                        disabled
                        className="w-full bg-zinc-100 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] px-8 py-5 text-sm text-zinc-500 font-medium outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="flex justify-end gap-6 pt-10">
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-rose-600 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20 active:scale-95"
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
                  className="space-y-20"
                >
                  {/* Journalist Performance Dashboard */}
                  {isContributor && (
                    <section className="space-y-12">
                      <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-8">
                        <h3 className="serif text-4xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-5">
                          <TrendingUp size={32} className="text-emerald-600" /> Performance & Analytics
                        </h3>
                      </div>
                      
                      {/* Top Performance Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-emerald-500 text-white rounded-2xl"><Coins size={24} /></div>
                              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">+12% vs last month</span>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/60 dark:text-emerald-500/60 mb-2">Estimated Balance</p>
                           <h4 className="text-4xl font-black dark:text-white leading-none">SZL {(userData?.earnings || 0).toFixed(2)}</h4>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-800">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-blue-500 text-white rounded-2xl"><Eye size={24} /></div>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-blue-800/60 dark:text-blue-500/60 mb-2">Article Traffic</p>
                           <h4 className="text-4xl font-black dark:text-white leading-none">{(userData?.totalViews || 0).toLocaleString()} <span className="text-sm font-medium text-blue-400 font-sans tracking-normal ml-1">views</span></h4>
                        </div>

                        <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-800">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-rose-500 text-white rounded-2xl"><FileText size={24} /></div>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-rose-800/60 dark:text-rose-500/60 mb-2">Approved Stories</p>
                           <h4 className="text-4xl font-black dark:text-white leading-none">{userData?.articleCount || 0}</h4>
                        </div>
                      </div>

                      {/* Recent Published Articles Table-like List */}
                      <div className="bg-white dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                           <h4 className="text-xs font-black uppercase tracking-widest dark:text-white">Your Published Items</h4>
                           <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">View Analytics <ChevronUp size={14} className="rotate-90" /></button>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {articles.map((article) => (
                            <div key={article.id} className="p-8 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                               <div className="flex-1 pr-8">
                                  <h5 className="font-black dark:text-white uppercase tracking-tighter text-lg leading-tight mb-2">{article.title}</h5>
                                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                     <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(article.createdAt?.toDate() || new Date())}</span>
                                     <span className="flex items-center gap-1 text-emerald-500"><Coins size={12} /> Earned SZL {(article.views ? (article.views * 0.15) : 0).toFixed(2)}</span>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white font-black text-xl leading-none mb-1">
                                    {article.views || 0} <Eye size={16} className="text-rose-500" />
                                  </div>
                                  <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Total Impressions</p>
                               </div>
                            </div>
                          ))}
                          {loadingArticles && <div className="p-12 text-center text-zinc-400 animate-pulse uppercase font-black text-xs">Loading analytics...</div>}
                          {!loadingArticles && articles.length === 0 && (
                            <div className="p-12 text-center text-zinc-500 font-medium italic">No articles published yet. Approve stories in Editor Portal to begin earning.</div>
                          )}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Bookmarks */}
                  <section className="space-y-12">
                    <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-8">
                      <h3 className="serif text-4xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-5">
                        <Bookmark size={32} className="text-rose-600" /> Bookmarked Stories
                      </h3>
                      <button className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 hover:underline flex items-center gap-3 group">
                        View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {[1, 2].map(i => (
                        <motion.div 
                          key={i} 
                          whileHover={{ y: -8 }}
                          className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-950/5 flex flex-col group"
                        >
                          <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                            <img 
                              src={`https://picsum.photos/seed/bookmark-${i}/600/400`} 
                              alt="Bookmark" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-6 left-6">
                              <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-lg shadow-rose-600/20">Politics</span>
                            </div>
                          </div>
                          <div className="p-10 space-y-5">
                            <h4 className="serif text-2xl font-black dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-rose-600 transition-colors tracking-tight">New infrastructure project announced for Manzini</h4>
                            <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800">
                              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">2 days ago</p>
                              <button className="text-zinc-400 hover:text-rose-600 transition-colors">
                                <Bookmark size={18} fill="currentColor" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Recent Comments */}
                  <section className="space-y-12">
                    <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-8">
                      <h3 className="serif text-4xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-5">
                        <MessageSquare size={32} className="text-rose-600" /> Recent Comments
                      </h3>
                    </div>
                    <div className="space-y-8">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 8 }}
                          className="bg-zinc-50 dark:bg-zinc-900/50 p-12 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600/20"></div>
                          <p className="serif text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-black italic tracking-tight">
                            "This is a great development for our region. We've been waiting for this for a long time."
                          </p>
                          <div className="flex items-center justify-between pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <p className="text-[10px] font-black dark:text-zinc-200 uppercase tracking-[0.2em]">On: Eswatini Economic Outlook 2026</p>
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">3 days ago</span>
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

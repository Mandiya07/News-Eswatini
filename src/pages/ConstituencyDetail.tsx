import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare, Heart, MapPin, ChevronRight, ArrowLeft, Bookmark, Shield, Info, Building2, Phone, Mail } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_TINKHUNDLA } from '../constants';
import AdBanner from '../components/ads/AdBanner';

export default function ConstituencyDetail() {
  const { constituencyName } = useParams<{ constituencyName: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const constituency = ALL_TINKHUNDLA.find(t => t.toLowerCase().replace(/\s+/g, '-') === constituencyName);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!constituency) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [data, fetchedAds] = await Promise.all([
           newsService.getArticlesByConstituency(constituency),
           newsService.getAdsForLocation(undefined, constituency)
        ]);
        setArticles(data);
        setAds(fetchedAds);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
    window.scrollTo(0, 0);
  }, [constituency]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!constituency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-4xl font-black dark:text-white mb-4">Constituency Not Found</h1>
          <Link to="/constituencies" className="text-rose-600 font-bold hover:underline">Back to Constituencies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8"
          >
            <Link to="/" className="hover:text-rose-600 flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
            <ChevronRight size={10} />
            <Link to="/constituencies" className="hover:text-rose-600">Constituencies</Link>
            <ChevronRight size={10} />
            <span className="text-zinc-900 dark:text-zinc-100">{constituency}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter dark:text-white mb-4 leading-none">{constituency}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl font-medium text-lg">
              Latest news and stories from {constituency}.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <AnimatePresence mode="popLayout">
                {articles.map((article, idx) => (
                  <motion.div 
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex flex-col bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-950/10 transition-all duration-500"
                  >
                    <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <Link to={`/article/${article.id}`} className="block w-full h-full focus:outline-none z-0">
                        <img 
                          src={article.imageURL || `https://picsum.photos/seed/${article.id}/600/400`} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-center items-center text-center z-10 pointer-events-none">
                          <h4 className="text-lg font-black uppercase tracking-tighter mb-4 dark:text-white line-clamp-2">{article.title}</h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-6">{article.content}</p>
                        </div>
                      </Link>
                      <div className="absolute top-4 left-4 z-20">
                        <Link 
                          to={`/category/${article.category?.toLowerCase() || ''}`}
                          className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors block"
                        >
                          {article.category}
                        </Link>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-rose-500" /> {formatDate(article.createdAt)}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                        <Link 
                          to={`/category/${article.category?.toLowerCase() || ''}`}
                          className="text-rose-600 hover:text-rose-700 transition-colors"
                        >
                          {article.category}
                        </Link>
                      </div>
                      <Link to={`/article/${article.id}`} className="flex-1">
                        <h3 className="text-xl font-black leading-tight dark:text-zinc-100 group-hover:text-rose-600 transition-colors mb-4">
                          {article.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-8 font-medium">
                          {truncate(article.content, 150)}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-6">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"><Heart size={14} /> {article.likes || 0}</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"><MessageSquare size={14} /> {article.commentsCount || 0}</span>
                        </div>
                        <button className="text-zinc-400 hover:text-rose-600 transition-colors">
                          <Bookmark size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Ministry Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-rose-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Shield size={24} className="text-rose-400" />
                  <h3 className="text-lg font-black uppercase tracking-tighter">Inkhundla Hub</h3>
                </div>
                <p className="text-sm text-rose-100/70 font-medium mb-8 leading-relaxed">
                  The Ministry of Tinkhundla is committed to local development. Here you can find official contacts and service information for {constituency}.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Building2 size={18} className="text-rose-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-300/60 mb-1">Inkhundla Office</p>
                      <p className="text-sm font-bold">{constituency} Admin Centre</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <User size={18} className="text-rose-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-300/60 mb-1">Indvuna yeNkhundla</p>
                      <p className="text-sm font-bold">To be verified...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Phone size={18} className="text-rose-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-300/60 mb-1">Direct Helpline</p>
                      <p className="text-sm font-bold">+268 2400 0000</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/10">
                  <button className="w-full py-4 bg-white text-rose-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-colors shadow-lg active:scale-95">
                    Contact Ministry
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-10 rounded-[3rem] border border-zinc-200 dark:border-zinc-800">
               <h3 className="text-sm font-black uppercase tracking-widest dark:text-white mb-8 flex items-center gap-2">
                 <Info size={16} className="text-zinc-400" /> Regional Guidelines
               </h3>
               <ul className="space-y-6">
                 {[
                   'Development reports',
                   'Community projects',
                   'Tinkhundla events',
                   'Local services'
                 ].map(item => (
                   <li key={item} className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-lg mx-auto">
          <AdBanner ads={ads} />
        </div>

        {articles.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <p className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest text-xs">No articles found for {constituency} yet.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

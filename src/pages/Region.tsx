import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare, Heart, MapPin, ChevronRight, Filter, Info, ArrowLeft, Bookmark } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TINKHUNDLA_DATA } from '../constants';
import AdBanner from '../components/ads/AdBanner';

export default function Region() {
  const { region } = useParams<{ region: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const regionKey = region ? region.charAt(0).toUpperCase() + region.slice(1).toLowerCase() : '';
  const constituencies = TINKHUNDLA_DATA[regionKey as keyof typeof TINKHUNDLA_DATA] || [];

  useEffect(() => {
    const fetchArticles = async () => {
      if (!region) return;
      setLoading(true);
      try {
        // Query using the formatted Title Case key
        const [data, fetchedAds] = await Promise.all([
           newsService.getArticlesByRegion(regionKey),
           newsService.getAdsForLocation(regionKey)
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
  }, [region, regionKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const regionInfo: Record<string, { desc: string, color: string, icon: string }> = {
    hhohho: { 
      desc: "The Hhohho region is located in the northwest of Eswatini and is home to the capital city, Mbabane. It is known for its mountainous terrain and the beautiful Ezulwini Valley.",
      color: "bg-blue-600",
      icon: "⛰️"
    },
    manzini: { 
      desc: "The Manzini region is the central hub of Eswatini, hosting the country's largest city, Manzini. It is the industrial and commercial heart of the Kingdom.",
      color: "bg-emerald-600",
      icon: "🏢"
    },
    lubombo: { 
      desc: "The Lubombo region in the east is characterized by the Lubombo Mountains and vast sugar cane plantations. It borders Mozambique and South Africa.",
      color: "bg-amber-600",
      icon: "🌾"
    },
    shiselweni: { 
      desc: "The Shiselweni region in the south is known for its agricultural potential and rich cultural heritage. It is the southernmost region of the Kingdom.",
      color: "bg-indigo-600",
      icon: "🚜"
    }
  };

  const currentRegion = region?.toLowerCase() || '';
  const info = regionInfo[currentRegion] || { desc: 'Latest news and updates from the region.', color: 'bg-rose-600', icon: '📍' };

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
            <span className="text-zinc-900 dark:text-zinc-100">Regions</span>
            <ChevronRight size={10} />
            <span className="text-zinc-900 dark:text-zinc-100 capitalize">{region}</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{info.icon}</span>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter dark:text-white leading-none capitalize">{region} Region</h1>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium text-lg">
                {info.desc}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-4"
            >
              <button className="flex items-center gap-2 px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-950/10">
                <MapPin size={18} /> View Map
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all dark:text-zinc-400">
                <Info size={18} /> Region Facts
              </button>
            </motion.div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white">Regional Stories</h2>
              <button className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 transition-colors">
                <Filter size={18} />
              </button>
            </div>
            
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
                      <Link to={`/article/${article.id}`} className="block w-full h-full focus:outline-none">
                        <img 
                          src={article.imageURL || `https://picsum.photos/seed/${article.id}/600/400`} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      <div className="absolute top-4 left-4 z-10">
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
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-8 font-medium">
                          {truncate(article.content, 120)}
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
            
            {articles.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800"
              >
                <p className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest text-xs">No stories from this region yet. Check back soon!</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-16">
            <div className="bg-zinc-950 text-white p-10 rounded-3xl shadow-2xl shadow-zinc-950/20 border border-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Constituencies</h3>
              <p className="text-sm text-zinc-400 mb-8 font-medium">Explore news from specific Tinkhundla in the {region} region.</p>
              <div className="grid grid-cols-1 gap-3">
                {constituencies.map(ink => (
                  <Link 
                    key={ink} 
                    to={`/constituency/${ink.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="text-left px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group"
                  >
                    {ink}
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            <AdBanner ads={ads} />
          </div>
        </div>
      </div>
    </div>
  );
}

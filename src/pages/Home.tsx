import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, ChevronRight, Play, MapPin, MessageSquare, Heart, Share2, Bookmark, Filter } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article, Poll } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Home() {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [trending, setTrending] = useState<Article[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredData, latestResult, pollData] = await Promise.all([
          newsService.getFeaturedArticles(3),
          newsService.getLatestArticles(10),
          newsService.getActivePolls()
        ]);

        setFeatured(featuredData);
        setLatest(latestResult.articles);
        setActivePoll(pollData[0] || null);
        
        // Mock trending for now
        setTrending(latestResult.articles.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
          {/* Main Featured Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8"
          >
            {featured.length > 0 ? (
              <Link to={`/article/${featured[0].id}`} className="group relative block h-[500px] overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl shadow-zinc-950/20">
                <img 
                  src={featured[0].imageURL || 'https://picsum.photos/seed/eswatini/1200/800'} 
                  alt={featured[0].title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
                  <div className="flex gap-2 mb-6">
                    <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-rose-600/20">Featured</span>
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10">{featured[0].category}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mb-6 group-hover:text-rose-400 transition-colors max-w-2xl">
                    {featured[0].title}
                  </h1>
                  <div className="flex items-center gap-6 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-rose-500" /> {formatDate(featured[0].createdAt)}</span>
                    <span className="flex items-center gap-2"><MessageSquare size={14} className="text-rose-500" /> {featured[0].commentsCount || 0} Comments</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="h-[500px] bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                No featured articles yet.
              </div>
            )}
          </motion.div>

          {/* Trending Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 flex flex-col gap-6"
          >
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 dark:text-white">
                  <TrendingUp size={20} className="text-rose-600" /> Trending
                </h2>
                <Link to="/trending" className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-8">
                {trending.map((article, idx) => (
                  <Link key={article.id} to={`/article/${article.id}`} className="flex gap-6 group">
                    <span className="text-4xl font-black text-zinc-200 dark:text-zinc-800 group-hover:text-rose-600 transition-colors tabular-nums leading-none">0{idx + 1}</span>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em]">{article.category}</span>
                      <h3 className="text-sm font-bold leading-snug dark:text-zinc-200 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Regional Navigation Cards */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white mb-2">Explore Regions</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Hyper-local news from every corner of the Kingdom.</p>
            </div>
            <Link to="/constituencies" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-600 hover:gap-3 transition-all">
              All Constituencies <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Hhohho', color: 'bg-blue-600', icon: '⛰️', desc: 'Highlands & Capital' },
              { name: 'Manzini', color: 'bg-emerald-600', icon: '🏢', desc: 'Hub of Eswatini' },
              { name: 'Lubombo', color: 'bg-amber-600', icon: '🌾', desc: 'Sugar & Nature' },
              { name: 'Shiselweni', color: 'bg-indigo-600', icon: '🚜', desc: 'Southern Heart' }
            ].map((region, idx) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link 
                  to={`/region/${region.name.toLowerCase()}`}
                  className={cn(
                    "relative h-48 rounded-3xl overflow-hidden group flex flex-col items-center justify-center text-white p-6 text-center",
                    region.color
                  )}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                  <span className="relative z-10 text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{region.icon}</span>
                  <span className="relative z-10 text-2xl font-black uppercase tracking-tighter">{region.name}</span>
                  <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{region.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Latest News */}
          <div className="lg:col-span-8 space-y-16">
            <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white">The Latest Feed</h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-12">
              {latest.map((article, idx) => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 group"
                >
                  <Link to={`/article/${article.id}`} className="md:col-span-5 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-xl shadow-zinc-950/5">
                    <img 
                      src={article.imageURL || `https://picsum.photos/seed/${article.id}/600/400`} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div className="md:col-span-7 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">{article.category}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} className="text-rose-500" /> {formatDate(article.createdAt)}
                      </span>
                    </div>
                    <Link to={`/article/${article.id}`}>
                      <h3 className="text-2xl font-black leading-[1.2] dark:text-zinc-100 group-hover:text-rose-600 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {truncate(article.content, 180)}
                    </p>
                    <div className="flex items-center gap-8 pt-4">
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors">
                        <Heart size={16} /> {article.likes || 0}
                      </button>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors">
                        <MessageSquare size={16} /> {article.commentsCount || 0}
                      </button>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors ml-auto">
                        <Bookmark size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full py-6 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all dark:text-zinc-400">
              Explore More Stories
            </button>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-16">
            {/* Poll Widget */}
            {activePoll && (
              <div className="bg-zinc-950 p-8 rounded-3xl text-white shadow-2xl shadow-rose-900/10 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Live Poll</h3>
                </div>
                <h4 className="text-xl font-black mb-8 leading-tight">{activePoll.question}</h4>
                <div className="space-y-3">
                  {activePoll.options.map((option, idx) => (
                    <button 
                      key={idx}
                      className="w-full p-4 text-left text-xs font-black uppercase tracking-widest border border-white/10 rounded-2xl hover:bg-white hover:text-zinc-950 transition-all duration-300"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Results in 2 days</span>
                  <span>{activePoll.options.reduce((acc, curr) => acc + curr.votes, 0)} Votes</span>
                </div>
              </div>
            )}

            {/* Newsletter Widget */}
            <div className="relative group overflow-hidden bg-rose-600 p-10 rounded-3xl text-white shadow-2xl shadow-rose-600/20">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none">The Daily<br />Eswatini</h3>
                <p className="text-sm font-medium opacity-80 mb-8 max-w-[200px]">The most important stories delivered to your inbox every morning.</p>
                <form className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-white outline-none placeholder:text-white/40 backdrop-blur-md"
                  />
                  <button className="w-full bg-white text-rose-600 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-black/10">
                    Join Now
                  </button>
                </form>
              </div>
            </div>

            {/* Video Section */}
            <div className="space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tighter border-b-2 border-zinc-950 dark:border-white pb-4 dark:text-white">Video Reports</h3>
              <div className="space-y-8">
                {[1, 2].map(i => (
                  <div key={i} className="group cursor-pointer">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900 mb-4 shadow-xl shadow-zinc-950/10">
                      <img 
                        src={`https://picsum.photos/seed/video${i}/600/338`} 
                        alt="Video thumbnail"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-rose-600 group-hover:border-rose-600 transition-all duration-500">
                          <Play size={24} fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-zinc-950/60 backdrop-blur-md text-[9px] font-black text-white px-2 py-1 rounded-md uppercase tracking-widest">
                        04:20
                      </div>
                    </div>
                    <h4 className="text-sm font-black dark:text-white leading-snug group-hover:text-rose-600 transition-colors">
                      Inside the new Royal Science & Technology Park development
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Placement */}
            <div className="aspect-[4/5] bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 mb-4">
                <Share2 size={24} />
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Advertisement</span>
              <p className="text-xs text-zinc-500 font-medium">Support local journalism by advertising with us.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

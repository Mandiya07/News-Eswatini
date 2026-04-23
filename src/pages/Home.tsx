import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, ChevronRight, Play, MessageSquare, Filter } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article, Poll } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Home() {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredData, latestResult] = await Promise.all([
          newsService.getFeaturedArticles(4),
          newsService.getLatestArticles(12)
        ]);

        setFeatured(featuredData);
        setLatest(latestResult.articles);
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
        <div className="w-12 h-12 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen pb-24">
      {/* Editorial Header / Date bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 py-4 mb-12 hidden md:block">
        <div className="max-w-screen-2xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-950 dark:text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Mbabane, Eswatini
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors">Our Mission</Link>
            <Link to="/contact" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 border-b border-zinc-200 dark:border-zinc-800 pb-16">
          {/* Left Hero (Spans 8 cols) */}
          <div className="lg:col-span-8 group relative flex flex-col h-full border-r-0 lg:border-r border-zinc-200 dark:border-zinc-800 lg:pr-12">
            {featured.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex gap-4 mb-6">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Top Story</span>
                  <Link 
                    to={`/category/${featured[0].category?.toLowerCase() || ''}`} 
                    className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-rose-600 transition-colors z-10"
                  >
                    {featured[0].category}
                  </Link>
                </div>
                <Link to={`/article/${featured[0].id}`} className="group flex flex-col flex-1 hover:opacity-90 transition-opacity">
                  <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8 z-0">
                    <img 
                      src={featured[0].imageURL || 'https://picsum.photos/seed/hero/1200/675'} 
                      alt={featured[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s] ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h1 className="serif text-4xl sm:text-6xl md:text-[5rem] font-bold text-zinc-950 dark:text-white leading-[1.05] tracking-tight mb-6 group-hover:underline decoration-1 underline-offset-8">
                    {featured[0].title}
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-8 max-w-3xl">
                    {truncate(featured[0].content, 250)}
                  </p>
                  <div className="mt-auto text-xs font-bold uppercase tracking-widest text-zinc-500">
                    By {featured[0].authorName} • {formatDate(featured[0].createdAt)}
                  </div>
                </Link>
              </div>
            ) : (
               <div className="h-full min-h-[500px] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-400">No stories available</div>
            )}
          </div>

          {/* Right Column: Trending & Secondary Featured */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-12">
            <div>
              <div className="flex items-center gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Trending Now</h2>
              </div>
              <div className="flex flex-col space-y-6">
                {trending.map((article, idx) => (
                  <div key={article.id} className="group border-b border-zinc-100 dark:border-zinc-900 pb-6 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      <span className="serif text-3xl font-bold text-zinc-300 dark:text-zinc-800 leading-none group-hover:text-rose-600 transition-colors">
                        0{idx + 1}
                      </span>
                      <div className="pt-1">
                        <Link 
                          to={`/category/${article.category?.toLowerCase() || ''}`}
                          className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 hover:text-rose-600 transition-colors mb-2"
                        >
                          {article.category}
                        </Link>
                        <Link to={`/article/${article.id}`} className="block">
                          <h3 className="serif text-xl font-bold dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4">
                            {article.title}
                          </h3>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {featured.length > 1 && (
              <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
                <Link to={`/article/${featured[1].id}`} className="group block mb-3">
                  <div className="aspect-[3/2] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-6 border border-zinc-200 dark:border-zinc-800">
                    <img 
                      src={featured[1].imageURL || 'https://picsum.photos/seed/sub/800/533'}
                      alt={featured[1].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </Link>
                <Link 
                  to={`/category/${featured[1].category?.toLowerCase() || ''}`}
                  className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 hover:text-rose-600 transition-colors mb-3"
                >
                  {featured[1].category}
                </Link>
                <Link to={`/article/${featured[1].id}`} className="group block">
                  <h3 className="serif text-2xl font-bold dark:text-white leading-tight group-hover:underline decoration-1 underline-offset-4 mb-3">
                    {featured[1].title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium line-clamp-2">
                    {truncate(featured[1].content, 120)}
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Regional Navigation / Fast Links */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-zinc-200 dark:border-zinc-800">
            {[
              { name: 'Hhohho', desc: 'Highlands & Capital' },
              { name: 'Manzini', desc: 'The Central Hub' },
              { name: 'Lubombo', desc: 'Eastern Plains' },
              { name: 'Shiselweni', desc: 'Southern Heart' }
            ].map(region => (
              <Link 
                key={region.name}
                to={`/region/${region.name.toLowerCase()}`}
                className="group p-6 border-b border-r border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="block text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-1.5">{region.name}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{region.desc}</span>
                </div>
                <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Latest News Grid */}
        <div className="mb-24">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-widest dark:text-white">Latest Dispatches</h2>
            <Link to="/nationwide" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-rose-600 transition-colors flex items-center gap-2">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 gap-y-16">
            {latest.slice(0, 8).map((article, idx) => (
               <div key={article.id} className="group flex flex-col h-full">
                 <Link to={`/article/${article.id}`} className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-5 border border-zinc-200 dark:border-zinc-800 focus:outline-none">
                   <img 
                     src={article.imageURL || `https://picsum.photos/seed/${article.id}/600/450`} 
                     alt={article.title}
                     className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                     referrerPolicy="no-referrer"
                   />
                 </Link>
                 <div className="flex items-center justify-between mb-3">
                   <Link 
                     to={`/category/${article.category?.toLowerCase() || ''}`}
                     className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 hover:text-rose-700 transition-colors"
                   >
                     {article.category}
                   </Link>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{formatDate(article.createdAt).split(',')[0]}</span>
                 </div>
                 <Link to={`/article/${article.id}`} className="flex flex-col flex-grow">
                   <h3 className="serif text-xl font-bold dark:text-zinc-100 leading-snug group-hover:underline decoration-1 underline-offset-4 mb-3">
                     {article.title}
                   </h3>
                   <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium line-clamp-3 mb-4 flex-grow">
                     {truncate(article.content, 120)}
                   </p>
                   <div className="mt-auto text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                     By {article.authorName}
                   </div>
                 </Link>
               </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

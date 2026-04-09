import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare, Heart, MapPin, ChevronRight, ArrowLeft, Bookmark } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_TINKHUNDLA } from '../constants';

export default function ConstituencyDetail() {
  const { constituencyName } = useParams<{ constituencyName: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
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
        const data = await newsService.getArticlesByConstituency(constituency);
        setArticles(data);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {articles.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-950/10 transition-all duration-500"
              >
                <Link to={`/article/${article.id}`} className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img 
                    src={article.imageURL || `https://picsum.photos/seed/${article.id}/600/400`} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-rose-600/20">
                      {article.category}
                    </span>
                  </div>
                </Link>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-rose-500" /> {formatDate(article.createdAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                    <span className="text-rose-600">{article.category}</span>
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

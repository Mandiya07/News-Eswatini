import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare, Heart, MapPin, ChevronRight, Filter, ArrowLeft, Bookmark, Loader2 } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export default function Category({ category: propCategory }: { category?: string }) {
  const { category: paramCategory } = useParams<{ category: string }>();
  const category = propCategory || paramCategory || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const { articles: newArticles, lastVisible: nextLastVisible } = await newsService.getLatestArticles(
        9, 
        category === 'nationwide' || category === 'constituency' ? undefined : category,
        isLoadMore ? lastVisible : undefined
      );

      // Filter if it's nationwide or constituency (mock logic for now)
      let filtered = newArticles;
      if (category === 'nationwide') {
        filtered = newArticles.filter(a => !a.region);
      } else if (category === 'constituency') {
        filtered = newArticles.filter(a => a.inkhundla);
      }
      
      if (isLoadMore) {
        setArticles(prev => [...prev, ...filtered]);
      } else {
        setArticles(filtered);
      }
      setLastVisible(nextLastVisible);
      setHasMore(newArticles.length === 9);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    window.scrollTo(0, 0);
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
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
            <span className="text-zinc-900 dark:text-zinc-100">{category}</span>
          </motion.div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter dark:text-white mb-4 leading-none">{category}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl font-medium text-lg">
                Stay updated with the latest {category} news and stories from across the Kingdom of Eswatini.
              </p>
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all dark:text-zinc-400"
            >
              <Filter size={16} /> Filter Results
            </motion.button>
          </div>
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
                    {article.region && (
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-rose-500" /> {article.region}</span>
                    )}
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

        {articles.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <p className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest text-xs">No articles found in this category yet.</p>
          </motion.div>
        )}

        {hasMore && articles.length > 0 && (
          <div className="mt-16 text-center">
            <button 
              onClick={() => fetchArticles(true)}
              disabled={loadingMore}
              className="px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-950/10 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {loadingMore ? <><Loader2 size={16} className="animate-spin" /> Loading...</> : 'Load More Articles'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

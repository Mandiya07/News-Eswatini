import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User as UserIcon, Calendar, BookOpen, Star, Twitter, Facebook, Instagram, Share2, ArrowLeft, ChevronRight, Globe, Film } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article, User } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export default function AuthorProfile() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!id) return;
      try {
        const authorData = await newsService.getAuthorById(id);
        const authorArticles = await newsService.getArticlesByAuthor(id);
        setAuthor(authorData);
        setArticles(authorArticles);
      } catch (error) {
        console.error('Error fetching author profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 px-4">
        <h1 className="text-4xl font-black mb-4 dark:text-white uppercase tracking-tighter">Author Not Found</h1>
        <Link to="/" className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 hover:scale-105 transition-transform">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen pb-24">
      {/* Header / Cover */}
      <div className="h-64 bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <Link to="/" className="absolute top-10 left-10 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 bg-zinc-950/40 backdrop-blur-md px-6 py-3 rounded-2xl hover:bg-rose-600 transition-colors">
            <ArrowLeft size={16} /> Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 mb-20 flex flex-col items-center text-center">
          {/* Profile Photo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-48 h-48 bg-white dark:bg-zinc-950 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden mb-8"
          >
            <div className="w-full h-full rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border-4 border-zinc-50 dark:border-zinc-900 overflow-hidden">
              {author.photoURL ? (
                <img src={author.photoURL} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={64} className="text-zinc-300" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl font-black dark:text-white uppercase tracking-tighter mb-4">{author.name}</h1>
            <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8">
              <span className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-5 py-2.5 rounded-full text-rose-600">{author.role}</span>
              <span className="flex items-center gap-2"><Calendar size={14} /> Joined {formatDate(author.createdAt)}</span>
              <span className="flex items-center gap-2"><BookOpen size={14} /> {articles.length} Stories</span>
              {author.reputationPoints && (
                <span className="flex items-center gap-2 text-amber-500"><Star size={14} fill="currentColor" /> {author.reputationPoints} Rep</span>
              )}
            </div>
            
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-10">
              {author.bio || `Senior contributor covering development, politics, and culture in ${author.constituency || 'Eswatini'}. Dedicated to providing local insights with global perspective.`}
            </p>

            {author.videoBio && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl mx-auto mb-12 aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 bg-black group relative"
              >
                <video 
                  src={author.videoBio} 
                  controls 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-10">
                  <Film size={12} /> Featured Video Bio
                </div>
              </motion.div>
            )}

            <div className="flex justify-center gap-4">
              {author.socials?.twitter && (
                <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all border border-zinc-100 dark:border-zinc-800">
                  <Twitter size={20} />
                </a>
              )}
              {author.socials?.facebook && (
                <a href={author.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all border border-zinc-100 dark:border-zinc-800">
                  <Facebook size={20} />
                </a>
              )}
              {author.socials?.instagram && (
                <a href={author.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#E4405F] hover:bg-[#E4405F]/10 transition-all border border-zinc-100 dark:border-zinc-800">
                  <Instagram size={20} />
                </a>
              )}
              {author.socials?.website && (
                <a href={author.socials.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-zinc-100 dark:border-zinc-800">
                  <Globe size={20} />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-4">
              Published Work
              <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-900"></div>
            </h2>

            <div className="space-y-12">
              {articles.map((article, idx) => (
                <motion.article 
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <Link to={`/article/${article.id}`} className="md:col-span-4 aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-lg shadow-zinc-950/5 focus:outline-none">
                      <img 
                        src={article.imageURL || `https://picsum.photos/seed/${article.id}/600/400`} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <div className="md:col-span-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <Link 
                          to={`/category/${article.category?.toLowerCase() || ''}`}
                          className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest transition-colors"
                        >
                          {article.category}
                        </Link>
                        <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800"></span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatDate(article.createdAt)}</span>
                      </div>
                      <Link to={`/article/${article.id}`}>
                        <h3 className="text-2xl font-black dark:text-white mb-4 group-hover:text-rose-600 transition-colors leading-tight tracking-tight uppercase">
                          {article.title}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 mb-6">
                          {article.content.replace(/[#*`]/g, '').substring(0, 150)}...
                        </p>
                      </Link>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <span className="flex items-center gap-1.5"><Share2 size={12} /> {article.views || 0} Views</span>
                        <span className="flex items-center gap-1.5"><BookOpen size={12} /> 8 min read</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}

              {articles.length === 0 && (
                <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  <BookOpen size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-6" />
                  <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No published stories yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 sticky top-32">
              <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-6">Author Stats</h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Impact</p>
                    <p className="text-2xl font-black dark:text-white">{(author.totalViews || 0).toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600">
                    <Share2 size={24} />
                  </div>
                </div>
                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Reputation</p>
                    <p className="text-2xl font-black dark:text-white">{(author.reputationPoints || 0).toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500">
                    <Star size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800"></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Constituency</p>
                  <Link to={`/constituency/${author.constituency}`} className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-rose-600 transition-all group">
                    <span className="text-xs font-black uppercase tracking-widest dark:text-white">{author.constituency || 'National'}</span>
                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-rose-600 transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, MessageSquare, Heart, Share2, Bookmark, Facebook, Twitter, Link as LinkIcon, ChevronRight, ArrowLeft, MessageCircle, Check } from 'lucide-react';
import { newsService } from '../services/newsService';
import { Article, Comment } from '../types';
import { formatDate, truncate, cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareTitle = article?.title || 'Check out this story on Eswatini News';

  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleShare('copy');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const articleData = await newsService.getArticleById(id);
        if (articleData) {
          setArticle(articleData);
          const commentsData = await newsService.getComments(id);
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = {
        articleId: id!,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhoto: auth.currentUser.photoURL || undefined,
        content: newComment
      };
      await newsService.addComment(id!, commentData);
      setNewComment('');
      const updatedComments = await newsService.getComments(id!);
      setComments(updatedComments);
      toast.success('Comment posted successfully');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 px-4">
        <h1 className="text-4xl font-black mb-4 dark:text-white uppercase tracking-tighter">Article Not Found</h1>
        <p className="text-zinc-500 mb-8 font-medium">The story you are looking for might have been moved or deleted.</p>
        <Link to="/" className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 hover:scale-105 transition-transform">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen pb-24">
      {/* Progress Bar */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="fixed top-0 left-0 right-0 h-1 bg-rose-600 origin-left z-50"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Sidebar: Sticky Actions */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col items-center gap-6">
              <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group">
                <Heart size={24} className="group-active:scale-125 transition-transform" />
                <span className="text-[10px] font-black mt-1 block text-center">{article.likes || 0}</span>
              </button>
              <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                <MessageSquare size={24} />
                <span className="text-[10px] font-black mt-1 block text-center">{comments.length}</span>
              </button>
              <div className="w-px h-12 bg-zinc-100 dark:bg-zinc-800 my-2"></div>
              <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all" title="Bookmark Story">
                <Bookmark size={24} />
              </button>
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all"
                  title="Share on Facebook"
                >
                  <Facebook size={24} />
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all"
                  title="Share on Twitter"
                >
                  <Twitter size={24} />
                </button>
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all"
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={24} />
                </button>
                <button 
                  onClick={() => handleShare('copy')}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  title="Copy Link"
                >
                  {copied ? <Check size={24} className="text-emerald-500" /> : <LinkIcon size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Breadcrumbs */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-10"
            >
              <Link to="/" className="hover:text-rose-600 flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
              <ChevronRight size={10} />
              <Link to={`/category/${article.category.toLowerCase()}`} className="hover:text-rose-600">{article.category}</Link>
              <ChevronRight size={10} />
              <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">{article.title}</span>
            </motion.div>

            {/* Header */}
            <header className="mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 mb-8"
              >
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg shadow-rose-600/20">{article.category}</span>
                {article.region && (
                  <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">{article.region}</span>
                )}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-black leading-[1.1] mb-10 dark:text-white tracking-tighter"
              >
                {article.title}
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-between gap-8 py-8 border-y border-zinc-100 dark:border-zinc-900"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <User size={28} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white uppercase tracking-tight">By {article.authorName}</p>
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-rose-500" /> {formatDate(article.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                      <span>5 min read</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#1877F2] transition-colors border border-zinc-100 dark:border-zinc-800"
                  >
                    <Facebook size={18} />
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#1DA1F2] transition-colors border border-zinc-100 dark:border-zinc-800"
                  >
                    <Twitter size={18} />
                  </button>
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#25D366] transition-colors border border-zinc-100 dark:border-zinc-800"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button 
                    onClick={() => handleShare('copy')}
                    className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-rose-600 transition-colors border border-zinc-100 dark:border-zinc-800"
                  >
                    {copied ? <Check size={18} className="text-emerald-500" /> : <LinkIcon size={18} />}
                  </button>
                </div>
              </motion.div>
            </header>

            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-16 shadow-2xl shadow-zinc-950/20"
            >
              <img 
                src={article.imageURL || `https://picsum.photos/seed/${article.id}/1200/800`} 
                alt={article.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Content */}
            <article className="prose prose-xl dark:prose-invert max-w-none mb-20 font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
              <div className="markdown-body">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </article>

            {/* Tags/Keywords */}
            <div className="flex flex-wrap gap-3 mb-20">
              {['Eswatini', article.category, article.region || 'National', 'News'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-rose-600 hover:text-rose-600 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Engagement Mobile */}
            <div className="lg:hidden flex items-center justify-between py-8 border-y border-zinc-100 dark:border-zinc-900 mb-16">
              <div className="flex items-center gap-8">
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-rose-600 transition-colors">
                  <Heart size={20} /> {article.likes || 0}
                </button>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-rose-600 transition-colors">
                  <MessageSquare size={20} /> {comments.length}
                </button>
              </div>
              <button 
                onClick={handleNativeShare}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-rose-600 transition-colors"
              >
                <Share2 size={20} /> Share
              </button>
            </div>

            {/* Comments Section */}
            <section className="space-y-16 pt-10">
              <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-white pb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter dark:text-white">The Discussion ({comments.length})</h2>
              </div>
              
              {/* Comment Form */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {auth.currentUser?.photoURL ? (
                        <img src={auth.currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-zinc-400" />
                      )}
                    </div>
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={auth.currentUser ? "Share your thoughts on this story..." : "Sign in to join the conversation"}
                      disabled={!auth.currentUser || submitting}
                      className="flex-1 bg-transparent border-none p-0 min-h-[100px] focus:ring-0 outline-none dark:text-white disabled:opacity-50 font-medium placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      type="submit"
                      disabled={!auth.currentUser || submitting || !newComment.trim()}
                      className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Comment List */}
              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {comments.map((comment, idx) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-6 group"
                    >
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        {comment.userPhoto ? (
                          <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black dark:text-white uppercase tracking-tight">{comment.userName}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-6 pt-2">
                          <button className="text-[10px] font-black text-zinc-400 hover:text-rose-600 uppercase tracking-widest transition-colors">Reply</button>
                          <button className="text-[10px] font-black text-zinc-400 hover:text-rose-600 uppercase tracking-widest transition-colors">Like</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {comments.length === 0 && (
                  <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <MessageSquare size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">No comments yet. Be the first to join the conversation!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Recommended & Ads */}
          <div className="lg:col-span-3 space-y-16">
            <section>
              <h3 className="text-xl font-black uppercase tracking-tighter border-b-2 border-zinc-950 dark:border-white pb-4 mb-8 dark:text-white">Related Stories</h3>
              <div className="space-y-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 mb-4 shadow-lg shadow-zinc-950/5">
                      <img src={`https://picsum.photos/seed/rec${i}/400/250`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em]">National</span>
                      <h4 className="text-sm font-black dark:text-white leading-snug group-hover:text-rose-600 transition-colors line-clamp-2">
                        More news from the {article.category} category in Eswatini
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">5 min read</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Ad Placement */}
            <div className="sticky top-32 aspect-[4/5] bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
              <Share2 size={24} className="text-zinc-300 mb-4" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Advertisement</span>
              <p className="text-xs text-zinc-500 font-medium">Support local journalism by advertising with us.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

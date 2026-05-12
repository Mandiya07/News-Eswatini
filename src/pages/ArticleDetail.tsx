import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, MessageSquare, Heart, Share2, Bookmark, Facebook, Twitter, Link as LinkIcon, ChevronRight, ArrowLeft, MessageCircle, Check, Shield, Phone } from 'lucide-react';
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState('20');
  const [tipPhone, setTipPhone] = useState('');
  const [isProcessingTip, setIsProcessingTip] = useState(false);

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipPhone || !tipAmount) return;
    setIsProcessingTip(true);
    // Simulate Mobile Money request
    setTimeout(() => {
      setIsProcessingTip(false);
      setIsTipModalOpen(false);
      toast.success(`Thank you! Your SZL ${tipAmount} tip has been sent to ${article?.authorName}.`);
    }, 2000);
  };

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

  const handleLikeComment = async (commentId: string, likedBy: string[] = []) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to like comments');
      return;
    }
    const userId = auth.currentUser.uid;
    const isLiking = !likedBy.includes(userId);
    
    try {
      await newsService.likeComment(id!, commentId, userId, isLiking);
      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          const newLikedBy = isLiking 
            ? [...(c.likedBy || []), userId]
            : (c.likedBy || []).filter(id => id !== userId);
          return {
            ...c,
            likes: (c.likes || 0) + (isLiking ? 1 : -1),
            likedBy: newLikedBy
          };
        }
        return c;
      }));
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to reply');
      return;
    }
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const replyData = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhoto: auth.currentUser.photoURL || undefined,
        content: replyContent
      };
      await newsService.addReply(id!, parentId, replyData);
      setReplyContent('');
      setReplyingTo(null);
      // Refresh comments
      const updatedComments = await newsService.getComments(id!);
      setComments(updatedComments);
      toast.success('Reply posted successfully');
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Build comment tree
  const buildCommentTree = (flatComments: Comment[]) => {
    const commentMap: { [key: string]: Comment & { children: Comment[] } } = {};
    const rootComments: (Comment & { children: Comment[] })[] = [];

    // First pass: create map
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, children: [] };
    });

    // Second pass: build tree
    flatComments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].children.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment & { children: Comment[] }, depth?: number }) => (
    <div className={cn("space-y-4", depth > 0 ? "mt-6 pl-6 border-l w-full border-zinc-200 dark:border-zinc-800" : "")}>
      <div className="flex gap-4 group">
        <div className={cn("bg-zinc-100 dark:bg-zinc-900 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800", depth > 0 ? "w-8 h-8" : "w-10 h-10")}>
          {comment.userPhoto ? (
            <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
          ) : (
            <User size={depth > 0 ? 16 : 20} className="text-zinc-400" />
          )}
        </div>
        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={cn("font-bold dark:text-white uppercase tracking-tight", depth > 0 ? "text-xs" : "text-sm")}>{comment.userName}</span>
            <span className={cn("text-zinc-500 font-bold uppercase tracking-widest", depth > 0 ? "text-[8px]" : "text-[10px]")}>{formatDate(comment.createdAt)}</span>
          </div>
          <p className={cn("text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium", depth > 0 ? "text-sm" : "text-base")}>
            {comment.content}
          </p>
          <div className="flex items-center gap-6 pt-2">
            <button 
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5"
            >
              <MessageSquare size={14} /> Reply
            </button>
            <button 
              onClick={() => handleLikeComment(comment.id, comment.likedBy)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5",
                comment.likedBy?.includes(auth.currentUser?.uid || '') 
                  ? "text-rose-600" 
                  : "text-zinc-500 hover:text-rose-600"
              )}
            >
              <Heart size={14} fill={comment.likedBy?.includes(auth.currentUser?.uid || '') ? "currentColor" : "none"} /> 
              {comment.likes || 0} Likes
            </button>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50"
              >
                <div className="flex gap-4">
                  <div className="flex-1 space-y-4">
                    <textarea 
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.userName}...`}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none dark:text-white min-h-[60px] text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <button 
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {submitting ? '...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render Children (Recursive) */}
          {comment.children.length > 0 && (
            <div className="space-y-4">
              {comment.children.map(child => (
                <CommentItem key={child.id} comment={child as any} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
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
        style={{ transformOrigin: 'left' }}
        className="fixed top-0 left-0 right-0 h-1 bg-rose-600 z-50"
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-20">
        
        {/* Full Header Section */}
        <header className="mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-12">
          {/* Breadcrumbs */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8"
          >
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <Link to={`/category/${article.category.toLowerCase()}`} className="hover:text-rose-600 transition-colors">{article.category}</Link>
            {article.isGovernmentNotice && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20">
                  <Shield size={10} /> Official Government Notice
                </span>
              </>
            )}
            {article.contentLabel && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                article.contentLabel === 'Independent' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                article.contentLabel === 'Sponsored' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                {article.contentLabel}
              </span>
            )}
            {article.region && (
               <>
                 <span className="text-zinc-300 dark:text-zinc-700">/</span>
                 <span>{article.region}</span>
               </>
            )}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-8 dark:text-white max-w-5xl"
          >
            {article.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-center gap-4">
              <Link to={`/author/${article.authorId}`} className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800">
                {article.authorPhoto ? (
                  <img src={article.authorPhoto} alt={article.authorName} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-zinc-400" />
                )}
              </Link>
              <div>
                <Link to={`/author/${article.authorId}`} className="block text-sm font-black dark:text-white uppercase tracking-tight hover:text-rose-600 transition-colors">By {article.authorName}</Link>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                  <span>{formatDate(article.createdAt)}</span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span>5 Min Read</span>
                </div>
              </div>
              {/* Tip Jar Feature */}
              {article.authorId !== auth.currentUser?.uid && (
                <div className="ml-4 border-l pl-4 border-zinc-200 dark:border-zinc-800">
                  <button 
                    onClick={() => setIsTipModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <Heart size={14} /> Tip Author
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handleShare('facebook')} className="p-3 text-zinc-400 hover:text-[#1877F2] transition-colors border-l border-zinc-200 dark:border-zinc-800" title="Share on Facebook"><Facebook size={18} /></button>
              <button onClick={() => handleShare('twitter')} className="p-3 text-zinc-400 hover:text-[#1DA1F2] transition-colors border-l border-zinc-200 dark:border-zinc-800" title="Share on Twitter"><Twitter size={18} /></button>
              <button onClick={() => handleShare('whatsapp')} className="p-3 text-zinc-400 hover:text-[#25D366] transition-colors border-l border-zinc-200 dark:border-zinc-800" title="Share on WhatsApp"><MessageCircle size={18} /></button>
              <button onClick={() => handleShare('copy')} className="p-3 text-zinc-400 hover:text-rose-600 transition-colors border-l border-zinc-200 dark:border-zinc-800" title="Copy Link">{copied ? <Check size={18} className="text-emerald-500" /> : <LinkIcon size={18} />}</button>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {/* Main Article Media (Video or Image) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-16 border border-zinc-200 dark:border-zinc-800 rounded-px sm:rounded-2xl shadow-2xl shadow-rose-600/5 group"
            >
              {article.videoURL ? (
                <video 
                  src={article.videoURL} 
                  controls 
                  className="w-full h-full object-contain bg-black"
                  poster={article.imageURL}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={article.imageURL || `https://picsum.photos/seed/${article.id}/1200/675`} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
                  referrerPolicy="no-referrer"
                />
              )}
              
              {/* Optional dynamic overlay if it's a video */}
              {article.videoURL && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Video Report
                  </span>
                </div>
              )}
            </motion.div>

            {/* Markdown Content */}
            <article className="font-sans prose prose-lg md:prose-xl dark:prose-invert max-w-none mb-16 leading-relaxed text-zinc-800 dark:text-zinc-200 selection:bg-rose-100 dark:selection:bg-rose-900/30">
              <div className="markdown-body">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </article>

            {/* Bottom Tip Author Banner */}
            {article.authorId !== auth.currentUser?.uid && (
              <div className="mb-16 bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-2 flex items-center justify-center sm:justify-start gap-2">
                    <Heart size={20} className="text-emerald-500" fill="currentColor" /> Support {article.authorName}
                  </h3>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    If you enjoyed this article, consider tipping the author directly. 90% of your tip goes to the journalist.
                  </p>
                </div>
                <button 
                  onClick={() => setIsTipModalOpen(true)}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-600/20 whitespace-nowrap"
                >
                  Tip Journalist
                </button>
              </div>
            )}

            {/* Tags/Keywords */}
            <div className="flex flex-wrap gap-2 mb-20 border-t border-zinc-200 dark:border-zinc-800 pt-8">
              {['Eswatini', article.category, article.region || 'National', 'News'].map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 hover:border-rose-600 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>

            {/* Comments Section */}
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b-2 border-zinc-900 dark:border-white pb-4">
                <h2 className="text-2xl font-black uppercase tracking-widest dark:text-white">Discussion ({comments.length})</h2>
              </div>
              
              {/* Comment Form */}
              <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 border border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-300 dark:border-zinc-700">
                      {auth.currentUser?.photoURL ? (
                        <img src={auth.currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-zinc-400" />
                      )}
                    </div>
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={auth.currentUser ? "Add to the discussion..." : "Sign in to join the conversation"}
                      disabled={!auth.currentUser || submitting}
                      className="flex-1 bg-transparent border-none p-0 min-h-[80px] focus:ring-0 outline-none dark:text-white disabled:opacity-50 font-medium placeholder:text-zinc-400 text-lg"
                    />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      type="submit"
                      disabled={!auth.currentUser || submitting || !newComment.trim()}
                      className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>              {/* Comment List */}
              <div className="space-y-10 border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <AnimatePresence mode="popLayout">
                  {commentTree.map((comment, idx) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <CommentItem comment={comment} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {comments.length === 0 && (
                  <div className="text-center py-16 text-zinc-400">
                    <p className="font-bold uppercase tracking-widest text-xs">No comments to display.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Recommended */}
          <div className="lg:col-span-4 space-y-12">
            <section className="bg-zinc-50 dark:bg-zinc-900/30 p-8 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 dark:text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div> Up Next
              </h3>
              <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group cursor-pointer border-b border-zinc-200 dark:border-zinc-800 pb-8 last:border-0 last:pb-0">
                    <div className="aspect-[3/2] overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-4 border border-zinc-200 dark:border-zinc-800">
                      <img src={`https://picsum.photos/seed/n${i}/400/266`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                    <div className="space-y-2">
                      <Link 
                        to={`/category/${article.category?.toLowerCase() || ''}`}
                        className="inline-block text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-[0.2em] transition-colors"
                      >
                        {article.category}
                      </Link>
                      <h4 className="serif text-xl font-bold dark:text-white leading-snug group-hover:underline decoration-1 underline-offset-4 line-clamp-3">
                        More analysis falling under the {article.category} banner in Eswatini
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isTipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsTipModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 relative z-10 shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={32} />
                </div>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-2">Tip Journalist</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                  Support {article?.authorName}'s independent journalism. 90% goes directly to the author, 10% platform fee.
                </p>
              </div>

              <form onSubmit={handleTipSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 block mb-2">Select Amount (SZL)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['20', '50', '100', '200'].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setTipAmount(amount)}
                        className={`py-3 rounded-2xl font-black text-sm transition-all ${tipAmount === amount ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'}`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Mobile Money Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="tel" 
                      value={tipPhone}
                      onChange={e => setTipPhone(e.target.value)}
                      placeholder="e.g. 7600 0000"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-emerald-600 font-medium dark:text-white mb-2"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isProcessingTip}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
                >
                  {isProcessingTip ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</>
                  ) : (
                    `Tip SZL ${tipAmount}`
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

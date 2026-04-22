import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowLeft, Save, Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

import MediaUpload from '../components/MediaUpload';

export default function NewArticle() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'News',
    region: '',
    status: 'draft',
    imageURL: '',
    videoURL: ''
  });

  const categories = ['News', 'Politics', 'Sports', 'Business', 'Health', 'Education', 'Community'];
  const regions = ['Hhohho', 'Lubombo', 'Manzini', 'Shiselweni', 'National'];

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);
    
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newText = before + prefix + selectedText + suffix + after;
    setFormData({ ...formData, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        ...formData,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Unknown Author',
        authorPhoto: auth.currentUser?.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        likes: 0,
        commentsCount: 0,
        featured: false,
        breaking: false
      };

      await addDoc(collection(db, 'articles'), articleData);
      toast.success('Article created successfully!');
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      handleFirestoreError(error, OperationType.CREATE, 'articles');
      toast.error('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/articles')}
            className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Create New Article</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 sm:p-12 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Article Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a compelling title"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 transition-all dark:text-white font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 transition-all dark:text-white font-medium"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Region</label>
              <select 
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 transition-all dark:text-white font-medium"
              >
                <option value="">Select a region (Optional)</option>
                {regions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MediaUpload 
              label="Cover Image"
              accept="image"
              onUploadComplete={(url) => setFormData({ ...formData, imageURL: url })}
            />
            <MediaUpload 
              label="Video Report (Optional)"
              accept="video"
              onUploadComplete={(url) => setFormData({ ...formData, videoURL: url })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Manual Image URL (Optional)</label>
            <input 
              type="url" 
              value={formData.imageURL}
              onChange={e => setFormData({ ...formData, imageURL: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 transition-all dark:text-white font-medium"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Content (Markdown Supported)</label>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => insertMarkdown('**', '**')} 
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-rose-600 transition-all"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown('*', '*')} 
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-rose-600 transition-all"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown('\n- ', '')} 
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-rose-600 transition-all"
                  title="List"
                >
                  <List size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown('\n1. ', '')} 
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-rose-600 transition-all"
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertMarkdown('[', '](url)')} 
                  className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-rose-600 transition-all"
                  title="Link"
                >
                  <LinkIcon size={16} />
                </button>
              </div>
            </div>
            <textarea 
              ref={textareaRef}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here..."
              className="w-full min-h-[400px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 transition-all dark:text-white font-medium resize-y"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 transition-all dark:text-white font-medium"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

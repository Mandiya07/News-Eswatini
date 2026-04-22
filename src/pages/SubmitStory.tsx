import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, Upload, Info, CheckCircle, Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { newsService } from '../services/newsService';
import { toast } from 'sonner';
import { TINKHUNDLA_DATA } from '../constants';

import MediaUpload from '../components/MediaUpload';

export default function SubmitStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [constituency, setConstituency] = useState('');
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const before = content.substring(0, start);
    const after = content.substring(end);
    
    const newText = before + prefix + selectedText + suffix + after;
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await newsService.submitStory({
        title,
        content,
        submitterName: name,
        submitterEmail: email,
        constituency,
        imageURL: media?.type === 'image' ? media.url : undefined,
        videoURL: media?.type === 'video' ? media.url : undefined
      });
      setSubmitted(true);
      toast.success('Story submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black dark:text-white">Thank You!</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Your story has been submitted for review. Our editorial team will look into it and contact you if we need more information.
          </p>
          <Link to="/" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-rose-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter dark:text-white">Submit a Story</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Become a citizen journalist. Share news, events, or stories from your community with the rest of Eswatini.
          </p>
        </header>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 md:p-12 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white font-medium"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Constituency</label>
              <select
                required
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white font-medium"
              >
                <option value="">Select a constituency</option>
                {Object.entries(TINKHUNDLA_DATA).map(([region, tinkhundlaList]) => (
                  <optgroup key={region} label={region}>
                    {tinkhundlaList.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Story Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white font-medium"
                placeholder="What is the story about?"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Story Content</label>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('**', '**')} 
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-rose-600 transition-all"
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('*', '*')} 
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-rose-600 transition-all"
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('\n- ', '')} 
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-rose-600 transition-all"
                    title="List"
                  >
                    <List size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('\n1. ', '')} 
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-rose-600 transition-all"
                    title="Numbered List"
                  >
                    <ListOrdered size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertMarkdown('[', '](url)')} 
                    className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-rose-600 transition-all"
                    title="Link"
                  >
                    <LinkIcon size={14} />
                  </button>
                </div>
              </div>
              <textarea 
                ref={textareaRef}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 min-h-[300px] text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white font-medium resize-y"
                placeholder="Tell us the details..."
              />
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl flex gap-4 border border-rose-100 dark:border-rose-800">
              <Info className="text-rose-600 flex-shrink-0" size={24} />
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tight text-rose-900 dark:text-rose-200">Editorial Guidelines</p>
                <p className="text-[11px] text-rose-800/70 dark:text-rose-300/70 leading-relaxed font-medium">
                  All submissions are reviewed by our editors. We prioritize stories that are factual, relevant to Eswatini, and include verifiable details.
                </p>
              </div>
            </div>

            <MediaUpload 
              label="Evidence (Image or Video)"
              onUploadComplete={(url, type) => setMedia({ url, type })}
              className="mt-4"
            />

            <div className="flex items-center justify-end pt-4">
              <button 
                type="submit"
                disabled={submitting}
                className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all flex items-center gap-3 disabled:opacity-50 shadow-lg shadow-rose-600/20"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    Submit Story <Send size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

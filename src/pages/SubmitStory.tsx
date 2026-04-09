import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Upload, Info, CheckCircle } from 'lucide-react';
import { newsService } from '../services/newsService';
import { toast } from 'sonner';
import { TINKHUNDLA_DATA, ALL_TINKHUNDLA } from '../constants';

export default function SubmitStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [constituency, setConstituency] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await newsService.submitStory({
        title,
        content,
        submitterName: name,
        submitterEmail: email,
        constituency
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
          <Link to="/" className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
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

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 md:p-12 border border-zinc-100 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Constituency</label>
              <select
                required
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none dark:text-white"
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
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Story Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none dark:text-white"
                placeholder="What is the story about?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Story Content</label>
              <textarea 
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-4 min-h-[250px] text-sm focus:ring-2 focus:ring-red-600 outline-none dark:text-white"
                placeholder="Tell us the details..."
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl flex gap-4 border border-blue-100 dark:border-blue-800">
              <Info className="text-blue-600 flex-shrink-0" size={24} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Editorial Guidelines</p>
                <p className="text-xs text-blue-800/70 dark:text-blue-300/70 leading-relaxed">
                  All submissions are reviewed by our editors. We prioritize stories that are factual, relevant to Eswatini, and include verifiable details. We do not publish hate speech or unverified rumors.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button type="button" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Upload size={18} /> Attach Media
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-3 disabled:opacity-50"
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

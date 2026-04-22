import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsService } from '../services/newsService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, CalendarPlus, MapPin, Users, AlignLeft, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { TINKHUNDLA_DATA } from '../constants';
import { EventType } from '../types';

export default function SubmitEvent() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'meeting' as EventType,
    date: '',
    location: '',
    region: 'Hhohho',
    constituency: ''
  });

  const regions = Object.keys(TINKHUNDLA_DATA);
  const constituencies = TINKHUNDLA_DATA[formData.region as keyof typeof TINKHUNDLA_DATA] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to submit an event');
      return;
    }

    setLoading(true);
    try {
      await newsService.submitEvent({
        ...formData,
        date: new Date(formData.date),
        submitterId: user.uid,
        submitterName: userData?.name || user.displayName || 'Anonymous User',
      });
      setSuccess(true);
    } catch (error) {
      toast.error('Failed to submit event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'meeting': return Users;
      case 'announcement': return Send;
      default: return CalendarPlus;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-rose-600 transition-colors text-xs font-black uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[3rem] p-12 text-center shadow-xl shadow-zinc-200/20 dark:shadow-none border border-zinc-100 dark:border-zinc-800"
            >
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 dark:text-white">Event Submitted!</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-10 max-w-sm mx-auto">
                Thank you for contributing. Your event has been sent to our editors for review and will be published shortly.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
              >
                Return Home
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 sm:p-12 shadow-xl shadow-zinc-200/20 dark:shadow-none border border-zinc-100 dark:border-zinc-800"
            >
              <div className="mb-12">
                <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white mb-4">Add Event</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Share community meetings, funerals, announcements, or celebrations with the nation. Let the people know what's happening.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Event Type Grid */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Event Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(['funeral', 'meeting', 'announcement', 'celebration', 'other'] as EventType[]).map((type) => {
                      const Icon = getEventTypeIcon(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, eventType: type })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
                            formData.eventType === type
                              ? "border-rose-600 bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                              : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700"
                          )}
                        >
                          <Icon size={24} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Title / Name</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g. Community Water Meeting"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 dark:text-white font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Specific Location</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="e.g. Chief's Kraal"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Region</label>
                    <select 
                      value={formData.region}
                      onChange={e => setFormData({ ...formData, region: e.target.value, constituency: '' })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 dark:text-white font-medium"
                    >
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Constituency (Inkhundla)</label>
                    <select 
                      value={formData.constituency}
                      onChange={e => setFormData({ ...formData, constituency: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 dark:text-white font-medium"
                    >
                      <option value="">Select Constituency</option>
                      {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <AlignLeft size={14} /> Description & Details
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Provide full details, agenda, or background information..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rose-600 dark:text-white font-medium min-h-[150px] resize-y"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20"
                  >
                    {loading ? 'Submitting...' : <><Send size={18} /> Submit Event</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

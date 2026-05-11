import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Trophy, MapPin, Clock, ArrowRight, CheckCircle2, AlertCircle, Coins } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Bounty } from '../types';
import { motion } from 'motion/react';

export default function BountyBoard() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const q = query(
          collection(db, 'bounties'),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Bounty));
        setBounties(docs);
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBounties();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          <div className="relative z-10 text-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-max mx-auto mb-8 shadow-xl shadow-amber-500/10 border border-amber-200 dark:border-amber-800"
            >
              The Bounty Board
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black dark:text-white uppercase tracking-tighter mb-6 leading-[0.9]">
              Report News. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600">Get Paid.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed mb-12">
              Citizen Journalism is the heartbeat of Eswatini. Editors post bounties for specific stories—submit your report, get approved, and earn SZL directly to your Mobile Money.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="bg-white dark:bg-zinc-900 h-40 rounded-[2.5rem] animate-pulse"></div>
             ))}
          </div>
        ) : bounties.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-20 text-center border border-zinc-100 dark:border-zinc-800 shadow-xl">
             <Trophy size={64} className="text-zinc-200 dark:text-zinc-800 mx-auto mb-8" />
             <h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-4">No Active Bounties</h3>
             <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-10 max-w-md mx-auto">All current reporting assignments have been filled. Check back soon for new opportunities in your constituency.</p>
             <Link to="/submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">Submit General News</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bounties.map(bounty => (
              <motion.div 
                key={bounty.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors rounded-bl-[5rem]"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5">
                      <Coins size={12} /> SZL {bounty.reward}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                      <Clock size={12} /> {formatDate(bounty.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-4 pr-10">{bounty.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                    {bounty.description}
                  </p>

                  <div className="flex flex-wrap gap-4 items-center justify-between mt-auto pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-300">
                      <MapPin size={14} className="text-rose-500" />
                      {bounty.constituency}
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/submit?bountyId=${bounty.id}`)}
                      className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white dark:hover:text-zinc-900 transition-colors shadow-lg active:scale-95"
                    >
                      Claim Bounty <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-200 dark:border-zinc-800 pt-20">
           <div>
             <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <AlertCircle size={24} />
             </div>
             <h4 className="text-sm font-black uppercase tracking-widest dark:text-white mb-2">1. Find a Need</h4>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">Browse active bounties for events or stories that need coverage in your local community.</p>
           </div>
           <div>
             <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={24} />
             </div>
             <h4 className="text-sm font-black uppercase tracking-widest dark:text-white mb-2">2. Submit Quality</h4>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">Provide high-quality photos and factual reporting. Submissions are reviewed by our editors.</p>
           </div>
           <div>
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Coins size={24} />
             </div>
             <h4 className="text-sm font-black uppercase tracking-widest dark:text-white mb-2">3. Earn SZL</h4>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">Once approved, the bounty reward is paid out directly to your account. Rep points are also earned.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

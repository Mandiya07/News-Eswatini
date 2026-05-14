import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Megaphone, Plus, MapPin, Tag, Phone } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { ALL_TINKHUNDLA } from '../constants';

export default function Classifieds() {
  const [classifieds, setClassifieds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchClassifieds = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'classifieds'),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        if (selectedConstituency) {
          docs = docs.filter((d: any) => d.constituency === selectedConstituency);
        }
        if (selectedCategory) {
          docs = docs.filter((d: any) => d.category === selectedCategory);
        }

        setClassifieds(docs);
      } catch (error) {
        console.error('Error fetching classifieds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassifieds();
  }, [selectedConstituency, selectedCategory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black dark:text-white uppercase tracking-tighter mb-4 leading-none">Local <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">Classifieds</span></h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl font-medium text-lg leading-relaxed">
              Community noticeboard for obituaries, lost & found, items for sale, and local services in your area.
            </p>
          </div>
          <Link 
            to="/submit/classified"
            className="bg-rose-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 flex items-center gap-2"
          >
            <Plus size={16} /> Post an Ad
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-4 mb-8">
          <select 
            value={selectedConstituency}
            onChange={e => setSelectedConstituency(e.target.value)}
            className="flex-1 min-w-[200px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white text-sm"
          >
            <option value="">All Constituencies</option>
            {ALL_TINKHUNDLA.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="flex-1 min-w-[200px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-rose-600 font-medium dark:text-white text-sm"
          >
            <option value="">All Categories</option>
            <option value="For Sale">For Sale</option>
            <option value="Lost & Found">Lost & Found</option>
            <option value="Obituary">Obituary</option>
            <option value="Services">Services / Jobs</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-[2rem] h-64 border border-zinc-100 dark:border-zinc-800"></div>
            ))}
          </div>
        ) : classifieds.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-16 text-center border border-zinc-100 dark:border-zinc-800">
            <Megaphone size={48} className="text-zinc-300 dark:text-zinc-700 mx-auto mb-6" />
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-2">No Classifieds Found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">Be the first to post a classified in this area.</p>
            <Link 
              to="/submit/classified"
              className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Post Ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classifieds.map(ad => (
              <div key={ad.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col h-full hover:shadow-xl transition-shadow relative">
                <span className="absolute -top-3 -right-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest shadow-lg z-10">
                  {ad.category}
                </span>

                {ad.imageURL && (
                  <div className="aspect-[16/9] mb-4 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 -mx-1 -mt-1">
                    <img 
                      src={ad.imageURL} 
                      alt={ad.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                <h3 className="text-lg font-bold dark:text-white mb-2 line-clamp-2 mt-2">{ad.title}</h3>
                
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {ad.constituency}</span>
                  <span>•</span>
                  <span>{formatDate(ad.createdAt)}</span>
                </div>
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium mb-6 flex-1 whitespace-pre-wrap line-clamp-4">
                  {ad.description}
                </p>

                <div className="mt-auto space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  {ad.price && (
                    <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                      <Tag size={14} /> <span>{ad.price}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold text-sm bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl">
                    <Phone size={14} className="text-zinc-400" />
                    <span>{ad.contactInfo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

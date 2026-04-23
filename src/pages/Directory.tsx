import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, Building2, Phone, Mail, Filter, Store, Wrench, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import { newsService } from '../services/newsService';
import { ServiceBusiness } from '../types';
import { ALL_TINKHUNDLA } from '../constants';

const BUSINESS_CATEGORIES = [
  'Agriculture & Farming',
  'Construction & Properties',
  'Education & Tutors',
  'Health & Clinics',
  'Legal & Financial',
  'Retail & Shops',
  'Transport & Logistics',
  'Other Services',
];

export default function Directory() {
  const [businesses, setBusinesses] = useState<ServiceBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('all');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const data = await newsService.getBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error('Error fetching directory:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
    window.scrollTo(0, 0);
  }, []);

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesConstituency = selectedConstituency === 'all' || b.locations.some(loc => loc.constituency === selectedConstituency);
    return matchesSearch && matchesCategory && matchesConstituency;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest mb-6">
              <Store size={14} /> Support Local
            </span>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter dark:text-white mb-6">
              Local Services <br className="hidden md:block"/> Directory
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg mb-8 leading-relaxed">
              Find and support trusted businesses, tradespeople, and services in your constituency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register-business" 
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                List Your Business
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search services, businesses, keywords..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all"
              />
            </div>
            <div className="md:col-span-3">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white appearance-none"
              >
                <option value="all">All Categories</option>
                {BUSINESS_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <select 
                value={selectedConstituency}
                onChange={(e) => setSelectedConstituency(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white appearance-none"
              >
                <option value="all">Everywhere</option>
                {ALL_TINKHUNDLA.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredBusinesses.map((business, idx) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  {business.isFeatured && (
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <Star size={10} className="fill-current" /> Featured
                    </div>
                  )}
                  
                  <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {business.imageURL ? (
                      <img src={business.imageURL} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <Building2 size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 z-10">
                       <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                         {business.category}
                       </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold dark:text-white mb-2 leading-tight">
                      {business.name}
                    </h3>
                    <div className="flex flex-col gap-1 mb-4">
                      {business.locations.slice(0, 2).map((loc, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                          <MapPin size={12} className="text-rose-500 shrink-0" /> {loc.constituency}
                        </p>
                      ))}
                      {business.locations.length > 2 && (
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest pl-5">
                          + {business.locations.length - 2} more branches
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 line-clamp-2">
                      {business.description}
                    </p>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <a href={`tel:${business.contactPhone}`} className="flex justify-center items-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors dark:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600">
                        <Phone size={14} className="text-rose-500" /> Call
                      </a>
                      <a href={`mailto:${business.contactEmail}`} className="flex justify-center items-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors dark:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600">
                         <Mail size={14} className="text-rose-500" /> Email
                      </a>
                    </div>
                  </div>
                  
                  <Link to={`/directory/${business.id}`} className="absolute inset-0 z-0">
                    <span className="sr-only">View {business.name}</span>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Store size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-6" />
            <h3 className="text-xl font-bold dark:text-white mb-2">No businesses found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto mb-8">
              We couldn't find any services matching your search in this area.
            </p>
            <Link to="/register-business" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">
              Be the first to list here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

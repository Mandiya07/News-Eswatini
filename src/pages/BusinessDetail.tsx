import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Phone, Mail, Star, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { newsService } from '../services/newsService';
import { ServiceBusiness } from '../types';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<ServiceBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;
      try {
        const data = await newsService.getBusinessById(id);
        setBusiness(data);
      } catch (error) {
        console.error("Error fetching business:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 text-center">
        <h2 className="text-3xl font-black dark:text-white mb-4">Business Not Found</h2>
        <p className="text-zinc-500 mb-8 max-w-md">The service you are looking for doesn't exist or has been removed.</p>
        <Link to="/directory" className="px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <Link to="/directory" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        {/* Hero Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 mb-12">
          <div className="relative h-64 md:h-96 bg-zinc-200 dark:bg-zinc-800">
            {business.imageURL ? (
              <img src={business.imageURL} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                <span className="text-zinc-300 dark:text-zinc-700 text-4xl font-black opacity-30">{business.name}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            {business.isFeatured && (
              <div className="absolute top-6 left-6 z-10 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                <Star size={12} className="fill-current" /> Featured Service
              </div>
            )}

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
              <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30 mb-4">
                {business.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{business.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-rose-400" /> {business.locations.length} {business.locations.length === 1 ? 'Location' : 'Branches'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-6 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">About {business.name}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-medium">
                {business.description}
              </p>
            </div>

            {/* Simulated Reviews/Trust Badges (Static for now to add trust) */}
            <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
               <h4 className="font-bold dark:text-white mb-4 text-sm flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-emerald-500" /> Verified Local Service
               </h4>
               <p className="text-xs text-zinc-500 dark:text-zinc-400">
                 This business has been registered in the {business.locations[0]?.constituency || 'local'} constituency directory. Engaging with local services strengthens your community.
               </p>
            </div>
          </div>

          {/* Sidebar / Contact Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl shadow-black/5 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-8 text-center">Contact Business</h3>
              
              <div className="space-y-4 mb-8">
                <a 
                  href={`tel:${business.contactPhone}`}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                >
                  <Phone size={18} /> Call Now
                </a>
                <a 
                  href={`mailto:${business.contactEmail}`}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Mail size={18} /> Send Email
                </a>
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Phone</p>
                    <p className="font-medium dark:text-white text-sm">{business.contactPhone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Email</p>
                    <p className="font-medium dark:text-white text-sm break-all">{business.contactEmail}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Our Locations</p>
                  {business.locations.map((loc, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                      <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 shrink-0">
                        <MapPin size={14} />
                      </div>
                      <div>
                        <p className="font-bold dark:text-white text-sm">{loc.address}</p>
                        <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mt-1 mb-2">{loc.constituency}, {loc.region}</p>
                        {loc.contactNumber && (
                          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                            <Phone size={12} /> {loc.contactNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

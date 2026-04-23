import React from 'react';
import { motion } from 'motion/react';
import { Ad } from '../../types';

interface AdBannerProps {
  ads: Ad[];
}

export default function AdBanner({ ads }: AdBannerProps) {
  if (!ads || ads.length === 0) return null;

  return (
    <div className="w-full space-y-4 py-8">
      {ads.map((ad) => (
        <motion.a
          key={ad.id}
          href={ad.linkURL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block w-full overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white dark:bg-zinc-900">
             <div className="w-full sm:w-24 h-24 sm:h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img src={ad.imageURL} alt={ad.advertiserName} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-1">Sponsored</p>
                <h4 className="text-sm font-bold dark:text-white">{ad.advertiserName}</h4>
             </div>
             <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 group-hover:text-rose-600 transition-colors px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-full">Explore</span>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

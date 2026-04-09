import React from 'react';
import { Link } from 'react-router-dom';
import { TINKHUNDLA_DATA } from '../constants';
import { motion } from 'motion/react';

export default function Constituencies() {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter dark:text-white">Constituencies</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Explore the 59 tinkhundla (constituencies) in Eswatini, grouped by region.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(TINKHUNDLA_DATA).map(([region, tinkhundlaList]) => (
            <motion.div 
              key={region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800"
            >
              <h2 className="text-xl font-black uppercase tracking-widest text-rose-600 mb-6">{region}</h2>
              <div className="space-y-3">
                {tinkhundlaList.map(tinkhundla => (
                  <Link 
                    key={tinkhundla} 
                    to={`/constituency/${tinkhundla.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-rose-600 transition-colors"
                  >
                    {tinkhundla}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

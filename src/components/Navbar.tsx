import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Bell, Moon, Sun, ChevronDown, LayoutDashboard } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { TINKHUNDLA_DATA } from '../constants';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, userData, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [constituencySearch, setConstituencySearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const categories = [
    'Politics', 'Sports', 'Business', 'Education', 'Health', 'Entertainment', 'Technology', 'Community'
  ];

  const regions = ['Hhohho', 'Manzini', 'Lubombo', 'Shiselweni'];

  const showAdminDashboard = userData && ['admin', 'editor', 'reporter'].includes(userData.role);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Breaking News Ticker */}
      <div className="bg-zinc-950 text-white py-1.5 px-4 text-[10px] sm:text-xs border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-black text-rose-500 uppercase tracking-tighter">Live Update</span>
          </div>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block">
              <span className="mx-8 font-medium opacity-80">New infrastructure project announced for Manzini</span>
              <span className="mx-8 font-medium opacity-80">Eswatini football team prepares for upcoming qualifiers</span>
              <span className="mx-8 font-medium opacity-80">Lubombo region reports record harvest...</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 font-bold opacity-60 uppercase tracking-widest text-[10px]">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav 
        className={cn(
          "transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 py-2" 
            : "bg-white dark:bg-zinc-950 border-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-black text-xl rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-lg shadow-rose-500/20">E</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-950 dark:bg-white rounded-full border-2 border-white dark:border-zinc-950"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">News</span>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] leading-none mt-1">Eswatini</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link 
                to="/nationwide" 
                className={cn(
                  "px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-full",
                  location.pathname === '/nationwide' 
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                Nationwide
              </Link>
              
              <div className="relative group">
                <button className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full flex items-center gap-1 transition-all">
                  Regions <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-2 overflow-hidden">
                  {regions.map(region => (
                    <Link 
                      key={region} 
                      to={`/region/${region.toLowerCase()}`} 
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors dark:text-zinc-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                      {region}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full flex items-center gap-1 transition-all">
                  Constituencies <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-4 overflow-hidden flex flex-col">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search constituencies..." 
                      value={constituencySearch}
                      onChange={(e) => setConstituencySearch(e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all"
                    />
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto">
                    {Object.entries(TINKHUNDLA_DATA).map(([region, tinkhundlaList]) => {
                      const filteredList = tinkhundlaList.filter(t => t.toLowerCase().includes(constituencySearch.toLowerCase()));
                      if (filteredList.length === 0) return null;
                      
                      return (
                        <div key={region} className="mb-4">
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-2 px-2">{region}</p>
                          {filteredList.map(tinkhundla => (
                            <Link 
                              key={tinkhundla} 
                              to={`/constituency/${tinkhundla.toLowerCase().replace(/\s+/g, '-')}`} 
                              className="flex items-center justify-between px-2 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors dark:text-zinc-300"
                            >
                              {tinkhundla}
                              <span className="text-[9px] font-medium text-zinc-400 uppercase">{region}</span>
                            </Link>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-rose-500 transition-all" />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-rose-500 transition-all">
                        <User size={16} className="text-zinc-500" />
                      </div>
                    )}
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-2 overflow-hidden">
                    <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                      <p className="text-sm font-black dark:text-white truncate">{userData?.name || user.displayName || 'User'}</p>
                      <p className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-widest mt-0.5">{user.email}</p>
                    </div>
                    {showAdminDashboard && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors dark:text-zinc-300">
                        <LayoutDashboard size={14} className="text-zinc-400" /> Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors dark:text-zinc-300">
                      <User size={14} className="text-zinc-400" /> My Profile
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-3 transition-colors mt-1"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-zinc-950/10 dark:shadow-white/5">
                  Sign In
                </Link>
              )}

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Link to="/nationwide" className="flex items-center justify-center h-12 text-xs font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 rounded-xl dark:text-zinc-300">Nationwide</Link>
                <Link to="/constituencies" className="flex items-center justify-center h-12 text-xs font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 rounded-xl dark:text-zinc-300">Constituencies</Link>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Regions</p>
                <div className="grid grid-cols-2 gap-2">
                  {regions.map(region => (
                    <Link key={region} to={`/region/${region.toLowerCase()}`} className="flex items-center px-4 h-10 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 rounded-lg dark:text-zinc-300">
                      {region}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <Link key={cat} to={`/category/${cat.toLowerCase()}`} className="flex items-center px-4 h-10 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 rounded-lg dark:text-zinc-300">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {!user && (
                <Link to="/login" className="flex items-center justify-center w-full h-14 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-rose-600/20">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-4 shadow-2xl z-40"
          >
            <div className="max-w-4xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search news, regions, or constituencies..." 
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all"
                  autoFocus
                />
              </div>
              <button className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-950/10">
                Search
              </button>
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="p-4 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Bar (Desktop) */}
      <div className="hidden lg:block bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10 h-12 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <Link 
                key={cat} 
                to={`/category/${cat.toLowerCase()}`} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative py-3",
                  location.pathname === `/category/${cat.toLowerCase()}`
                    ? "text-rose-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose-600"
                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

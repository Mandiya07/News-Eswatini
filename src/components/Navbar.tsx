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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage first
    const savedMode = localStorage.getItem('theme');
    if (savedMode) return savedMode === 'dark';
    // Fallback to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
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
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500",
      scrolled 
        ? "bg-zinc-100 dark:bg-zinc-900 border-b-2 border-rose-600/20 dark:border-rose-600/10 shadow-2xl" 
        : "bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b-2 border-rose-600/10"
    )}>
      {/* Signature Brand Accent */}
      <div className="h-1 w-full bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.3)]"></div>

      {/* Breaking News Ticker */}
      <div className={cn(
        "py-1.5 px-4 text-[10px] sm:text-xs transition-all duration-500 border-b border-rose-600/10",
        scrolled 
          ? "bg-black text-white" 
          : "bg-black/90 text-white backdrop-blur-lg"
      )}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className={cn(
              "font-black uppercase tracking-tighter",
              scrolled ? "text-rose-500" : "text-rose-600 dark:text-rose-500"
            )}>Live Update</span>
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
          "transition-all duration-500",
          scrolled ? "py-2 bg-zinc-100/95 dark:bg-zinc-900/95" : "py-6 bg-zinc-50/50 dark:bg-zinc-900/50"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-500 shadow-xl",
                  scrolled 
                    ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 group-hover:bg-rose-600 group-hover:text-white shadow-zinc-950/10 dark:shadow-white/5" 
                    : "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white group-hover:bg-rose-600 group-hover:text-white shadow-black/20"
                )}>E</div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-2xl font-black tracking-tighter uppercase leading-none transition-colors",
                  scrolled ? "text-zinc-900 dark:text-white" : "text-zinc-950 dark:text-white drop-shadow-sm"
                )}>News</span>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] leading-none mt-1.5">Eswatini</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Link 
                to="/nationwide" 
                className={cn(
                  "px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-full relative group/nav",
                  location.pathname === '/nationwide' 
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" 
                    : scrolled
                      ? "text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      : "text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-white/20 [text-shadow:_0_1px_2px_rgb(0_0_0_/_10%)] dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]"
                )}
              >
                Nationwide
                {location.pathname !== '/nationwide' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-600 rounded-full scale-0 group-hover/nav:scale-100 transition-transform"></span>}
              </Link>
              
              <div className="relative group">
                <button className={cn(
                  "px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all group/nav relative",
                  scrolled
                    ? "text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    : "text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-white/20 [text-shadow:_0_1px_2px_rgb(0_0_0_/_10%)] dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]"
                )}>
                  Regions <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
                </button>
                <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 translate-y-4 group-hover:translate-y-0 p-3 overflow-hidden z-50">
                  <div className="grid grid-cols-1 gap-1">
                    {regions.map(region => (
                      <Link 
                        key={region} 
                        to={`/region/${region.toLowerCase()}`} 
                        className="flex items-center justify-between px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-2xl transition-all dark:text-zinc-300 group/item"
                      >
                        <span className="group-hover/item:translate-x-1 transition-transform">{region}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover/item:bg-rose-500 transition-colors"></div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button className={cn(
                  "px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all group/nav relative",
                  scrolled
                    ? "text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    : "text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-white/20 [text-shadow:_0_1px_2px_rgb(0_0_0_/_10%)] dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]"
                )}>
                  Constituencies <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
                </button>
                <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 translate-y-4 group-hover:translate-y-0 p-5 overflow-hidden flex flex-col z-50">
                  <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Find your constituency..." 
                      value={constituencySearch}
                      onChange={(e) => setConstituencySearch(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all"
                    />
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
                    {Object.entries(TINKHUNDLA_DATA).map(([region, tinkhundlaList]) => {
                      const filteredList = tinkhundlaList.filter(t => t.toLowerCase().includes(constituencySearch.toLowerCase()));
                      if (filteredList.length === 0) return null;
                      
                      return (
                        <div key={region} className="mb-6 last:mb-0">
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] mb-3 px-3">{region}</p>
                          <div className="grid grid-cols-1 gap-1">
                            {filteredList.map(tinkhundla => (
                              <Link 
                                key={tinkhundla} 
                                to={`/constituency/${tinkhundla.toLowerCase().replace(/\s+/g, '-')}`} 
                                className="flex items-center justify-between px-3 py-2.5 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all dark:text-zinc-300 group/item"
                              >
                                <span className="group-hover/item:translate-x-1 transition-transform">{tinkhundla}</span>
                                <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">{region.substring(0, 3)}</span>
                              </Link>
                            ))}
                          </div>
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
                className={cn(
                  "p-2.5 rounded-full transition-colors",
                  scrolled 
                    ? "hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-500" 
                    : "hover:bg-white/20 text-zinc-700 dark:text-white drop-shadow-md hover:text-rose-600 dark:hover:text-rose-500"
                )}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  "p-2.5 rounded-full transition-colors",
                  scrolled 
                    ? "hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-500" 
                    : "hover:bg-white/20 text-zinc-700 dark:text-white drop-shadow-md hover:text-rose-600 dark:hover:text-rose-500"
                )}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <div className={cn(
                "h-6 w-px mx-1 hidden sm:block",
                scrolled ? "bg-zinc-300 dark:bg-zinc-700" : "bg-zinc-400/20"
              )}></div>
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full transition-all">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-rose-500 transition-all shadow-sm" />
                    ) : (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-rose-500 transition-all",
                        scrolled ? "bg-zinc-200 dark:bg-zinc-800 shadow-md" : "bg-white/20 shadow-lg shadow-black/20"
                      )}>
                        <User size={16} className={scrolled ? "text-zinc-600" : "text-white"} />
                      </div>
                    )}
                  </button>
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 p-3 overflow-hidden">
                    <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/50 mb-2 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl">
                      <p className="text-sm font-black dark:text-white truncate">{userData?.name || user.displayName || 'User'}</p>
                      <p className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-widest mt-1">{user.email}</p>
                    </div>
                    {showAdminDashboard && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors dark:text-zinc-300 group/link">
                        <LayoutDashboard size={14} className="text-zinc-400 group-hover/link:text-rose-600 transition-colors" /> Admin Dashboard
                      </Link>
                    )}
                    <Link to="/add-event" className="flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors dark:text-zinc-300 group/link">
                      <Bell size={14} className="text-zinc-400 group-hover/link:text-rose-600 transition-colors" /> Submit Event
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors dark:text-zinc-300 group/link">
                      <User size={14} className="text-zinc-400 group-hover/link:text-rose-600 transition-colors" /> My Profile
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl flex items-center gap-3 transition-colors mt-1"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className={cn(
                  "hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg",
                  "bg-rose-600 text-white shadow-rose-600/20"
                )}>
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
            className="lg:hidden bg-zinc-100 dark:bg-zinc-900 border-b-2 border-zinc-300 dark:border-zinc-800 overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/nationwide" className="flex items-center justify-center h-14 text-xs font-black uppercase tracking-widest bg-white dark:bg-zinc-900 rounded-2xl dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">Nationwide</Link>
                <Link to="/constituencies" className="flex items-center justify-center h-14 text-xs font-black uppercase tracking-widest bg-white dark:bg-zinc-900 rounded-2xl dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">Constituencies</Link>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] px-1">Regions</p>
                <div className="grid grid-cols-2 gap-3">
                  {regions.map(region => (
                    <Link key={region} to={`/region/${region.toLowerCase()}`} className="flex items-center px-5 h-12 text-xs font-bold bg-white dark:bg-zinc-900 rounded-xl dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                      {region}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] px-1">Categories</p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <Link key={cat} to={`/category/${cat.toLowerCase()}`} className="flex items-center px-5 h-12 text-xs font-bold bg-white dark:bg-zinc-900 rounded-xl dark:text-zinc-300 shadow-sm border border-zinc-100 dark:border-zinc-800">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {user ? (
                <Link to="/add-event" className="flex items-center justify-center gap-2 w-full h-14 bg-rose-50 text-rose-600 dark:bg-rose-900/20 rounded-2xl font-black uppercase tracking-widest text-sm">
                  <Bell size={18} /> Submit Event
                </Link>
              ) : (
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
            className="absolute top-full left-0 w-full bg-zinc-100 dark:bg-zinc-900 border-b-2 border-zinc-300 dark:border-zinc-800 p-6 shadow-2xl z-40"
          >
            <div className="max-w-4xl mx-auto flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search news, regions, or constituencies..." 
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-14 pr-4 py-5 text-base font-medium focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all shadow-sm"
                  autoFocus
                />
              </div>
              <button className="bg-rose-600 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-rose-600/20">
                Search
              </button>
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="p-5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Bar (Desktop) */}
      <div className={cn(
        "hidden lg:block transition-all duration-300",
        scrolled ? "bg-transparent h-0 opacity-0 invisible" : "bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10 h-12 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <Link 
                key={cat} 
                to={`/category/${cat.toLowerCase()}`} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative py-3 group/cat",
                  location.pathname === `/category/${cat.toLowerCase()}`
                    ? "text-rose-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-rose-600"
                    : "text-zinc-500 hover:text-rose-600 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-rose-600/30 after:transition-all"
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

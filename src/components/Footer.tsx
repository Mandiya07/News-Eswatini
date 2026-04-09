import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">E</div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter uppercase leading-none">News</span>
                <span className="text-sm font-bold text-red-600 uppercase tracking-widest leading-none">Eswatini</span>
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Delivering reliable, timely, and engaging news across the Kingdom of Eswatini. From national headlines to local constituency updates, we keep you informed.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/nationwide" className="hover:text-white transition-colors">Nationwide News</Link></li>
              <li><Link to="/region/hhohho" className="hover:text-white transition-colors">Regional News</Link></li>
              <li><Link to="/constituencies" className="hover:text-white transition-colors">Constituency News</Link></li>
              <li><Link to="/category/sports" className="hover:text-white transition-colors">Sports Desk</Link></li>
              <li><Link to="/category/business" className="hover:text-white transition-colors">Business & Finance</Link></li>
              <li><Link to="/submit-story" className="hover:text-white transition-colors">Submit a Story</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Support</h3>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/advertise" className="hover:text-white transition-colors">Advertise with Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Newsletter</h3>
            <p className="text-zinc-400 text-sm mb-4">Subscribe to get the latest news delivered to your inbox.</p>
            <form className="space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-zinc-800 border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none"
              />
              <button className="w-full bg-red-600 text-white py-3 rounded-md text-sm font-bold hover:bg-red-700 transition-colors">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} News Eswatini. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Designed for Eswatini</span>
            <span>Reliable • Engaging • Local</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

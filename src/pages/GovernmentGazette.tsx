import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, Calendar, MapPin, Landmark, ArrowRight, Download } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';

// Mock data strictly for the Government Gazette UI
const GAZETTE_MOCK_DATA = [
  {
    id: 'gzt-001',
    title: 'Declaration of National State of Disaster: Drought and Water Scarcity',
    type: 'Notice',
    department: 'Prime Minister\'s Office',
    date: '2026-04-20T00:00:00Z',
    reference: 'Vol. LXIV. No. 12',
    summary: 'Official declaration allocating emergency funds for water relief in the Shiselweni and Lubombo regions.',
    downloadUrl: '#'
  },
  {
    id: 'gzt-002',
    title: 'The Cyber Security and Data Protection Act, 2026',
    type: 'Act',
    department: 'Ministry of Information, Communications and Technology',
    date: '2026-04-18T00:00:00Z',
    reference: 'Act No. 4 of 2026',
    summary: 'An act to provide for the protection of personal data, regulation of cyber security, and establishment of the Cyber Security Authority.',
    downloadUrl: '#'
  },
  {
    id: 'gzt-003',
    title: 'Tender Notice: Rehabilitation of MR3 Highway (Manzini to Sikhuphe)',
    type: 'Tender',
    department: 'Ministry of Public Works and Transport',
    date: '2026-04-15T00:00:00Z',
    reference: 'Tender No. 45/2026',
    summary: 'Invitation for registered civil engineering contractors to submit bids for the rehabilitation of the MR3 highway.',
    downloadUrl: '#'
  },
  {
    id: 'gzt-004',
    title: 'Appointment of Principal Secretaries',
    type: 'Appointment',
    department: 'Civil Service Commission',
    date: '2026-04-10T00:00:00Z',
    reference: 'Vol. LXIV. No. 11',
    summary: 'Official gazetting of newly appointed Principal Secretaries for the Ministry of Health and Ministry of Education.',
    downloadUrl: '#'
  },
  {
    id: 'gzt-005',
    title: 'The Central Bank of Eswatini (Amendment) Bill, 2026',
    type: 'Bill',
    department: 'Ministry of Finance',
    date: '2026-04-05T00:00:00Z',
    reference: 'Bill No. 2 of 2026',
    summary: 'A bill to amend the Central Bank framework integrating digital currency compliance and anti-money laundering controls.',
    downloadUrl: '#'
  }
];

export default function GovernmentGazette() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const types = ['All', 'Notice', 'Act', 'Bill', 'Tender', 'Appointment'];

  const filteredData = GAZETTE_MOCK_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen pt-12 pb-24">
      {/* Header Section */}
      <div className="bg-zinc-900 border-b-4 border-rose-600 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-600 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-16">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
            <Landmark size={48} className="text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Official Records
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              Government <span className="text-rose-500">Gazette</span>
            </h1>
            <p className="text-zinc-400 text-lg lg:text-xl font-medium max-w-2xl">
              Access the official publications of the Eswatini Government, including Acts, Bills, Notices, Tenders, and legal announcements.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-4 lg:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row gap-4 mb-10 sticky top-32 z-30">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by title or reference number (e.g., Act No. 4)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  filterType === type 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={item.id} 
                className="bg-white dark:bg-zinc-900 group rounded-[2.5rem] p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-900/50 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 transition-all flex flex-col lg:flex-row gap-8 lg:items-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText size={32} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest">
                      {item.type}
                    </span>
                    <span className="text-sm font-bold text-zinc-400 flex items-center gap-1.5">
                      <Calendar size={14} /> {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/10 px-3 py-1 rounded-lg">
                      {item.reference}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black dark:text-white mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 mb-4 text-sm lg:text-base">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                    <Landmark size={14} /> {item.department}
                  </div>
                </div>

                <div className="lg:w-48 flex-shrink-0 flex flex-col gap-3">
                  <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-[10px] items-center justify-center font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex gap-2 shadow-lg shadow-black/10">
                    <Download size={16} /> Download PDF
                  </button>
                  <button className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-[10px] items-center justify-center font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex gap-2">
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Search size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-6" />
              <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">No Records Found</h3>
              <p className="text-zinc-500 font-medium">Try adjusting your search term or filtering criteria.</p>
              <button 
                onClick={() => {setSearchTerm(''); setFilterType('All');}}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

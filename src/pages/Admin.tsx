import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  BarChart3,
  MessageSquare,
  Send
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { toast } from 'sonner';
import { Article, User, Submission, Payout } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const { userData, loading, isAdmin, isEditor, isReporter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData || !['admin', 'editor', 'reporter'].includes(userData.role)) {
    return null; // ProtectedRoute in App.tsx handles redirection
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin', 'editor', 'reporter'] },
    { icon: FileText, label: 'Articles', path: '/admin/articles', roles: ['admin', 'editor', 'reporter'] },
    { icon: Send, label: 'Submissions', path: '/admin/submissions', roles: ['admin', 'editor'] },
    { icon: Users, label: 'Users', path: '/admin/users', roles: ['admin'] },
    { icon: BarChart3, label: 'Contributors', path: '/admin/contributors', roles: ['admin', 'editor'] },
    { icon: Settings, label: 'Settings', path: '/admin/settings', roles: ['admin'] },
  ].filter(item => item.roles.includes(userData.role));

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-100 dark:border-zinc-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-10">
          <h2 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] mb-10">Admin Control</h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group",
                  location.pathname === item.path 
                    ? "bg-rose-600 text-white shadow-xl shadow-rose-600/20" 
                    : "text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(location.pathname === item.path ? "text-white" : "text-zinc-400 group-hover:text-rose-600")} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {isAdmin && (
          <div className="mt-auto p-10 border-t border-zinc-100 dark:border-zinc-800">
            <button 
              onClick={async () => {
                // Seed logic
                try {
                  const articles = [
                    {
                      title: "Nationwide Infrastructure Project Announced",
                      content: "A new nationwide infrastructure project has been announced, promising to improve roads and connectivity across the Kingdom.",
                      category: "Politics",
                      authorId: auth.currentUser?.uid,
                      authorName: auth.currentUser?.displayName || "Admin",
                      status: "published",
                      featured: true,
                      breaking: true,
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      views: 1250,
                      likes: 45,
                      commentsCount: 12
                    },
                    {
                      title: "Hhohho Region Celebrates Harvest",
                      content: "Farmers in the Hhohho region are celebrating a record-breaking harvest this season.",
                      category: "Community",
                      authorId: auth.currentUser?.uid,
                      authorName: auth.currentUser?.displayName || "Admin",
                      status: "published",
                      region: "Hhohho",
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      views: 850,
                      likes: 32,
                      commentsCount: 5
                    },
                    {
                      title: "New School Opened in Mbabane East",
                      content: "A new primary school has been opened in the Mbabane East constituency, providing better education facilities for local children.",
                      category: "Education",
                      authorId: auth.currentUser?.uid,
                      authorName: auth.currentUser?.displayName || "Admin",
                      status: "published",
                      inkhundla: "Mbabane East",
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      views: 2100,
                      likes: 156,
                      commentsCount: 28
                    }
                  ];

                  for (const article of articles) {
                    await addDoc(collection(db, 'articles'), article).catch(err => handleFirestoreError(err, OperationType.CREATE, 'articles'));
                  }
                  
                  // Add a poll
                  await addDoc(collection(db, 'polls'), {
                    question: "What should be the government's top priority for 2026?",
                    options: [
                      { text: "Job Creation", votes: 450 },
                      { text: "Healthcare Improvement", votes: 320 },
                      { text: "Education Reform", votes: 210 },
                      { text: "Infrastructure", votes: 180 }
                    ],
                    active: true,
                    createdAt: serverTimestamp()
                  }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'polls'));

                  toast.success('Database seeded successfully!');
                  window.location.reload();
                } catch (error) {
                  console.error('Seed error:', error);
                  toast.error('Failed to seed database');
                }
              }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-all"
            >
              <Database size={18} />
              Seed Database
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 h-24 flex items-center justify-between px-12 sticky top-0 z-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter dark:text-white">
            {location.pathname.split('/').pop()?.toUpperCase() || 'DASHBOARD'}
          </h1>
          <div className="flex items-center gap-6">
            <button className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-rose-600 transition-colors">
              <Clock size={20} />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-zinc-100 dark:border-zinc-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase tracking-widest dark:text-white">{userData?.name || auth.currentUser?.displayName || 'Admin'}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{userData?.role.toUpperCase()}</p>
              </div>
              <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-rose-600/20">
                {(userData?.name || auth.currentUser?.displayName || 'A').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/articles" element={<ArticlesList />} />
                {isEditor && <Route path="/submissions" element={<SubmissionsList />} />}
                {isEditor && <Route path="/contributors" element={<ContributorsList />} />}
                {isAdmin && <Route path="/users" element={<UsersList />} />}
                {isAdmin && <Route path="/settings" element={<div className="p-20 text-center text-zinc-400 font-black uppercase tracking-widest text-xs">Settings coming soon.</div>} />}
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const path = 'users';
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole as any } : u));
      toast.success('User role updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">User</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Role</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Joined</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-black text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                      className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none focus:ring-2 focus:ring-rose-600 outline-none dark:text-zinc-300"
                    >
                      <option value="reader">Reader</option>
                      <option value="reporter">Reporter</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-3 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-600/10 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ContributorsList() {
  const [contributors, setContributors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributors = async () => {
    const path = 'users';
    try {
      const q = query(
        collection(db, path), 
        where('role', 'in', ['admin', 'editor', 'reporter']),
        orderBy('earnings', 'desc')
      );
      const snapshot = await getDocs(q);
      setContributors(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributors();
  }, []);

  const handlePayout = async (user: User) => {
    if (!user.earnings || user.earnings <= 0) {
      toast.error('No earnings to payout');
      return;
    }

    if (!user.paymentDetails) {
      toast.error('No payment details found for this contributor');
      return;
    }

    if (!window.confirm(`Process payout of SZL ${user.earnings.toFixed(2)} for ${user.name}?`)) {
      return;
    }

    try {
      // 1. Create payout record
      const payoutData: Omit<Payout, 'id'> = {
        userId: user.uid,
        userName: user.name,
        amount: user.earnings,
        method: user.paymentDetails.method,
        accountNumber: user.paymentDetails.accountNumber,
        processedAt: serverTimestamp(),
        processedBy: auth.currentUser?.uid || 'system'
      };

      await addDoc(collection(db, 'payouts'), payoutData).catch(err => handleFirestoreError(err, OperationType.CREATE, 'payouts'));

      // 2. Reset user earnings
      await updateDoc(doc(db, 'users', user.uid), {
        earnings: 0
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));

      toast.success(`Payout processed for ${user.name}`);
      fetchContributors(); // Refresh list
    } catch (error) {
      console.error('Payout error:', error);
      toast.error('Failed to process payout');
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Contributor</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Role</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Views</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Earnings (SZL)</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {contributors.map((user) => (
                <tr key={user.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-rose-600/10 flex items-center justify-center text-rose-600 font-black text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full dark:text-zinc-400">{user.role}</span>
                  </td>
                  <td className="px-10 py-6 text-sm font-black dark:text-zinc-300">
                    {(user.totalViews || 0).toLocaleString()}
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-emerald-600">
                    {(user.earnings || 0).toFixed(2)}
                  </td>
                  <td className="px-10 py-6">
                    <button 
                      onClick={() => handlePayout(user)}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline disabled:opacity-30 disabled:no-underline transition-all"
                      disabled={!user.earnings || user.earnings <= 0}
                    >
                      Process Payout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {contributors.length === 0 && !loading && (
          <div className="p-20 text-center text-zinc-400 font-black uppercase tracking-widest text-xs">No contributors found.</div>
        )}
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState({ articles: 0, views: 0, comments: 0, users: 0, totalEarnings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const articlesSnap = await getDocs(collection(db, 'articles'));
        const usersSnap = await getDocs(collection(db, 'users'));
        
        let totalViews = 0;
        let totalComments = 0;
        let totalEarnings = 0;
        articlesSnap.forEach(doc => {
          totalViews += doc.data().views || 0;
          totalComments += doc.data().commentsCount || 0;
          totalEarnings += doc.data().earningsGenerated || 0;
        });

        setStats({
          articles: articlesSnap.size,
          views: totalViews,
          comments: totalComments,
          users: usersSnap.size,
          totalEarnings
        });
      } catch (error) {
        console.error('Stats fetch error:', error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Articles', value: stats.articles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { label: 'Total Views', value: stats.views.toLocaleString(), icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
    { label: 'Total Payouts', value: `SZL ${stats.totalEarnings.toFixed(2)}`, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-600/10' },
    { label: 'Active Users', value: stats.users, icon: Users, color: 'text-amber-600', bg: 'bg-amber-600/10' },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat) => (
          <motion.div 
            key={stat.label} 
            whileHover={{ y: -5 }}
            className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm group"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon size={28} className={stat.color} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
            <p className="text-4xl font-black dark:text-white tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 dark:text-white">Recent Activity</h3>
          <div className="space-y-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 transition-transform">
                  <Clock size={20} className="text-zinc-400 group-hover:text-rose-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black dark:text-zinc-200 leading-tight mb-1">New article published: "Eswatini Economic Outlook"</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">2 hours ago • by Admin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 dark:text-white">Top Categories</h3>
          <div className="space-y-8">
            {['Politics', 'Sports', 'Business', 'Health'].map((cat, idx) => (
              <div key={cat} className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="dark:text-zinc-300">{cat}</span>
                  <span className="text-rose-600">{80 - idx * 15}%</span>
                </div>
                <div className="w-full h-3 bg-white dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${80 - idx * 15}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-rose-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const path = 'articles';
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const path = `articles/${id}`;
      try {
        await deleteDoc(doc(db, 'articles', id));
        setArticles(articles.filter(a => a.id !== id));
        toast.success('Article deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-rose-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white transition-all"
          />
        </div>
        <button className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95">
          <Plus size={18} /> New Article
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Article</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={article.imageURL || `https://picsum.photos/seed/${article.id}/100/100`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white line-clamp-1 mb-1">{article.title}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">By {article.authorName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full dark:text-zinc-400">{article.category}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                      article.status === 'published' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                    )}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/article/${article.id}`} className="p-3 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-600/10 transition-all">
                        <Eye size={18} />
                      </Link>
                      <button className="p-3 rounded-xl text-zinc-400 hover:text-blue-600 hover:bg-blue-600/10 transition-all">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(article.id)} className="p-3 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-600/10 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {articles.length === 0 && !loading && (
          <div className="p-20 text-center text-zinc-400 font-black uppercase tracking-widest text-xs">No articles found.</div>
        )}
      </div>
    </div>
  );
}

function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const path = 'submissions';
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Submitter</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Story Title</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600 font-black text-xs">
                        {sub.submitterName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white leading-none mb-1">{sub.submitterName}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{sub.submitterEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-black dark:text-white line-clamp-1">{sub.title}</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                      sub.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {formatDate(sub.createdAt)}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-3 rounded-xl text-emerald-600 hover:bg-emerald-600/10 transition-all">
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-3 rounded-xl text-rose-600 hover:bg-rose-600/10 transition-all">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {submissions.length === 0 && (
          <div className="p-20 text-center text-zinc-400 font-black uppercase tracking-widest text-xs">No submissions yet.</div>
        )}
      </div>
    </div>
  );
}

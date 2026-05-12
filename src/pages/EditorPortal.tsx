import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { Submission } from '../types';
import { FileEdit, CheckCircle, XCircle, Clock, FileText, User, MapPin, Mail, ChevronRight, LayoutDashboard, Trophy, Plus, ArrowRight, Coins, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Bounty } from '../types';

export default function EditorPortal() {
  const { userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'submissions' | 'bounties'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payout/Bounty Form State
  const [category, setCategory] = useState('National');
  const [contentLabel, setContentLabel] = useState<'Independent' | 'Community' | 'Official'>('Community');
  const [payoutTier, setPayoutTier] = useState<number>(0);

  // New Bounty Draft State
  const [bountyDraft, setBountyDraft] = useState({
    title: '',
    description: '',
    reward: 150,
    constituency: ''
  });

  const isEditor = userData?.role === 'admin' || userData?.role === 'editor';

  useEffect(() => {
    if (!authLoading && !isEditor) {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [authLoading, isEditor, navigate]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const qS = query(
        collection(db, 'submissions'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshotS = await getDocs(qS);
      setSubmissions(snapshotS.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));

      const qB = query(collection(db, 'bounties'), orderBy('createdAt', 'desc'));
      const snapshotB = await getDocs(qB);
      setBounties(snapshotB.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Could not load portal data. Database permissions or indexes might be missing.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bountyDraft.title || !bountyDraft.constituency) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'bounties'), {
        ...bountyDraft,
        status: 'open',
        createdAt: serverTimestamp(),
        authorId: auth.currentUser?.uid,
        submissionsCount: 0
      });
      toast.success('Bounty posted successfully!');
      setBountyDraft({ title: '', description: '', reward: 150, constituency: '' });
      fetchSubmissions();
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast.error('Failed to post bounty');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBounty = async (id: string) => {
    if (!window.confirm('Delete this bounty?')) return;
    try {
      await updateDoc(doc(db, 'bounties', id), { status: 'expired' });
      toast.info('Bounty has been closed.');
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to close bounty.');
    }
  };

  useEffect(() => {
    if (isEditor) {
      fetchSubmissions();
    }
  }, [isEditor]);

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);

    try {
      const authorId = selectedSubmission.submitterId || 'guest-contributor';

      // 1. Create the Article
      const articleData = {
        title: selectedSubmission.title,
        content: selectedSubmission.content,
        authorId: authorId,
        authorName: selectedSubmission.submitterName,
        category: category,
        region: 'National', // Could infer from constituency if mapping exists
        inkhundla: selectedSubmission.constituency || '',
        imageURL: selectedSubmission.imageURL || null,
        videoURL: selectedSubmission.videoURL || null,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        contentLabel: contentLabel,
        isGovernmentNotice: false
      };

      await addDoc(collection(db, 'articles'), articleData);

      // 2. Mark Submission as Reviewed
      await updateDoc(doc(db, 'submissions', selectedSubmission.id), {
        status: 'reviewed',
        updatedAt: serverTimestamp()
      });

      // 3. Process Payout or Bounty
      if (authorId !== 'guest-contributor') {
        const userRef = doc(db, 'users', authorId);
        
        if (selectedSubmission.bountyId) {
          // If it was a bounty, fetch the reward
          const bountyDoc = await getDocs(query(collection(db, 'bounties'), where('__name__', '==', selectedSubmission.bountyId)));
          if (!bountyDoc.empty) {
            const bountyData = bountyDoc.docs[0].data();
            const reward = bountyData.reward || 0;
            
            await updateDoc(userRef, {
              earnings: increment(reward),
              articleCount: increment(1),
              reputationPoints: increment(50)
            });

            // Mark bounty as completed
            await updateDoc(doc(db, 'bounties', selectedSubmission.bountyId), {
              status: 'completed',
              completedAt: serverTimestamp(),
              winnerId: authorId
            });
            toast.success(`Bounty of SZL ${reward} paid out!`);
          }
        } else if (payoutTier > 0) {
          // Standard revenue-share payout
          await updateDoc(userRef, {
            earnings: increment(payoutTier),
            articleCount: increment(1)
          });
        }
      }

      toast.success('Story approved and published successfully!');
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'submissions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    if (!window.confirm('Are you sure you want to reject this submission?')) return;
    
    setIsProcessing(true);
    try {
      // Mark Submission as Rejected
      await updateDoc(doc(db, 'submissions', selectedSubmission.id), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });

      toast.info('Story submission rejected.');
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'submissions');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20">
                <FileEdit size={20} className="text-white" />
              </div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-rose-600">Editor Dashboard</h1>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">Management Portal</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
              Review submissions and post reporting bounties for the community.
            </p>
          </div>
          
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'submissions' ? 'bg-white dark:bg-zinc-700 text-rose-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              Submissions ({submissions.length})
            </button>
            <button 
              onClick={() => setActiveTab('bounties')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bounties' ? 'bg-white dark:bg-zinc-700 text-amber-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              Bounties ({bounties.filter(b => b.status === 'open').length})
            </button>
          </div>
        </div>

        {activeTab === 'submissions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Submissions List Queue */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {submissions.map((submission) => (
              <div 
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all ${selectedSubmission?.id === submission.id ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/50 dark:border-zinc-800 dark:hover:border-zinc-600'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{formatDate(submission.createdAt)}</span>
                  {submission.imageURL || submission.videoURL ? (
                    <span className="w-2 h-2 rounded-full bg-blue-500" title="Contains Media" />
                  ) : null}
                </div>
                <h4 className="font-bold dark:text-white line-clamp-2 leading-tight mb-3">{submission.title}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <User size={14} /> <span className="line-clamp-1">{submission.submitterName}</span>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <CheckCircle size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-6" />
                <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">Inbox Zero!</p>
                <p className="text-xs text-zinc-500 mt-2 font-medium">No pending stories to review.</p>
              </div>
            )}
          </div>

          {/* Review Pane */}
          <div className="lg:col-span-7 xl:col-span-8">
            {selectedSubmission ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-8 md:p-12 shadow-sm sticky top-24">
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-full">
                    <User size={16} /> <span className="font-bold">{selectedSubmission.submitterName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-full">
                    <Mail size={16} /> <span className="font-medium">{selectedSubmission.submitterEmail}</span>
                  </div>
                  {selectedSubmission.constituency && (
                    <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full font-bold">
                      <MapPin size={16} /> {selectedSubmission.constituency}
                    </div>
                  )}
                </div>

                <h3 className="text-3xl md:text-4xl font-black dark:text-white uppercase tracking-tighter leading-tight mb-8">
                  {selectedSubmission.title}
                </h3>

                {selectedSubmission.imageURL && (
                  <div className="mb-8 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src={selectedSubmission.imageURL} alt="Submission Media" className="w-full h-auto object-cover max-h-[400px]" />
                  </div>
                )}
                {selectedSubmission.videoURL && (
                  <div className="mb-8 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Attached Video URL:</p>
                    <a href={selectedSubmission.videoURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                      {selectedSubmission.videoURL}
                    </a>
                  </div>
                )}

                <div className="prose dark:prose-invert max-w-none mb-12 text-zinc-600 dark:text-zinc-300">
                  <ReactMarkdown>{selectedSubmission.content}</ReactMarkdown>
                </div>

                {/* Publish Controls */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-black uppercase tracking-widest dark:text-white mb-6 flex items-center gap-2">
                    <LayoutDashboard size={18} className="text-rose-500" /> Editor Actions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      <label className="text-[10px] items-center font-black uppercase tracking-widest text-zinc-500">Publish Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white appearance-none"
                      >
                        <option>National</option>
                        <option>Development</option>
                        <option>Health</option>
                        <option>Education</option>
                        <option>Business</option>
                        <option>Entertainment</option>
                        <option>Sports</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] items-center font-black uppercase tracking-widest text-zinc-500">Content Label</label>
                      <select 
                        value={contentLabel}
                        onChange={(e) => setContentLabel(e.target.value as any)}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white appearance-none"
                      >
                        <option value="Community">Community Story</option>
                        <option value="Independent">Independent Journalism</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <label className="text-[10px] items-center font-black uppercase tracking-widest text-zinc-500">Journalist Payout Tracker (SZL)</label>
                    <select 
                      value={payoutTier}
                      onChange={(e) => setPayoutTier(Number(e.target.value))}
                      className="w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-rose-600 outline-none text-rose-900 dark:text-rose-100 appearance-none"
                    >
                      <option value={0}>No Payout (Community Submission)</option>
                      <option value={300}>Tier 1: SZL 300 (News Brief)</option>
                      <option value={800}>Tier 2: SZL 800 (Standard Feature)</option>
                      <option value={1500}>Tier 3: SZL 1,500 (In-Depth Report)</option>
                    </select>
                    <p className="text-[10px] text-zinc-500 pt-1 font-medium italic">* If a payout is selected, it will be automatically credited to the verified contributor's account balance upon approval.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={18} /> Approve & Publish
                    </button>
                    <button 
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="w-full sm:w-auto bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900/50 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-12 text-center">
                <FileText size={64} className="text-zinc-200 dark:text-zinc-800 mb-6" />
                <p className="text-xl font-black uppercase tracking-tighter dark:text-white mb-2">No Story Selected</p>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
                  Select a pending submission from the queue to review its contents and take action.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bounties Management Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Bounty Form */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl">
                 <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white mb-6 flex items-center gap-3">
                   <Plus className="text-amber-500" /> New Bounty
                 </h3>
                 <form onSubmit={handleCreateBounty} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Task Title</label>
                       <input 
                         type="text" 
                         value={bountyDraft.title}
                         onChange={e => setBountyDraft({...bountyDraft, title: e.target.value})}
                         placeholder="e.g. Coverage of Clinic Opening"
                         className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Reward (SZL)</label>
                       <input 
                         type="number" 
                         value={bountyDraft.reward}
                         onChange={e => setBountyDraft({...bountyDraft, reward: Number(e.target.value)})}
                         className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 text-amber-600"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Constituency</label>
                       <input 
                         type="text" 
                         value={bountyDraft.constituency}
                         onChange={e => setBountyDraft({...bountyDraft, constituency: e.target.value})}
                         placeholder="e.g. Mbabane East"
                         className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Requirements / Details</label>
                       <textarea 
                         value={bountyDraft.description}
                         onChange={e => setBountyDraft({...bountyDraft, description: e.target.value})}
                         placeholder="What exactly do you need? (e.g. 5 photos, 200 words summary)"
                         className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 dark:text-white min-h-[100px] resize-none"
                         required
                       />
                    </div>
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Posting...' : 'Post Bounty to Board'}
                    </button>
                 </form>
              </div>
            </div>

            {/* Bounties List */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">Active Bounties</h3>
              {bounties.map((b) => (
                <div key={b.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${b.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                         {b.status}
                       </span>
                       <span className="text-[10px] font-bold text-zinc-400">{formatDate(b.createdAt)}</span>
                    </div>
                    <h4 className="text-lg font-black dark:text-white uppercase tracking-tighter mb-1">{b.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium line-clamp-1">{b.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                          <MapPin size={12} className="text-rose-500" /> {b.constituency}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                          <Coins size={12} /> SZL {b.reward}
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === 'open' && (
                      <button 
                        onClick={() => handleDeleteBounty(b.id)}
                        className="p-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        title="Close Bounty"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {bounties.length === 0 && (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                   <Trophy size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4 opacity-50" />
                   <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">No bounties posted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

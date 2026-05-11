import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const path = `users/${user.uid}`;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: user.displayName || 'Anonymous',
            email: user.email,
            role: 'reader',
            photoURL: user.photoURL,
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
      
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked: Please allow popups or open this app in a new tab to sign in.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.info('Sign-in cancelled. If the popup didn\'t open, try disabling your popup blocker.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in popup closed before completion.');
      } else if (error.code === 'auth/api-key-not-valid') {
        toast.error('Authentication configuration error. This usually means the API key is restricted or invalid in the Firebase Console.');
      } else {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Signed in successfully');
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: 'reader',
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
        toast.success('Account created successfully');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white font-bold text-xl">E</div>
              <div className="flex flex-col text-left">
                <span className="text-2xl font-black tracking-tighter uppercase leading-none dark:text-white">News</span>
                <span className="text-sm font-bold text-rose-600 uppercase tracking-widest leading-none">Eswatini</span>
              </div>
            </Link>
            <h1 className="text-2xl font-black dark:text-white">
              {isLogin ? 'Welcome Back' : 'Join the Community'}
            </h1>
            <p className="text-sm text-zinc-500">
              {isLogin ? 'Sign in to access your account and join the discussion.' : 'Create an account to bookmark stories and comment.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-600 outline-none dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white py-3 rounded-lg font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google Account
          </button>

          <p className="text-center text-sm text-zinc-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-rose-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

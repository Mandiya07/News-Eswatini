import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { User, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Super Admin bypass for the developer
      const isSuperAdminEmail = currentUser?.email === 'siphom.yati@gmail.com';

      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (currentUser) {
        // Use onSnapshot for real-time updates to user role/data
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // If super admin email but role is not admin, we can fix it here or just override in state
            setUserData({ 
              uid: docSnap.id, 
              ...data,
              role: isSuperAdminEmail ? 'admin' : (data.role || 'reader')
            } as User);
          } else if (isSuperAdminEmail) {
            // Create a virtual admin user if record doesn't exist yet
            setUserData({
              uid: currentUser.uid,
              name: currentUser.displayName || 'Super Admin',
              email: currentUser.email!,
              role: 'admin',
              createdAt: new Date().toISOString()
            } as User);
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const hasRole = (roles: UserRole[]) => {
    return userData && roles.includes(userData.role);
  };

  const isAdmin = userData?.role === 'admin';
  const isEditor = userData?.role === 'editor' || isAdmin;
  const isReporter = userData?.role === 'reporter' || isEditor;
  const isContributor = isReporter;

  return {
    user,
    userData,
    loading,
    hasRole,
    isAdmin,
    isEditor,
    isReporter,
    isContributor
  };
}

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Use onSnapshot for real-time updates to user role/data
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ uid: docSnap.id, ...docSnap.data() } as User);
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
        
        return () => unsubscribeDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

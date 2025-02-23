'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  email?: string;
  jobTitle?: string;
  industry?: string;
  currentProjects?: string;
  followedCompanies?: Company[];
}

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  followCompany: (company: Company) => Promise<void>;
  unfollowCompany: (cik: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, data);
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const followCompany = async (company: Company) => {
    if (!auth.currentUser) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      followedCompanies: arrayUnion(company)
    });
    setUserProfile(prev => ({
      ...prev,
      followedCompanies: [...(prev?.followedCompanies || []), company]
    }));
  };

  const unfollowCompany = async (cik: string) => {
    if (!auth.currentUser) return;
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      followedCompanies: arrayRemove(userProfile?.followedCompanies?.find(c => c.cik === cik))
    });
    setUserProfile(prev => ({
      ...prev,
      followedCompanies: prev?.followedCompanies?.filter(c => c.cik !== cik)
    }));
  };

  return (
    <UserContext.Provider value={{ userProfile, loading, updateProfile, followCompany, unfollowCompany }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 
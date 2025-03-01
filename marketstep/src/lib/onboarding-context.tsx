'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface Company {
  id: string;
  name: string;
}

interface UserProfile {
  role?: string;
  company?: string;
  industry?: string;
  trackingPurpose?: string;
  trackedCompanies: Company[];
  onboardingComplete: boolean;
}

interface OnboardingContextType {
  userProfile: UserProfile;
  isLoading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addTrackedCompany: (company: Company) => Promise<void>;
  removeTrackedCompany: (companyId: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  trackedCompanies: [],
  onboardingComplete: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from storage or API
  useEffect(() => {
    if (user) {
      // In a real app, you would fetch this from your database
      // For now, we'll use localStorage as a simple example
      const storedProfile = localStorage.getItem(`userProfile_${user.uid}`);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
      setIsLoading(false);
    }
  }, [user]);

  // Save profile changes
  const saveProfile = async (profile: UserProfile) => {
    if (user) {
      // In a real app, you would save this to your database
      localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(profile));
      setUserProfile(profile);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...data };
    await saveProfile(updatedProfile);
  };

  const addTrackedCompany = async (company: Company) => {
    // Check if company already exists
    if (!userProfile.trackedCompanies.some(c => c.id === company.id)) {
      const updatedProfile = {
        ...userProfile,
        trackedCompanies: [...userProfile.trackedCompanies, company]
      };
      await saveProfile(updatedProfile);
    }
  };

  const removeTrackedCompany = async (companyId: string) => {
    const updatedProfile = {
      ...userProfile,
      trackedCompanies: userProfile.trackedCompanies.filter(c => c.id !== companyId)
    };
    await saveProfile(updatedProfile);
  };

  const completeOnboarding = async () => {
    const updatedProfile = {
      ...userProfile,
      onboardingComplete: true
    };
    await saveProfile(updatedProfile);
  };

  return (
    <OnboardingContext.Provider
      value={{
        userProfile,
        isLoading,
        updateProfile,
        addTrackedCompany,
        removeTrackedCompany,
        completeOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 
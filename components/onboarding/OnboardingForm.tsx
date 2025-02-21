'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type OnboardingStep = 'profile' | 'interests' | 'companies';

export function OnboardingForm() {
  const [step, setStep] = useState<OnboardingStep>('profile');
  const { user } = useAuthContext();
  const router = useRouter();
  
  // Profile information
  const [profile, setProfile] = useState({
    jobTitle: '',
    company: '',
    industry: '',
    location: '',
  });

  // Industry interests
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  // Technology interests
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const industries = [
    { id: 'ai-ml', name: 'AI & Machine Learning' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'biotech', name: 'Biotechnology' },
  ];

  const technologies = [
    { id: 'gpt', name: 'GPT & Large Language Models' },
    { id: 'cloud-native', name: 'Cloud Native Technologies' },
    { id: 'quantum', name: 'Quantum Computing' },
    { id: 'web3', name: 'Web3 & DeFi' },
  ];

  const handleProfileSubmit = async () => {
    setStep('interests');
  };

  const handleInterestsSubmit = async () => {
    setStep('companies');
  };

  const handleFinalSubmit = async () => {
    if (!user) return;

    try {
      // Save user profile
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        createdAt: new Date(),
        lastUpdated: new Date(),
      });

      // Save user preferences
      await setDoc(doc(db, 'userPreferences', user.uid), {
        industries: selectedIndustries,
        technologies: selectedTechnologies,
        lastUpdated: new Date(),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Tell us about yourself</h2>
            <Input
              placeholder="Job Title"
              value={profile.jobTitle}
              onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
            />
            <Input
              placeholder="Company"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            />
            <Input
              placeholder="Industry"
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
            <Button onClick={handleProfileSubmit} className="w-full">
              Next
            </Button>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Select your interests</h2>
            <div className="grid grid-cols-2 gap-2">
              {industries.map((industry) => (
                <Button
                  key={industry.id}
                  variant={selectedIndustries.includes(industry.id) ? "default" : "outline"}
                  onClick={() => {
                    setSelectedIndustries(prev =>
                      prev.includes(industry.id)
                        ? prev.filter(id => id !== industry.id)
                        : [...prev, industry.id]
                    );
                  }}
                >
                  {industry.name}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {technologies.map((tech) => (
                <Button
                  key={tech.id}
                  variant={selectedTechnologies.includes(tech.id) ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTechnologies(prev =>
                      prev.includes(tech.id)
                        ? prev.filter(id => id !== tech.id)
                        : [...prev, tech.id]
                    );
                  }}
                >
                  {tech.name}
                </Button>
              ))}
            </div>
            <Button onClick={handleInterestsSubmit} className="w-full">
              Next
            </Button>
          </div>
        );

      case 'companies':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Almost done!</h2>
            <p className="text-gray-500">
              We&apos;ll customize your feed based on your selections.
            </p>
            <Button onClick={handleFinalSubmit} className="w-full">
              Complete Setup
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-center">Welcome to MarketStep</h1>
        <p className="text-gray-500 text-center">Let&apos;s personalize your experience</p>
      </div>
      {renderStep()}
    </div>
  );
} 
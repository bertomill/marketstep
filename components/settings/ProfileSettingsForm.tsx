'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/ui/avatar";
import { useUser } from '@/lib/context/UserContext';
import { X } from 'lucide-react';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  industry?: string;
  currentProjects?: string;
}

export function ProfileSettingsForm() {
  const { user } = useAuthContext();
  const { userProfile, updateProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    industry: '',
    location: '',
    phoneNumber: '',
    timezone: 'America/Detroit',
    show12HourFormat: true,
    currentProjects: '',
  });

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const preferencesDoc = await getDoc(doc(db, 'userPreferences', user.uid));

        if (userDoc.exists()) {
          setProfile(prev => ({
            ...prev,
            ...userDoc.data()
          }));
        }

        if (preferencesDoc.exists()) {
          const prefs = preferencesDoc.data();
          setSelectedIndustries(prefs.industries || []);
          setSelectedTechnologies(prefs.technologies || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      await updateProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle photo change logic here
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="space-y-6">

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile Photo</h2>
            <div className="flex items-center gap-4">
              <UserAvatar user={userProfile} size="lg" />
              <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
                Choose a photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={userProfile?.firstName}
                  className="max-w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={userProfile?.lastName}
                  className="max-w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={userProfile?.phone}
                  className="max-w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={userProfile?.email}
                  className="max-w-full"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Professional Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="jobTitle" className="text-sm font-medium">
                  Job title
                </label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  defaultValue={userProfile?.jobTitle}
                  className="max-w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium">
                  Industry
                </label>
                <Input
                  id="industry"
                  name="industry"
                  defaultValue={userProfile?.industry}
                  className="max-w-full"
                />
              </div>
            </div>
          </div>

          {/* Current Projects & Interests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Projects & Interests</h2>
            <p className="text-sm text-gray-500">
              Tell us about what you&apos;re working on - this helps us tailor information and research to your needs
            </p>
            <div className="space-y-2">
              <textarea
                value={profile.currentProjects}
                onChange={(e) => setProfile({ ...profile, currentProjects: e.target.value })}
                placeholder="E.g., Building a fintech app using AI for fraud detection, Researching quantum computing applications in cryptography..."
                className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preferences</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Select
                  value={profile.timezone}
                  onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Detroit">America/Detroit</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                    {/* Add more timezones as needed */}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="timeFormat"
                  checked={profile.show12HourFormat}
                  onChange={(e) => setProfile({ ...profile, show12HourFormat: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="timeFormat" className="text-sm font-medium">
                  Show times in 12-hour format
                </label>
              </div>
            </div>
          </div>

          {/* Followed Companies Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Companies</h2>
            <p className="text-sm text-muted-foreground">
              Companies you&apos;re following for updates and analysis
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile?.followedCompanies?.map((company) => (
                <div
                  key={company.ticker}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden bg-muted">
                      {/* Company logo can be added here */}
                    </div>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.ticker}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {/* Handle unfollow */}}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
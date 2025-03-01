'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userProfile, updateProfile } = useOnboarding();
  
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    company: userProfile.company || '',
    role: userProfile.role || '',
    industry: userProfile.industry || '',
    bio: userProfile.bio || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update profile in the onboarding context
      updateProfile(formData);
      
      // Show success message
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Your Profile</h1>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="companies">Tracked Companies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-zinc-100 dark:bg-zinc-800"
                  />
                  <p className="text-xs text-zinc-500">Your email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    name="company"
                    value={formData.company} 
                    onChange={handleChange}
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive (C-Suite, VP)</SelectItem>
                      <SelectItem value="manager">Manager / Director</SelectItem>
                      <SelectItem value="analyst">Analyst / Researcher</SelectItem>
                      <SelectItem value="product">Product Manager</SelectItem>
                      <SelectItem value="marketing">Marketing Professional</SelectItem>
                      <SelectItem value="sales">Sales Professional</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => handleSelectChange('industry', value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance & Banking</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="media">Media & Entertainment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    name="bio"
                    value={formData.bio} 
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself"
                    className="w-full min-h-[100px] p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-300"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-4">
                  {isSaved && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Profile saved successfully!
                    </span>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your notification and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-500 dark:text-zinc-400">
                Preference settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="companies">
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Tracked Companies</CardTitle>
              <CardDescription>
                Manage the companies you're tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.trackedCompanies && userProfile.trackedCompanies.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.trackedCompanies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-md">
                      <span>{company.name}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => {
                          const updatedCompanies = userProfile.trackedCompanies.filter((_, i) => i !== index);
                          updateProfile({ trackedCompanies: updatedCompanies });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400">
                  You are not tracking any companies yet. Add companies through the onboarding process or dashboard.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
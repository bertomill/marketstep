'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UserProfileStep() {
  const { userProfile, updateProfile } = useOnboarding();
  const [role, setRole] = useState(userProfile.role || '');
  const [company, setCompany] = useState(userProfile.company || '');
  const [industry, setIndustry] = useState(userProfile.industry || '');

  // Save changes when user moves to next step
  useEffect(() => {
    return () => {
      if (role || company || industry) {
        updateProfile({ role, company, industry });
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          Tell us about yourself
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          This information helps us personalize your experience and provide more relevant insights.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-zinc-700 dark:text-zinc-300">
            What's your role?
          </Label>
          <Select 
            value={role} 
            onValueChange={setRole}
          >
            <SelectTrigger id="role" className="border-zinc-300 dark:border-zinc-700">
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
          <Label htmlFor="company" className="text-zinc-700 dark:text-zinc-300">
            Your company name
          </Label>
          <Input
            id="company"
            placeholder="Enter your company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border-zinc-300 dark:border-zinc-700 focus:ring-zinc-800 dark:focus:ring-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry" className="text-zinc-700 dark:text-zinc-300">
            Your industry
          </Label>
          <Select 
            value={industry} 
            onValueChange={setIndustry}
          >
            <SelectTrigger id="industry" className="border-zinc-300 dark:border-zinc-700">
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
      </div>
    </div>
  );
} 
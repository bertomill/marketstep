'use client';

import { useState } from 'react';
import { useOnboarding } from '@/lib/onboarding-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfileStep } from './user-profile-step';
import { CompanyTrackingStep } from './company-tracking-step';
import { TrackingPurposeStep } from './tracking-purpose-step';
import { OnboardingComplete } from './onboarding-complete';

export function OnboardingModal() {
  const [step, setStep] = useState(1);
  const { completeOnboarding } = useOnboarding();
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome to MarketStep
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Let's set up your account to track innovative activity in your market.
            Step {step} of {totalSteps}
          </CardDescription>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden">
            <div 
              className="bg-zinc-900 dark:bg-zinc-300 h-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="py-4">
          {step === 1 && <UserProfileStep />}
          {step === 2 && <TrackingPurposeStep />}
          {step === 3 && <CompanyTrackingStep />}
          {step === 4 && <OnboardingComplete />}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back
          </Button>
          <Button
            onClick={nextStep}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {step === totalSteps ? 'Complete Setup' : 'Next Step'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
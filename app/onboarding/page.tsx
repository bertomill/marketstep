'use client';

import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen flex items-center justify-center p-4">
        <OnboardingForm />
      </main>
    </ProtectedRoute>
  );
} 
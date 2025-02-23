'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-gray-500">Manage your profile information and preferences</p>
            </div>
            <ProfileSettingsForm />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 
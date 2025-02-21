'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TechFeed } from '@/components/dashboard/TechFeed';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Your Tech Feed</h1>
            <p className="text-gray-500">Stay updated with the latest in tech</p>
          </div>
          <TechFeed />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 
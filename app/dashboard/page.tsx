'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Calendar } from '@/components/dashboard/Calendar';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 sm:p-6 md:p-8">
        <Calendar />
        <ActivityFeed />
      </div>
    </DashboardLayout>
  );
} 
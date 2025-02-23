'use client';

import Link from 'next/link';
import { useUser } from '@/lib/context/UserContext';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { auth } from '@/lib/firebase';

export function NavBar() {
  const { userProfile } = useUser();

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link className="flex items-center" href="/dashboard">
              <span className="text-xl font-bold">MarketStep</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {userProfile?.email && (
              <span className="text-sm text-gray-500">{userProfile.email}</span>
            )}
            <Button onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/settings/profile"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 
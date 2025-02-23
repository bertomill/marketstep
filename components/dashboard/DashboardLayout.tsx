'use client';

import { useUser } from '@/lib/context/UserContext';
import { Button } from '@/components/ui/button';
import { Settings, User, LogOut, Home, Calendar as CalendarIcon, Bell, Beaker, Menu } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  email?: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userProfile } = useUser();
  const pathname = usePathname();

  const handleSignOut = () => {
    auth.signOut();
  };

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: Home
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: CalendarIcon
    },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell
    },
    {
      label: 'Test Lab',
      href: '/dashboard/test',
      icon: Beaker
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link className="flex items-center" href="/dashboard">
                <span className="text-lg sm:text-xl font-bold">MarketStep</span>
              </Link>

              {/* Navigation Items */}
              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 text-sm ${
                        isActive 
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground hover:text-foreground'
                      } transition-colors`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center">
              {/* Mobile Navigation Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2 w-full">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8 sm:h-9 px-2 py-1 border rounded-full hover:shadow-md transition-shadow">
                    <UserAvatar 
                      user={userProfile} 
                      size="sm"
                      className="hidden sm:inline-flex"
                    />
                    <User className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline-block">
                      {userProfile?.firstName || 'Menu'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  {userProfile?.email && (
                    <div className="px-2 py-1.5 text-sm text-gray-500 border-b">
                      {userProfile.email}
                    </div>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="flex items-center gap-2 w-full">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
} 
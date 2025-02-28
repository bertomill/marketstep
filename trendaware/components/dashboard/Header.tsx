'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  SunIcon, 
  MoonIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import Link from 'next/link';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            
            {/* Search */}
            <div className="flex-1 flex items-center md:ml-6">
              <div className="max-w-lg w-full lg:max-w-xs relative">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Theme toggle */}
            <button
              type="button"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
            
            {/* Notifications */}
            <button
              type="button"
              className="p-2 ml-3 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
} 
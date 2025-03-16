'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { FollowedCompaniesList } from './components/FollowedCompaniesList';
import { CompanySearch } from './components/CompanySearch';
import { Loader2, Star, Search, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserFollowedCompanies, FollowedCompany } from '@/lib/userService';

// This is the main page for My Companies
// It allows users to view their followed companies and search for new ones to follow
export default function MyCompaniesPage() {
  // Authentication check
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load user's followed companies
  useEffect(() => {
    async function loadFollowedCompanies() {
      if (user) {
        try {
          setIsLoading(true);
          const companies = await getUserFollowedCompanies(user.uid);
          setFollowedCompanies(companies);
        } catch (error) {
          console.error('Error loading followed companies:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (user) {
      loadFollowedCompanies();
    }
  }, [user]);

  // Handle adding or removing a company from the followed list
  const updateFollowedCompanies = (companies: FollowedCompany[]) => {
    setFollowedCompanies(companies);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't render the page content
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen w-full p-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Companies</h1>
            <p className="text-gray-600">
              Follow companies to keep track of their updates and SEC filings.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Followed companies */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <h2 className="text-xl font-semibold">Followed Companies</h2>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <FollowedCompaniesList 
                    companies={followedCompanies} 
                    onUpdate={updateFollowedCompanies}
                    userId={user.uid}
                  />
                )}
              </div>
            </div>

            {/* Right column - Company search */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <div className="flex items-center mb-4">
                  <Search className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold">Find Companies</h2>
                </div>
                
                <CompanySearch 
                  userId={user.uid}
                  onCompanyFollowed={updateFollowedCompanies} 
                />
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-700 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    Search for companies by name or ticker symbol and click the Follow button 
                    to add them to your followed companies list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
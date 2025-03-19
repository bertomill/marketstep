'use client';

import { useState } from 'react';
import { FollowedCompany, unfollowCompany, getUserFollowedCompanies } from '@/lib/userService';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// This component displays a list of companies that the user is following
// It allows users to unfollow companies and provides links to view SEC filings
// The component is used in the "My Companies" section of the application

type FollowedCompaniesListProps = {
  companies: FollowedCompany[];  // Array of followed companies
  onUpdate: (companies: FollowedCompany[]) => void;  // Callback to update the parent component
  userId: string;  // User's ID for API calls
};

export function FollowedCompaniesList({ companies, onUpdate, userId }: FollowedCompaniesListProps) {
  // State to track which company is currently being unfollowed
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Handle unfollowing a company
  // This function:
  // 1. Sets loading state
  // 2. Makes API call to unfollow company
  // 3. Fetches updated list of followed companies
  // 4. Updates parent component with new list
  // 5. Handles errors and resets loading state
  const handleUnfollow = async (company: FollowedCompany) => {
    try {
      setIsLoading(company.ticker);
      await unfollowCompany(userId, company);
      
      // Get updated list of followed companies
      const updatedCompanies = await getUserFollowedCompanies(userId);
      onUpdate(updatedCompanies);
    } catch (error) {
      console.error('Error unfollowing company:', error);
    } finally {
      setIsLoading(null);
    }
  };

  // If no companies are being followed, show a helpful message
  // This message guides users on how to add companies
  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>You are not following any companies yet.</p>
        <p className="mt-2 text-sm">Use the search to find and follow companies.</p>
      </div>
    );
  }

  // Display the list of followed companies
  // Each company shows:
  // - Ticker symbol
  // - Company name
  // - Link to SEC filings
  // - Unfollow button with loading state
  return (
    <ul className="divide-y">
      {companies.map((company) => (
        <li key={company.ticker} className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{company.ticker}</div>
              <div className="text-sm text-gray-600">{company.name}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href={`/sec-filings?cik=${company.cik}&ticker=${company.ticker}&name=${company.name}`}
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink size={16} />
              </Link>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                onClick={() => handleUnfollow(company)}
                disabled={isLoading === company.ticker}
              >
                {isLoading === company.ticker ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <X size={16} />
                )}
                <span className="sr-only">Unfollow {company.ticker}</span>
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
'use client';

import { useState } from 'react';
import { Search, AlertCircle, Sparkles, Database, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { followCompany, getUserFollowedCompanies, isFollowingCompany, FollowedCompany } from '@/lib/userService';

// This component allows users to search for companies and follow them
type Company = {
  ticker: string;
  name: string;
  cik: string;
  description?: string;
  sector?: string;
  fromGemini?: boolean;
  fromFallback?: boolean;
};

type CompanySearchProps = {
  userId: string;
  onCompanyFollowed: (companies: FollowedCompany[]) => void;
};

// Popular companies for quick selection
const POPULAR_COMPANIES = [
  { 
    ticker: 'AAPL', 
    name: 'Apple Inc.', 
    cik: '0000320193',
    description: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
    sector: 'Technology'
  },
  { 
    ticker: 'MSFT', 
    name: 'Microsoft Corporation', 
    cik: '0000789019',
    description: 'Develops, licenses, and supports software, services, devices, and solutions worldwide.',
    sector: 'Technology'
  },
  { 
    ticker: 'GOOGL', 
    name: 'Alphabet Inc.', 
    cik: '0001652044',
    description: 'Provides online advertising services, search engine, cloud computing, software, and hardware.',
    sector: 'Technology'
  },
  { 
    ticker: 'AMZN', 
    name: 'Amazon.com, Inc.', 
    cik: '0001018724',
    description: 'Engages in the retail sale of consumer products and subscriptions through online and physical stores.',
    sector: 'Consumer Cyclical'
  },
  { 
    ticker: 'META', 
    name: 'Meta Platforms, Inc.', 
    cik: '0001326801',
    description: 'Develops products that enable people to connect and share through mobile devices, personal computers, and other surfaces.',
    sector: 'Communication Services'
  },
];

export function CompanySearch({ userId, onCompanyFollowed }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingGemini, setUsingGemini] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Check if a company is being followed by the user
  const checkFollowingStatus = async (companies: Company[]) => {
    const statuses: Record<string, boolean> = {};
    
    for (const company of companies) {
      statuses[company.ticker] = await isFollowingCompany(userId, company.ticker);
    }
    
    setFollowingStatus(statuses);
  };

  // This function searches for companies when the user types
  async function handleSearch() {
    if (searchTerm.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setUsingGemini(false);
    setUsingFallback(false);
    
    try {
      const response = await fetch(`/sec-filings/api/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got an error response
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResults(data);
      
      // Check the source of the results
      if (data.length > 0) {
        setUsingGemini(data[0].fromGemini === true);
        setUsingFallback(data[0].fromFallback === true);
        await checkFollowingStatus(data);
      }
      
    } catch (error) {
      console.error('Error searching companies:', error);
      setError('Failed to search companies. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle when user presses Enter in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Show popular companies
  const handleShowPopular = async () => {
    setResults(POPULAR_COMPANIES);
    await checkFollowingStatus(POPULAR_COMPANIES);
  };

  // Handle following a company
  const handleFollowCompany = async (company: Company) => {
    try {
      setFollowingLoading(company.ticker);
      
      // Convert to FollowedCompany type and follow
      const followedCompany: FollowedCompany = {
        ticker: company.ticker,
        name: company.name,
        cik: company.cik
      };
      
      await followCompany(userId, followedCompany);
      
      // Update following status for this company
      setFollowingStatus(prev => ({
        ...prev,
        [company.ticker]: true
      }));
      
      // Get updated list of followed companies and notify parent
      const updatedCompanies = await getUserFollowedCompanies(userId);
      onCompanyFollowed(updatedCompanies);
    } catch (error) {
      console.error('Error following company:', error);
    } finally {
      setFollowingLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by company name or ticker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={handleSearch}
          >
            <Search size={18} />
          </button>
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Popular companies:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_COMPANIES.map(company => (
            <Button 
              key={company.ticker} 
              variant="outline" 
              size="sm"
              onClick={handleShowPopular}
            >
              {company.ticker}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center text-red-500 mb-4 bg-red-50 p-3 rounded-md border border-red-200">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data source indicators */}
      {usingGemini && results.length > 0 && (
        <div className="flex items-center text-sm bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-md border border-blue-100 mb-4">
          <Sparkles size={16} className="mr-2 text-blue-500" />
          <div>
            <span className="font-medium text-blue-700">Powered by Google Gemini AI</span>
            <p className="text-gray-600 mt-1">
              Company information is generated using artificial intelligence and may require verification.
            </p>
          </div>
        </div>
      )}

      {usingFallback && results.length > 0 && (
        <div className="flex items-center text-sm bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
          <Database size={16} className="mr-2 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Using sample company data</span>
            <p className="text-gray-600 mt-1">
              Gemini AI is currently unavailable. Showing results from our local database.
              <br />
              <span className="text-blue-600">
                To enable AI-powered search, add your Gemini API key to the .env.local file as NEXT_PUBLIC_GEMINI_API_KEY.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="border rounded-md overflow-hidden shadow-sm">
          <ul className="divide-y">
            {results.map((company) => (
              <li 
                key={company.cik} 
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <div className="font-medium text-lg">{company.ticker} - {company.name}</div>
                    {company.sector && (
                      <div className="text-sm text-blue-600 mt-1">
                        Industry: {company.sector}
                      </div>
                    )}
                    {company.description && (
                      <div className="text-sm text-gray-700 mt-1">
                        {company.description}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">CIK: {company.cik}</div>
                  </div>
                  <Button 
                    variant={followingStatus[company.ticker] ? "secondary" : "default"}
                    size="sm"
                    disabled={followingLoading === company.ticker || followingStatus[company.ticker]}
                    onClick={() => handleFollowCompany(company)}
                  >
                    {followingLoading === company.ticker ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Star className="h-4 w-4 mr-2" />
                    )}
                    {followingStatus[company.ticker] ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
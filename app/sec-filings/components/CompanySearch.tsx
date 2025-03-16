'use client';

import { useState } from 'react';
import { Search, AlertCircle, Sparkles, Database, History } from 'lucide-react';

// This component allows users to search for companies
// It has a search input and displays results in a list
type Company = {
  ticker: string;
  name: string;
  cik: string;
  fromGemini?: boolean;
  fromFallback?: boolean;
};

type CompanySearchProps = {
  onCompanySelect: (company: Company) => void;
};

// Popular companies for quick selection
const POPULAR_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'META', name: 'Meta' },
];

export function CompanySearch({ onCompanySelect }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingGemini, setUsingGemini] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Company[]>([]);

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
      }
      
    } catch (error) {
      console.error('Error searching companies:', error);
      setError('Failed to search companies. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  // This function handles selecting a company
  function handleCompanySelect(company: Company) {
    // Add to recent searches if not already there
    if (!recentSearches.some(c => c.cik === company.cik)) {
      setRecentSearches(prev => [company, ...prev].slice(0, 5));
    }
    
    onCompanySelect(company);
    setSearchTerm('');
    setResults([]);
  }

  // This function handles quick search for popular companies
  function handleQuickSearch(company: { ticker: string; name: string }) {
    setSearchTerm(`${company.ticker} ${company.name}`);
    handleSearch();
  }

  return (
    <div className="mb-8">
      {/* Search input */}
      <div className="flex items-center border rounded-md overflow-hidden mb-4 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-500">
        <input
          type="text"
          placeholder="Search for a company (e.g., AAPL, Microsoft)"
          className="flex-1 px-4 py-3 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          className="bg-blue-500 text-white p-3 hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          onClick={handleSearch}
          disabled={isLoading || searchTerm.length < 2}
          aria-label="Search for company"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Quick search buttons */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-500 mr-2">Popular companies:</span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COMPANIES.map((company) => (
              <button
                key={company.ticker}
                onClick={() => handleQuickSearch(company)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors"
              >
                {company.ticker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <History size={14} className="mr-1 text-gray-500" />
            <span className="text-sm text-gray-500">Recent searches:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((company) => (
              <button
                key={company.cik}
                onClick={() => handleCompanySelect(company)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center transition-colors"
              >
                <span className="font-medium">{company.ticker}</span>
                <span className="mx-1">-</span>
                <span>{company.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center text-gray-500 mb-4">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          Searching for company information...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center text-red-500 mb-4 bg-red-50 p-3 rounded-md border border-red-200">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data source indicators */}
      {usingGemini && results.length > 0 && (
        <div className="flex items-center text-sm text-blue-600 mb-2">
          <Sparkles size={14} className="mr-1" />
          Company information provided by Google Gemini AI
        </div>
      )}

      {usingFallback && results.length > 0 && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Database size={14} className="mr-1" />
          Using sample company data (Gemini API not available)
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="border rounded-md overflow-hidden shadow-sm">
          <ul className="divide-y">
            {results.map((company) => (
              <li 
                key={company.cik} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleCompanySelect(company)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg">{company.ticker} - {company.name}</div>
                    <div className="text-sm text-gray-500">CIK: {company.cik}</div>
                  </div>
                  <button 
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    aria-label="Select company"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {!isLoading && searchTerm.length >= 2 && results.length === 0 && !error && (
        <div className="text-center py-6 text-gray-500 border rounded-md bg-gray-50">
          <Search size={32} className="mx-auto mb-2 opacity-30" />
          <p>No companies found matching &quot;{searchTerm}&quot;</p>
          <p className="text-sm mt-1">Try searching for a different company name or ticker symbol</p>
        </div>
      )}
    </div>
  );
} 
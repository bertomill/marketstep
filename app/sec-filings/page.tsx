'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { CompanySearch } from './components/CompanySearch';
import { FilingsList } from './components/FilingsList';
import { Info, FileText, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

// This is the main page for SEC filings
// It allows users to search for companies and view their SEC filings
export default function SecFilingsPage() {
  // Authentication check
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const [selectedCompany, setSelectedCompany] = useState<{
    ticker: string;
    name: string;
    cik: string;
    fromGemini?: boolean;
    fromFallback?: boolean;
  } | null>(null);

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
      <main className="ml-64 flex-1 min-h-screen w-full">
        <div className="p-6 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">SEC EDGAR Filings</h1>
            <div className="flex items-start gap-2 text-gray-600">
              <Info size={18} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Search for a company to view its recent SEC filings. The search uses Google Gemini AI to find company information including CIK numbers.
                You can search by company name or ticker symbol.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText size={20} className="mr-2 text-blue-500" />
                Company Search
              </h2>
              <CompanySearch onCompanySelect={setSelectedCompany} />
            </section>

            {selectedCompany && (
              <section className="border-t pt-6">
                <FilingsList company={selectedCompany} />
              </section>
            )}

            {!selectedCompany && (
              <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium mb-3">About SEC EDGAR</h3>
                <p className="mb-4">
                  The SEC&apos;s Electronic Data Gathering, Analysis, and Retrieval (EDGAR) database is the primary system for companies and others submitting documents under the Securities Act of 1933, the Securities Exchange Act of 1934, and other statutes.
                </p>
                <p className="mb-4">
                  All publicly traded companies in the United States are required to file registration statements, periodic reports, and other forms electronically through EDGAR.
                </p>
                <div className="flex justify-end">
                  <a 
                    href="https://www.sec.gov/edgar/about" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    Learn more about EDGAR <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </section>
            )}
          </div>

          <footer className="mt-12 pt-6 border-t text-sm text-gray-500">
            <p>
              This feature uses the Google Gemini API to search for company information and generates sample filing data for demonstration purposes.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
} 
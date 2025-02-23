'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthContext } from '@/lib/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search } from 'lucide-react';

interface Company {
  cik: string;
  name: string;
  ticker: string;
}

interface Filing {
  accessionNumber: string;
  filingDate: string;
  form: string;
  description: string;
  company: string;
  primaryDocument: string;
  cik: string;
  selected?: boolean;
  url?: string;
  fetchUrl?: string;
}

const sectionStyles = {
  container: "mb-8",
  heading: "text-xl font-semibold mb-4 text-gray-800 border-b pb-2",
  subheading: "text-lg font-medium mb-3 text-gray-700",
  metric: "font-mono text-sm",
  highlight: "bg-yellow-50 p-2 rounded-md my-2 border-l-4 border-yellow-400",
  table: "min-w-full divide-y divide-gray-200 my-4",
  tableHeader: "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50",
  tableCell: "px-4 py-2 whitespace-nowrap text-sm text-gray-500",
  tableRow: "hover:bg-gray-50",
  bold: "font-semibold text-gray-900"
};

type TextAlign = 'left' | 'right' | 'center';

// First, add debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export function DocFeed() {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [filings, setFilings] = useState<Filing[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    analysis: string;
    documentCount: number;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    fetchingDocuments: false,
    analyzingDocuments: false,
    progress: 0,
    currentStep: ''
  });

  // Define UserProfile type
  interface UserProfile {
    currentProjects?: string;
    industry?: string;
    jobTitle?: string;
    firstName?: string;
  }

  useEffect(() => {
    loadUserProfile();
  }, [user]); // Add useEffect to call loadUserProfile when component mounts

  // Load user profile for context-aware analysis
  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/sec/search?query=${encodeURIComponent(term)}`);
      const data = await response.json();
      setSearchResults(data.companies);
    } catch (error) {
      console.error('Error searching companies:', error);
    }
  }, 300); // 300ms delay

  // Update the input handler
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Fetch recent filings for selected companies
  const fetchFilings = async () => {
    setLoading(true);
    try {
      const allFilings: Filing[] = [];
      
      for (const company of selectedCompanies) {
        const paddedCik = company.cik.padStart(10, '0');
        // First fetch the company's submission history
        const response = await fetch(
          `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
          {
            headers: {
              'User-Agent': 'MarketStep contact@marketstep.com'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch filings for ${company.name}`);
        }

        const data = await response.json();
        const recentFilings = data.filings.recent;
        
        // Get the latest 3 filings that are 10-K or 10-Q reports
        let count = 0;
        for (let i = 0; i < recentFilings.form.length && count < 3; i++) {
          if (recentFilings.form[i] === '10-K' || recentFilings.form[i] === '10-Q') {
            const formattedAccession = recentFilings.accessionNumber[i].replace(/-/g, '');
            // Construct the correct URLs for both viewing and fetching
            const viewUrl = `https://www.sec.gov/ix?doc=/Archives/edgar/data/${company.cik}/${formattedAccession}/${recentFilings.primaryDocument[i]}`;
            const fetchUrl = `https://www.sec.gov/Archives/edgar/data/${company.cik}/${formattedAccession}/${recentFilings.primaryDocument[i]}`;
            
            allFilings.push({
              accessionNumber: recentFilings.accessionNumber[i],
              filingDate: recentFilings.filingDate[i],
              form: recentFilings.form[i],
              description: `${recentFilings.form[i]} - ${recentFilings.reportDate[i]}`,
              company: company.name,
              primaryDocument: recentFilings.primaryDocument[i],
              cik: company.cik,
              url: viewUrl,
              fetchUrl: fetchUrl,  // Add this new property
              selected: false
            });
            count++;
          }
        }
      }
      
      setFilings(allFilings);
    } catch (error) {
      console.error('Error fetching filings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analyze selected documents
  const analyzeDocuments = async () => {
    const selectedDocs = filings.filter(f => f.selected);
    if (selectedDocs.length === 0) return;

    setLoadingStates(prev => ({
      ...prev,
      analyzingDocuments: true,
      progress: 0,
      currentStep: 'Starting analysis...'
    }));

    try {
      const documentsContent = await Promise.all(
        selectedDocs.map(async (filing, index) => {
          // Use the SEC API route to fetch the document content
          const response = await fetch(`/api/sec/filing?cik=${filing.cik}&accessionNumber=${filing.accessionNumber}&form=${filing.primaryDocument}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch filing content for ${filing.company}`);
          }
          const data = await response.json();
          
          setLoadingStates(prev => ({
            ...prev,
            progress: Math.min(10 + ((index + 1) / selectedDocs.length) * 40, 50),
            currentStep: `Fetching document ${index + 1} of ${selectedDocs.length}...`
          }));

          return {
            content: data.content,
            company: filing.company,
            date: filing.filingDate,
            form: filing.form,
            url: filing.url
          };
        })
      );

      // Update progress for analysis phase
      setLoadingStates(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'Analyzing documents with AI...'
      }));

      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: documentsContent,
          userContext: {
            interests: userProfile?.currentProjects,
            industry: userProfile?.industry,
            jobTitle: userProfile?.jobTitle,
            firstName: userProfile?.firstName
          }
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze documents');
      }

      setLoadingStates(prev => ({
        ...prev,
        progress: 90,
        currentStep: 'Finalizing analysis...'
      }));

      const analysisResult = await analysisResponse.json();
      setAnalysis(analysisResult);

      setLoadingStates(prev => ({
        ...prev,
        progress: 100,
        currentStep: 'Analysis complete!'
      }));
    } catch (error) {
      console.error('Error analyzing documents:', error);
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({
          ...prev,
          analyzingDocuments: false
        }));
      }, 1000); // Keep the completion message visible briefly
    }
  };

  // Helper function to convert markdown table to JSX
  const renderTable = (tableText: string) => {
    const rows = tableText.split('\n').filter(row => row.trim());
    const headers = rows[0].split('|').map(cell => cell.trim()).filter(Boolean);
    const alignments = rows[1]?.split('|').map(cell => {
      if (cell.includes(':--')) return 'text-left';
      if (cell.includes('--:')) return 'text-right';
      if (cell.includes(':-:')) return 'text-center';
      return 'text-left';
    }).filter(Boolean);
    const dataRows = rows.slice(2);

    return (
      <div className="overflow-x-auto">
        <table className={sectionStyles.table}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className={sectionStyles.tableHeader}
                  style={{ textAlign: alignments[i] as TextAlign }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {dataRows.map((row, i) => (
              <tr key={i} className={sectionStyles.tableRow}>
                {row.split('|')
                  .map(cell => cell.trim())
                  .filter(Boolean)
                  .map((cell, j) => (
                    <td 
                      key={j} 
                      className={sectionStyles.tableCell}
                      style={{ textAlign: alignments[j] as TextAlign }}
                    >
                      {cell}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper function to process bold text
  const processBoldText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={index} className={sectionStyles.bold}>
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="relative">
            <div className="flex items-center h-12 rounded-lg border bg-gray-50 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <div className="flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="flex-1 h-full border-0 bg-transparent px-4 text-base placeholder:text-gray-500 focus-visible:ring-0"
                placeholder="Search companies by name or ticker (e.g., AAPL, Tesla)..."
                value={searchTerm}
                onChange={handleSearchInput}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-lg border shadow-lg z-10">
                <div className="py-2">
                  {searchResults.map((company) => (
                    <button
                      key={company.cik}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => {
                        if (!selectedCompanies.some(c => c.cik === company.cik)) {
                          setSelectedCompanies(prev => [...prev, company]);
                        }
                        setSearchResults([]);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium min-w-[80px]">{company.ticker}</span>
                        <span className="text-gray-600">{company.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">Add</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Selected Companies */}
        {selectedCompanies.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Selected Companies</h3>
              <Button onClick={fetchFilings} disabled={loading}>
                Fetch Recent Filings
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCompanies.map((company) => (
                <Badge key={company.cik} variant="secondary">
                  {company.name}
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedCompanies(prev => 
                      prev.filter(c => c.cik !== company.cik)
                    )}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filings List */}
        {filings.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Available Documents</h3>
                  <Button onClick={analyzeDocuments} disabled={loadingStates.analyzingDocuments}>
                    Analyze Selected
                  </Button>
                </div>
                <div className="space-y-2">
                  {filings.map((filing, index) => (
                    <div key={filing.accessionNumber} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        checked={filing.selected}
                        onCheckedChange={(checked) => {
                          setFilings(prev => prev.map((f, i) => 
                            i === index ? { ...f, selected: !!checked } : f
                          ));
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{filing.company}</div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500">
                            {filing.form} - {new Date(filing.filingDate).toLocaleDateString()}
                          </div>
                          <a 
                            href={filing.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            View on SEC
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">AI Analysis</h3>
                <Badge variant="outline">
                  {analysis.documentCount} Document{analysis.documentCount !== 1 ? 's' : ''} Analyzed
                </Badge>
              </div>
              <div className="prose max-w-none">
                <div className="space-y-8">
                  {analysis.analysis.split('\n\n').map((section, index) => {
                    // Check if it's a table
                    if (section.includes('|') && section.includes('\n')) {
                      return (
                        <div key={index} className="my-6">
                          {renderTable(section)}
                        </div>
                      );
                    }
                    
                    // Check if it's a heading
                    if (section.startsWith('#')) {
                      return (
                        <div key={index} className={sectionStyles.container}>
                          <h3 className={sectionStyles.heading}>
                            {processBoldText(section.replace(/^#+\s/, ''))}
                          </h3>
                        </div>
                      );
                    }
                    
                    // Check if it's a metric or data point
                    if (section.match(/[\d%$]/)) {
                      return (
                        <div key={index} className={sectionStyles.metric}>
                          {processBoldText(section)}
                        </div>
                      );
                    }
                    
                    // Check if it's a highlight/insight
                    if (section.toLowerCase().includes('key insight') || 
                        section.toLowerCase().includes('highlight')) {
                      return (
                        <div key={index} className={sectionStyles.highlight}>
                          {processBoldText(section)}
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="text-gray-600 mb-4">
                        {processBoldText(section)}
                      </p>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loadingStates.analyzingDocuments && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{loadingStates.currentStep}</div>
                  <div className="text-sm text-gray-500">{loadingStates.progress}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingStates.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
} 
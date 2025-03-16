'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, FileIcon, Filter, Download, Info, ExternalLink, AlertTriangle } from 'lucide-react';

// This component shows a list of SEC filings for a selected company
type Company = {
  ticker: string;
  name: string;
  cik: string;
  fromGemini?: boolean;
  fromFallback?: boolean;
};

type Filing = {
  id: string;
  form: string;
  filingDate: string;
  reportDate: string;
  description: string;
  documentUrl: string;
};

type FilingsListProps = {
  company: Company;
};

// Common SEC form types with descriptions
const FORM_DESCRIPTIONS: Record<string, string> = {
  '10-K': 'Annual report with comprehensive overview of the company\'s business and financial condition',
  '10-Q': 'Quarterly report with unaudited financial statements and operation details',
  '8-K': 'Current report to announce major events that shareholders should know about',
  'S-1': 'Initial registration form for new securities',
  '4': 'Statement of changes in beneficial ownership (insider trading)',
  'DEF 14A': 'Definitive proxy statement with information for shareholder voting decisions',
  '13F-HR': 'Quarterly report of equity holdings filed by institutional investment managers',
  '424B2': 'Prospectus filing under Rule 424(b)(2)',
  '6-K': 'Report of foreign private issuer pursuant to Rules 13a-16 and 15d-16',
  'SC 13G': 'Schedule 13G - Beneficial ownership report',
  'SC 13D': 'Schedule 13D - Beneficial ownership report (for activist investors)',
  'DEFA14A': 'Definitive additional proxy soliciting materials',
  'PX14A6G': 'Notice of exempt solicitation',
  'SD': 'Specialized Disclosure Report',
  'FWP': 'Filing of certain prospectuses and communications in connection with business combination transactions',
};

export function FilingsList({ company }: FilingsListProps) {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [filteredFilings, setFilteredFilings] = useState<Filing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formFilter, setFormFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showFormInfo, setShowFormInfo] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // This function gets the filings when a company is selected
  useEffect(() => {
    async function fetchFilings() {
      setIsLoading(true);
      setError(null);
      setUsingSampleData(false);
      
      try {
        const response = await fetch(`/sec-filings/api/filings?cik=${company.cik}`);
        if (!response.ok) throw new Error('Failed to fetch filings');
        const data = await response.json();
        
        // Check if we got an error response
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Check if we're using sample data (sample data IDs start with "filing-")
        if (data.length > 0 && data[0].id.startsWith('filing-')) {
          setUsingSampleData(true);
        }
        
        setFilings(data);
        setFilteredFilings(data);
      } catch (error) {
        console.error('Error fetching filings:', error);
        setError('Failed to load filings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilings();
  }, [company.cik]);

  // This function applies filters to the filings
  useEffect(() => {
    let result = [...filings];
    
    // Apply form type filter
    if (formFilter !== 'all') {
      result = result.filter(filing => filing.form === formFilter);
    }
    
    // Apply year filter
    if (yearFilter !== 'all') {
      const year = parseInt(yearFilter);
      result = result.filter(filing => {
        // Safely parse the date
        const date = safelyParseDate(filing.filingDate);
        return date ? date.getFullYear() === year : false;
      });
    }
    
    setFilteredFilings(result);
  }, [filings, formFilter, yearFilter]);

  // Safely parse a date string, returning null if invalid
  function safelyParseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    // Check if date is valid
    return isNaN(date.getTime()) ? null : date;
  }

  // This function formats dates to be more readable
  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = safelyParseDate(dateString);
    if (!date) return dateString; // Return the original string if parsing fails
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get unique form types and years for filters
  const formTypes = ['all', ...new Set(filings.map(filing => filing.form))];
  
  // Safely extract years from filing dates
  const years = ['all', ...new Set(filings
    .map(filing => {
      const date = safelyParseDate(filing.filingDate);
      return date ? date.getFullYear().toString() : null;
    })
    .filter(Boolean) as string[]
  )].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return parseInt(b) - parseInt(a);
  });

  // Get the SEC company page URL
  const secCompanyUrl = `https://www.sec.gov/edgar/browse/?CIK=${company.cik.replace(/^0+/, '')}`;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          {company.ticker} - {company.name}
          {company.fromGemini && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Gemini AI
            </span>
          )}
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">CIK: {company.cik}</p>
          <a 
            href={secCompanyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            View on SEC.gov <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>

      {usingSampleData && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800 flex items-start">
          <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Using sample filing data</p>
            <p className="text-xs mt-1">
              We couldn&apos;t connect to the SEC EDGAR API, so we&apos;re showing sample data for demonstration purposes.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          <span className="text-sm font-medium mr-2">Filters:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="form-filter" className="text-sm text-gray-600">Form:</label>
          <select 
            id="form-filter"
            className="border rounded px-2 py-1 text-sm"
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
          >
            {formTypes.map(form => (
              <option key={form} value={form}>
                {form === 'all' ? 'All Forms' : form}
              </option>
            ))}
          </select>
          
          <button 
            className="text-blue-500 hover:text-blue-700"
            onClick={() => setShowFormInfo(!showFormInfo)}
          >
            <Info size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="year-filter" className="text-sm text-gray-600">Year:</label>
          <select 
            id="year-filter"
            className="border rounded px-2 py-1 text-sm"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? 'All Years' : year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form type information */}
      {showFormInfo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium mb-2 text-blue-800">Common SEC Form Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {Object.entries(FORM_DESCRIPTIONS).map(([form, description]) => (
              <div key={form} className="flex">
                <span className="font-medium mr-2 text-blue-700">{form}:</span>
                <span className="text-gray-700">{description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading filings from SEC EDGAR...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredFilings.length === 0 && (
        <div className="text-center py-8 text-gray-500 border rounded-md">
          <FileIcon size={48} className="mx-auto mb-4 opacity-30" />
          {filings.length > 0 ? (
            <p>No filings match the selected filters. Try changing your filters.</p>
          ) : (
            <p>No filings found for this company.</p>
          )}
        </div>
      )}

      {filteredFilings.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 mb-2">
            Showing {filteredFilings.length} {filteredFilings.length === 1 ? 'filing' : 'filings'}
            {formFilter !== 'all' && ` of type ${formFilter}`}
            {yearFilter !== 'all' && ` from ${yearFilter}`}
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filing Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFilings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">{filing.form}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{filing.description}</div>
                      {FORM_DESCRIPTIONS[filing.form] && (
                        <div className="text-xs text-gray-500 mt-1">{FORM_DESCRIPTIONS[filing.form]}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(filing.filingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(filing.reportDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={filing.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                      >
                        <Download size={14} className="mr-1" />
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
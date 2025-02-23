'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeFilingWithAI } from '@/lib/utils/aiAnalysis';
import { Spinner } from "@/components/ui/spinner";
import { NavBar } from '@/components/layout/NavBar';

interface Company {
  name: string;
  cik: string;
  sector: string;
}

interface TrendAnalysis {
  company: string;
  date: string;
  technologies: string[];
  summary: string;
  riskFactors: string;
  opportunities: string;
}

interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
  primaryDocDescription: string;
}

interface SECApiResponse {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  fiscalYearEnd: string;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
  };
}

// Helper function to parse SEC filings
function parseFilings(data: SECApiResponse): SECFiling[] {
  const { filings } = data;
  const { recent } = filings;
  
  return recent.accessionNumber.map((accession, index) => ({
    accessionNumber: accession,
    filingDate: recent.filingDate[index],
    reportDate: recent.reportDate[index],
    form: recent.form[index],
    primaryDocument: recent.primaryDocument[index],
    primaryDocDescription: recent.primaryDocDescription[index]
  }));
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&#160;/g, ' ') // Replace &#160; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/Item\s+\d+[A-Z]?\./g, '\n$&\n') // Add newlines around Item markers
    .replace(/([.!?])\s+/g, '$1\n') // Add newlines after sentences
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

async function fetchFilingContent(accessionNumber: string, primaryDocument: string, cik: string) {
  const formattedAccession = accessionNumber.replace(/-/g, '');
  const secUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${formattedAccession}/${primaryDocument}`;
  
  try {
    // Use our API route instead of direct SEC access
    const response = await fetch(`/api/sec?url=${encodeURIComponent(secUrl)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch filing: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.content;
    
    // Extract relevant sections
    const sections = {
      riskFactors: extractSection(text, 'Item 1A', 'Risk Factors'),
      mdAndA: extractSection(text, 'Item 7', "Management's Discussion and Analysis"),
      business: extractSection(text, 'Item 1', 'Business')
    };

    return sections;
  } catch (error) {
    console.error('Error fetching filing:', error);
    throw error;
  }
}

function extractSection(text: string, itemNumber: string, sectionName: string): string {
  const patterns = [
    `${itemNumber}. ${sectionName}`,
    `${itemNumber}. ${sectionName.toUpperCase()}`,
    `ITEM ${itemNumber}. ${sectionName.toUpperCase()}`,
    `ITEM ${itemNumber}. ${sectionName}`
  ];

  let startIndex = -1;
  for (const pattern of patterns) {
    startIndex = text.indexOf(pattern);
    if (startIndex !== -1) break;
  }

  if (startIndex === -1) return 'Section not found';

  // Look for the next section marker
  const nextItemMatch = text.slice(startIndex + 100).match(/ITEM \d+[A-Z]?\./i);
  const endIndex = nextItemMatch 
    ? startIndex + 100 + nextItemMatch.index! 
    : text.length;

  return text.slice(startIndex, endIndex);
}

export function TechTrendAnalyzer() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [secData, setSecData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean
  }>({
    business: false,
    riskFactors: false,
    mdAndA: false
  });
  const [aiLoading, setAiLoading] = useState(false);

  // Expanded company list by sector
  const companies: Record<string, Company[]> = {
    'AI & Machine Learning': [
      { name: 'NVIDIA', cik: '0001045810', sector: 'AI & Machine Learning' },
      { name: 'Google', cik: '0001652044', sector: 'AI & Machine Learning' },
      { name: 'Microsoft', cik: '0000789019', sector: 'AI & Machine Learning' },
    ],
    'Cloud Computing': [
      { name: 'Amazon', cik: '0001018724', sector: 'Cloud Computing' },
      { name: 'Salesforce', cik: '0001108524', sector: 'Cloud Computing' },
    ],
    'Cybersecurity': [
      { name: 'Crowdstrike', cik: '0001535527', sector: 'Cybersecurity' },
      { name: 'Palo Alto Networks', cik: '0001327567', sector: 'Cybersecurity' },
    ],
    'Semiconductors': [
      { name: 'AMD', cik: '0000002488', sector: 'Semiconductors' },
      { name: 'Intel', cik: '0000050863', sector: 'Semiconductors' },
    ]
  };

  const fetchSECData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        selectedCompanies.map(async (cik) => {
          const paddedCik = cik.padStart(10, '0');
          const response = await fetch(
            `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
            {
              headers: {
                'User-Agent': 'MarketStep contact@marketstep.com'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`SEC API error: ${response.statusText}`);
          }

          const data: SECApiResponse = await response.json();
          const filings = parseFilings(data);
          const latest10K = filings.find(f => f.form === '10-K');

          if (!latest10K) {
            throw new Error('No recent 10-K filing found');
          }

          // Fetch the actual filing content
          const secResponse = await fetch(`/api/sec?url=${encodeURIComponent(
            `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${latest10K.accessionNumber.replace(/-/g, '')}/${latest10K.primaryDocument}`
          )}`);

          if (!secResponse.ok) {
            throw new Error('Failed to fetch filing content');
          }

          const secData = await secResponse.json();
          
          if (!secData.content) {
            throw new Error('No content in SEC response');
          }

          const sections = {
            business: cleanHtml(extractSection(secData.content, 'Item 1', 'Business')),
            riskFactors: cleanHtml(extractSection(secData.content, 'Item 1A', 'Risk Factors')),
            mdAndA: cleanHtml(extractSection(secData.content, 'Item 7', "Management's Discussion"))
          };

          return {
            company: Object.values(companies).flat()
              .find(c => c.cik === cik)?.name || data.name,
            date: latest10K.filingDate,
            sections,
            filing: latest10K
          };
        })
      );

      setSecData(results);
    } catch (error) {
      console.error('Error fetching SEC data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!secData?.[0]?.sections) return;
    
    setAiLoading(true);
    try {
      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: secData[0].sections })
      });

      if (!aiResponse.ok) {
        throw new Error('AI analysis failed');
      }

      const aiResult = await aiResponse.json();
      setAiAnalysis(aiResult);
    } catch (error) {
      console.error('Error in AI analysis:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <NavBar />
      <div className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Tech Trend Analyzer</h2>
          <p className="text-gray-600">
            Select companies to analyze their technology investments and trends
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(companies).map(([sector, sectorCompanies]) => (
            <div key={sector} className="space-y-2">
              <h3 className="text-lg font-semibold">{sector}</h3>
              <div className="grid grid-cols-2 gap-4">
                {sectorCompanies.map((company) => (
                  <div key={company.cik} className="flex items-center space-x-2">
                    <Checkbox
                      id={company.cik}
                      checked={selectedCompanies.includes(company.cik)}
                      onCheckedChange={(checked) => {
                        setSelectedCompanies(prev =>
                          checked
                            ? [...prev, company.cik]
                            : prev.filter(cik => cik !== company.cik)
                        );
                      }}
                    />
                    <label htmlFor={company.cik}>{company.name}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={fetchSECData} 
          disabled={loading || selectedCompanies.length === 0}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner /> Fetching SEC Data...
            </span>
          ) : (
            'Fetch Latest SEC Filings'
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {secData && (
          <div className="space-y-6">
            {secData.map((result: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">{result.company}</h4>
                      <p className="text-sm text-gray-500">
                        SEC Form 10-K (Annual Report) filed on {new Date(result.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Source: SEC EDGAR Database</Badge>
                  </div>

                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <h5 className="font-medium text-gray-700">About this Document</h5>
                    <p className="text-sm text-gray-600">
                      This data is extracted from the company's official annual report (Form 10-K) 
                      filed with the U.S. Securities and Exchange Commission (SEC). Form 10-K is a 
                      comprehensive report of a company's performance required by federal securities laws.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold">Business Description</h5>
                        <Badge variant="secondary">From Item 1 of Form 10-K</Badge>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {result.sections.business}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold">Risk Factors</h5>
                        <Badge variant="secondary">From Item 1A of Form 10-K</Badge>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {result.sections.riskFactors}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold">Management Discussion & Analysis</h5>
                        <Badge variant="secondary">From Item 7 of Form 10-K</Badge>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {result.sections.mdAndA}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!aiAnalysis && !aiLoading && (
          <Button 
            onClick={analyzeWithAI}
            className="mt-2"
          >
            Analyze with AI
          </Button>
        )}

        {aiLoading && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Spinner className="h-8 w-8 mb-4" />
                <p className="text-gray-600">Analyzing SEC filing with AI...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        )}

        {aiAnalysis && !aiLoading && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-bold">AI Analysis of SEC Filing</h4>
                <Badge variant="outline">Powered by OpenAI</Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="font-semibold mb-2">Executive Summary</h5>
                  <p className="text-gray-600">{aiAnalysis.summary}</p>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Key Technologies</h5>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.keyTechnologies?.map((tech: string, i: number) => (
                      <Badge key={i} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Strategic Focus</h5>
                  <p className="text-gray-600">{aiAnalysis.strategicFocus}</p>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Key Technological Risks</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiAnalysis.risks?.map((risk: string, i: number) => (
                      <li key={i} className="text-gray-600">{risk}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Growth Opportunities</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiAnalysis.opportunities?.map((opp: string, i: number) => (
                      <li key={i} className="text-gray-600">{opp}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded mt-4">
                  <p className="text-sm text-gray-500">
                    This analysis was generated by AI based on the SEC filing data above. 
                    The AI focuses on identifying key technological trends, risks, and opportunities 
                    mentioned in the company's official disclosures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
} 
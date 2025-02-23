'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export function SECTest() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Example tech companies and their CIK numbers
  const techCompanies = {
    'Microsoft': '0000789019',
    'Google': '0001652044',
    'NVIDIA': '0001045810',
    'Meta': '0001326801',
    'Amazon': '0001018724'
  };

  const fetchCompanyFilings = async (cik: string) => {
    setLoading(true);
    try {
      // Get the latest 10-K filing
      const response = await fetch(
        `https://data.sec.gov/submissions/CIK${cik}.json`,
        {
          headers: {
            'User-Agent': 'MarketStep contact@marketstep.com'
          }
        }
      );
      
      const data = await response.json();
      
      // Focus on recent filings and risk factors
      const recentFilings = data.filings.recent;
      const techRiskFactors = recentFilings.filter((filing: any) => 
        filing.form === '10-K' || filing.form === '10-Q'
      );

      setData(techRiskFactors);
    } catch (error) {
      console.error('Error fetching SEC data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">SEC Technology Trends Analysis</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(techCompanies).map(([company, cik]) => (
          <Button 
            key={cik}
            onClick={() => fetchCompanyFilings(cik)}
            disabled={loading}
          >
            Analyze {company}
          </Button>
        ))}
      </div>

      {loading && <div>Loading...</div>}
      
      {data && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Latest Filings</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 
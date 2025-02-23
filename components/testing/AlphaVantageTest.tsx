'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export function AlphaVantageTest() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

  const testEndpoints = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=${endpoint}&apikey=${API_KEY}`
      );
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Alpha Vantage API Test</h1>
      
      <div className="space-y-2">
        <Button 
          onClick={() => testEndpoints('NEWS_SENTIMENT')}
          disabled={loading}
        >
          Test News Sentiment
        </Button>

        <Button 
          onClick={() => testEndpoints('TOP_GAINERS_LOSERS')}
          disabled={loading}
        >
          Test Top Gainers/Losers
        </Button>

        <Button 
          onClick={() => testEndpoints('MARKET_STATUS')}
          disabled={loading}
        >
          Test Market Status
        </Button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {data && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
} 
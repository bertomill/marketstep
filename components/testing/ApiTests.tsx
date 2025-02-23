'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestResult {
  source: string;
  data: unknown;
  timestamp: Date;
}

export function ApiTests() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SEC EDGAR API Test
  const testSECAPI = async () => {
    setLoading(true);
    try {
      // Example: Fetch latest 10-K filings for tech companies
      const response = await fetch(
        'https://data.sec.gov/submissions/CIK0001652044.json', // Example: Googles CIK
        {
          headers: {
            'User-Agent': 'MarketStep contact@marketstep.com' // Required by SEC
          }
        }
      );
      const data = await response.json();
      setResults(prev => [...prev, {
        source: 'SEC',
        data,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEC API error');
    } finally {
      setLoading(false);
    }
  };

  // arXiv API Test
  const testArxivAPI = async () => {
    setLoading(true);
    try {
      // Example: Fetch latest AI/ML papers
      const query = 'cat:cs.AI+OR+cat:cs.LG';
      const response = await fetch(
        `http://export.arxiv.org/api/query?search_query=${query}&sortBy=lastUpdatedDate&sortOrder=descending&max_results=5`
      );
      const data = await response.text(); // arXiv returns XML
      setResults(prev => [...prev, {
        source: 'arXiv',
        data,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'arXiv API error');
    } finally {
      setLoading(false);
    }
  };

  // HackerNews API Test
  const testHNAPI = async () => {
    setLoading(true);
    try {
      // Fetch top stories
      const response = await fetch(
        'https://hacker-news.firebaseio.com/v0/topstories.json'
      );
      const storyIds = await response.json();
      
      // Fetch details for first 5 stories
      const stories = await Promise.all(
        storyIds.slice(0, 5).map(async (id: number) => {
          const storyResponse = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          return storyResponse.json();
        })
      );
      
      setResults(prev => [...prev, {
        source: 'HackerNews',
        data: stories,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'HackerNews API error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">API Testing Dashboard</h1>
      
      <div className="space-x-4">
        <Button onClick={testSECAPI} disabled={loading}>
          Test SEC API
        </Button>
        <Button onClick={testArxivAPI} disabled={loading}>
          Test arXiv API
        </Button>
        <Button onClick={testHNAPI} disabled={loading}>
          Test HackerNews API
        </Button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <Tabs defaultValue="results" className="w-full">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border p-4 rounded">
                <h3 className="font-bold">{result.source}</h3>
                <p className="text-sm text-gray-500">
                  {result.timestamp.toLocaleString()}
                </p>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-[200px]">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="raw">
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
            {JSON.stringify(results, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
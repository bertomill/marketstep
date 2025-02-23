import { NextResponse } from 'next/server';

// This would typically come from a database, but for now we'll hardcode some common companies
const COMPANY_DATABASE = [
  { cik: '0000320193', name: 'Apple Inc.', ticker: 'AAPL' },
  { cik: '0001652044', name: 'Alphabet Inc.', ticker: 'GOOGL' },
  { cik: '0000789019', name: 'Microsoft Corporation', ticker: 'MSFT' },
  { cik: '0001018724', name: 'Amazon.com, Inc.', ticker: 'AMZN' },
  { cik: '0001326801', name: 'Meta Platforms, Inc.', ticker: 'META' },
  { cik: '0001318605', name: 'Tesla, Inc.', ticker: 'TSLA' },
  { cik: '0000200406', name: 'Nvidia Corporation', ticker: 'NVDA' },
  { cik: '0001045810', name: 'NVIDIA CORP', ticker: 'NVDA' },
  { cik: '0000027904', name: 'Bank of America Corp', ticker: 'BAC' },
  { cik: '0000070858', name: 'Pfizer Inc.', ticker: 'PFE' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.toLowerCase();

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Search for companies that match the query in name or ticker
  const results = COMPANY_DATABASE.filter(company => 
    company.name.toLowerCase().includes(query) || 
    company.ticker.toLowerCase().includes(query)
  );

  return NextResponse.json({
    companies: results
  });
} 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json([]);
  }

  // For now, return mock data
  const mockEvents = [
    {
      id: '1',
      company: 'Apple Inc.',
      symbol: 'AAPL',
      type: 'report',
      date: '2024-02-01',
      title: 'Q1 2024 Earnings Report',
      quarter: 'Q1',
      year: '2024'
    },
    {
      id: '2',
      company: 'NVIDIA Corporation',
      symbol: 'NVDA',
      type: 'transcript',
      date: '2024-02-21',
      title: 'Q4 2023 Earnings Call Transcript',
      quarter: 'Q4',
      year: '2023'
    },
    // Add more mock events as needed
  ].filter(event => symbols.split(',').includes(event.symbol));

  return NextResponse.json(mockEvents);
} 
import { NextRequest, NextResponse } from 'next/server';

// This proxy API route forwards requests to Finnhub API to avoid CORS issues
// It takes the same parameters as the Finnhub earnings calendar endpoint
// and returns the response from Finnhub
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    // Validate required parameters
    if (!symbol || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol, from, or to' },
        { status: 400 }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key is not configured' },
        { status: 500 }
      );
    }
    
    // Construct Finnhub API URL
    const finnhubUrl = `https://finnhub.io/api/v1/calendar/earnings?symbol=${symbol}&from=${from}&to=${to}&token=${apiKey}`;
    
    // Make request to Finnhub API
    const response = await fetch(finnhubUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Finnhub API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Return Finnhub API response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in Finnhub proxy API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
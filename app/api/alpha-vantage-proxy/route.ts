import { NextRequest, NextResponse } from 'next/server';

// This proxy API route forwards requests to Alpha Vantage API to avoid CORS issues
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const functionParam = searchParams.get('function');
    const outputsize = searchParams.get('outputsize') || 'compact';
    
    // Validate required parameters
    if (!symbol || !functionParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol or function' },
        { status: 400 }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Alpha Vantage API key is not configured' },
        { status: 500 }
      );
    }
    
    // Construct Alpha Vantage API URL
    const alphaVantageUrl = `https://www.alphavantage.co/query?function=${functionParam}&symbol=${symbol}&outputsize=${outputsize}&apikey=${apiKey}`;
    
    // Make request to Alpha Vantage API
    const response = await fetch(alphaVantageUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache options to avoid hitting rate limits
      next: {
        revalidate: 3600 // Cache for 1 hour
      }
    });
    
    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Alpha Vantage API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Return Alpha Vantage API response
    const data = await response.json();
    
    // Check if we got an error response from Alpha Vantage
    if ('Error Message' in data) {
      return NextResponse.json(
        { error: data['Error Message'] },
        { status: 400 }
      );
    }
    
    // Check for rate limiting
    if ('Note' in data && data['Note'].includes('API call frequency')) {
      return NextResponse.json(
        { error: 'Alpha Vantage API rate limit exceeded', details: data['Note'] },
        { status: 429 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in Alpha Vantage proxy API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

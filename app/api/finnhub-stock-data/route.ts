import { NextRequest, NextResponse } from 'next/server';
import finnhub from 'finnhub';

// This API route uses the Finnhub client to fetch stock quote data
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    
    // Validate required parameters
    if (!symbol) {
      return NextResponse.json(
        { error: 'Missing required parameter: symbol' },
        { status: 400 }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      console.error('Finnhub API key is not configured');
      return NextResponse.json(
        { error: 'Finnhub API key is not configured' },
        { status: 500 }
      );
    }
    
    // Log the request (without exposing the API key)
    console.log(`Finnhub stock data request: symbol=${symbol}`);
    
    // Initialize Finnhub client
    const apiClient = finnhub.ApiClient.instance;
    const auth = apiClient.authentications['api_key'];
    auth.apiKey = apiKey;
    const finnhubClient = new finnhub.DefaultApi();
    
    // Get quote data from Finnhub
    const quoteData = await new Promise<finnhub.QuoteResponse>((resolve, reject) => {
      finnhubClient.quote(symbol, (error, data, response) => {
        if (error) {
          console.error('Finnhub quote error:', error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
    
    // Check if we got a valid response
    if (!quoteData || typeof quoteData.c !== 'number') {
      console.error('Invalid or empty response from Finnhub API');
      return NextResponse.json(
        { error: 'Invalid response from Finnhub API' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(quoteData);
    
  } catch (error) {
    console.error('Error in Finnhub stock data proxy API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

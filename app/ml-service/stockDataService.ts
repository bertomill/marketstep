'use client';

import { StockDataPoint } from './stockPredictionService';

// Alpha Vantage API response types
interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface StockDataFetchResult {
  data: StockDataPoint[];
  symbol: string;
  lastRefreshed: string;
  error?: string;
  source: 'api' | 'fallback';
}

/**
 * Fetch historical stock data from Alpha Vantage API
 * 
 * @param symbol Stock ticker symbol
 * @param days Number of days of historical data to fetch
 * @returns Promise with stock data points and metadata
 */
export async function fetchStockData(
  symbol: string,
  days: number = 60
): Promise<StockDataFetchResult> {
  try {
    // First try using the proxy API route
    try {
      const proxyUrl = `/api/alpha-vantage-proxy?symbol=${symbol}&function=TIME_SERIES_DAILY&outputsize=${days > 100 ? 'full' : 'compact'}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (proxyResponse.ok) {
        const data: AlphaVantageTimeSeriesResponse = await proxyResponse.json();
        return processAlphaVantageResponse(data, 'api');
      }
    } catch (proxyError) {
      console.error('Proxy API error:', proxyError);
      // Continue to direct API call if proxy fails
    }

    // Direct API call (may encounter CORS issues)
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key is not defined');
    }
    
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${days > 100 ? 'full' : 'compact'}&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data: AlphaVantageTimeSeriesResponse = await response.json();
    
    // Check if we got an error response
    if ('Error Message' in data) {
      throw new Error((data as any)['Error Message']);
    }
    
    return processAlphaVantageResponse(data, 'api');
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // Return fallback data when all API attempts fail
    return generateFallbackData(symbol, days);
  }
}

/**
 * Process Alpha Vantage API response into StockDataPoint array
 */
function processAlphaVantageResponse(
  data: AlphaVantageTimeSeriesResponse,
  source: 'api' | 'fallback'
): StockDataFetchResult {
  const timeSeriesData = data['Time Series (Daily)'];
  const metaData = data['Meta Data'];
  
  if (!timeSeriesData || !metaData) {
    throw new Error('Invalid API response format');
  }
  
  const stockData: StockDataPoint[] = Object.entries(timeSeriesData)
    .map(([date, values]) => ({
      date,
      price: parseFloat(values['4. close'])
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    data: stockData,
    symbol: metaData['2. Symbol'],
    lastRefreshed: metaData['3. Last Refreshed'],
    source
  };
}

/**
 * Generate fallback data when API calls fail
 * This is only used when real API data cannot be fetched
 */
function generateFallbackData(symbol: string, days: number): StockDataFetchResult {
  const today = new Date();
  const stockData: StockDataPoint[] = [];
  
  // Start with a reasonable base price based on the ticker
  // This is just for demonstration when API fails
  const basePrice = getBasePrice(symbol);
  let price = basePrice;
  
  for (let i = days; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Add some randomness to the price
    const change = (Math.random() - 0.5) * (basePrice * 0.02);
    price = Math.max(0, price + change);
    
    stockData.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return {
    data: stockData,
    symbol,
    lastRefreshed: today.toISOString().split('T')[0],
    error: 'Using fallback data because API request failed',
    source: 'fallback'
  };
}

/**
 * Get a reasonable base price for fallback data based on the ticker
 */
function getBasePrice(symbol: string): number {
  // Some common stock tickers with reasonable price ranges
  const priceMap: Record<string, number> = {
    'AAPL': 175,
    'MSFT': 350,
    'GOOGL': 140,
    'AMZN': 130,
    'META': 300,
    'TSLA': 250,
    'NVDA': 800,
    'JPM': 180,
    'V': 270,
    'WMT': 60
  };
  
  return priceMap[symbol.toUpperCase()] || 100;
}

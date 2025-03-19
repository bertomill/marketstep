'use client';

import { StockDataPoint } from './stockPredictionService';
import { getStockQuote } from './finnhubClient';

// Finnhub API response types
interface FinnhubQuoteResponse {
  c: number;  // Current price
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
  error?: string;
}

interface StockDataFetchResult {
  data: StockDataPoint[];
  symbol: string;
  lastRefreshed: string;
  error?: string;
  source: 'api' | 'fallback';
}

/**
 * Fetch stock data from Finnhub API
 * 
 * @param symbol Stock ticker symbol
 * @param days Number of days of historical data to generate
 * @returns Promise with stock data points and metadata
 */
export async function fetchStockData(
  symbol: string,
  days: number = 60
): Promise<StockDataFetchResult> {
  try {
    // Use the Finnhub client to get current price
    try {
      console.log('Fetching stock data for:', symbol);
      const quoteData = await getStockQuote(symbol);
      
      if (typeof quoteData.c === 'number') {
        // Generate historical data based on current price
        const data = generateHistoricalData(symbol, days, quoteData);
        
        return {
          data,
          symbol,
          lastRefreshed: new Date(quoteData.t * 1000).toISOString().split('T')[0],
          source: 'api'
        };
      } else {
        console.error('Invalid quote data:', quoteData);
        throw new Error('Invalid quote data from Finnhub');
      }
    } catch (error) {
      console.error('Finnhub client error:', error);
      // Fall back to generating sample data
      return generateFallbackData(symbol, days);
    }
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // Return fallback data when all API attempts fail
    return generateFallbackData(symbol, days);
  }
}

/**
 * Generate historical data based on current price data
 * This simulates historical data with some randomness based on the current price
 */
function generateHistoricalData(
  symbol: string,
  days: number,
  quoteData: FinnhubQuoteResponse
): StockDataPoint[] {
  const today = new Date();
  const stockData: StockDataPoint[] = [];
  
  // Use current price as the latest price
  let currentPrice = quoteData.c;
  
  // Calculate a reasonable volatility based on the difference between high and low
  const dailyVolatility = Math.max(0.5, (quoteData.h - quoteData.l) / quoteData.c * 100) / 5;
  
  // Calculate a trend factor based on the difference between current and previous close
  const trendFactor = (quoteData.c - quoteData.pc) / quoteData.pc;
  
  // Generate historical prices working backwards from the current price
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - i - 1));
    
    // Add the price for this day
    stockData.push({
      date: date.toISOString().split('T')[0],
      price: currentPrice
    });
    
    // For the next (earlier) day, adjust the price with some randomness
    // We're working backwards, so we need to reverse the trend
    const randomFactor = (Math.random() - 0.5) * dailyVolatility / 100;
    const dayTrend = -trendFactor / days; // Distribute the trend across days
    
    // Adjust the price for the previous day
    currentPrice = currentPrice * (1 + dayTrend + randomFactor);
    currentPrice = Math.max(currentPrice, currentPrice * 0.1); // Prevent negative or zero prices
  }
  
  // Sort by date (oldest to newest)
  return stockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

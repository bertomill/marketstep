'use client';

// Import specific types and functions from finnhub
import { ApiClient, DefaultApi } from 'finnhub';

// This file handles all interactions with the Finnhub API for stock market data
// It provides functions to get stock quotes, search symbols, and fetch company news

// Store the Finnhub client instance for reuse
let finnhubClientInstance: DefaultApi | null = null;

/**
 * Get the Finnhub client instance
 * Uses singleton pattern to avoid creating multiple instances
 */
export function getFinnhubClient(): DefaultApi {
  if (!finnhubClientInstance) {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    
    if (!apiKey) {
      console.error('Finnhub API key is not defined');
      throw new Error('Finnhub API key is not defined');
    }
    
    const apiClient = ApiClient.instance;
    const auth = apiClient.authentications['api_key'];
    auth.apiKey = apiKey;
    
    finnhubClientInstance = new DefaultApi();
  }
  
  return finnhubClientInstance;
}

/**
 * Get stock quote data from Finnhub
 * 
 * @param symbol Stock ticker symbol (e.g. 'AAPL' for Apple)
 * @returns Promise with quote data including current price
 */
export function getStockQuote(symbol: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const client = getFinnhubClient();
      
      client.quote(symbol, (error, data) => {
        if (error) {
          console.error('Finnhub quote error:', error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    } catch (error) {
      console.error('Error initializing Finnhub client:', error);
      reject(error);
    }
  });
}

/**
 * Search for stock symbols
 * 
 * @param query Search query (company name or symbol)
 * @returns Promise with search results
 */
export function searchSymbols(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const client = getFinnhubClient();
      
      client.symbolSearch(query, (error, data) => {
        if (error) {
          console.error('Finnhub symbol search error:', error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    } catch (error) {
      console.error('Error initializing Finnhub client:', error);
      reject(error);
    }
  });
}

/**
 * Get the current stock price
 * 
 * @param symbol Stock ticker symbol
 * @returns Promise with current price or null if error
 */
export async function getStockPrice(symbol: string): Promise<number | null> {
  try {
    const quote = await getStockQuote(symbol);
    return quote.c || null;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
}

/**
 * Get recent news articles about a company
 * 
 * @param symbol Stock ticker symbol
 * @returns Promise with array of news articles
 */
export async function getCompanyNews(symbol: string): Promise<any[]> {
  try {
    const client = getFinnhubClient();
    return new Promise((resolve, reject) => {
      client.companyNews(symbol, "2023-01-01", "2024-12-31", (error, data) => {
        if (error) {
          console.error('Error fetching company news:', error);
          reject(error);
        } else {
          resolve(data || []);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}

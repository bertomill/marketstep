'use client';

import finnhub from 'finnhub';

// Singleton pattern for Finnhub client
let finnhubClientInstance: finnhub.DefaultApi | null = null;

/**
 * Get the Finnhub client instance
 * Uses singleton pattern to avoid creating multiple instances
 */
export function getFinnhubClient(): finnhub.DefaultApi {
  if (!finnhubClientInstance) {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    
    if (!apiKey) {
      console.error('Finnhub API key is not defined');
      throw new Error('Finnhub API key is not defined');
    }
    
    const apiClient = finnhub.ApiClient.instance;
    const auth = apiClient.authentications['api_key'];
    auth.apiKey = apiKey;
    
    finnhubClientInstance = new finnhub.DefaultApi();
  }
  
  return finnhubClientInstance;
}

/**
 * Get stock quote data from Finnhub
 * 
 * @param symbol Stock ticker symbol
 * @returns Promise with quote data
 */
export function getStockQuote(symbol: string): Promise<finnhub.QuoteResponse> {
  return new Promise((resolve, reject) => {
    try {
      const client = getFinnhubClient();
      
      client.quote(symbol, (error, data, response) => {
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
 * @param query Search query
 * @returns Promise with search results
 */
export function searchSymbols(query: string): Promise<finnhub.SymbolSearchResult> {
  return new Promise((resolve, reject) => {
    try {
      const client = getFinnhubClient();
      
      client.symbolSearch(query, (error, data, response) => {
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

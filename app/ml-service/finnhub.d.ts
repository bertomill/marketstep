declare module 'finnhub' {
  export interface QuoteResponse {
    c: number;  // Current price
    h: number;  // High price of the day
    l: number;  // Low price of the day
    o: number;  // Open price of the day
    pc: number; // Previous close price
    t: number;  // Timestamp
  }

  export interface SymbolSearchResult {
    count: number;
    result: Array<{
      description: string;
      displaySymbol: string;
      symbol: string;
      type: string;
    }>;
  }

  export interface ApiClient {
    instance: {
      authentications: {
        'api_key': {
          apiKey: string;
        };
      };
    };
  }

  export interface DefaultApi {
    quote(
      symbol: string, 
      callback: (error: Error | null, data: QuoteResponse, response: any) => void
    ): void;
    
    symbolSearch(
      query: string, 
      callback: (error: Error | null, data: SymbolSearchResult, response: any) => void
    ): void;
    
    // Add other methods as needed
  }

  export const ApiClient: ApiClient;
  export class DefaultApi {
    constructor();
    quote(
      symbol: string, 
      callback: (error: Error | null, data: QuoteResponse, response: any) => void
    ): void;
    
    symbolSearch(
      query: string, 
      callback: (error: Error | null, data: SymbolSearchResult, response: any) => void
    ): void;
  }
}

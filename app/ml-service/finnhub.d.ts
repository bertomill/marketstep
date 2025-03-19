interface QuoteResponse {
  c: number;  // Current price
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface SymbolSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

interface SymbolSearchResponse {
  count: number;
  result: SymbolSearchResult[];
}

interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

declare module 'finnhub' {
  export class ApiClient {
    static instance: ApiClient;
    authentications: {
      api_key: {
        apiKey: string;
      };
    };
  }

  export class DefaultApi {
    quote(symbol: string, callback: (error: Error | null, data: QuoteResponse) => void): void;
    symbolSearch(query: string, callback: (error: Error | null, data: SymbolSearchResponse) => void): void;
    companyNews(symbol: string, from: string, to: string, callback: (error: Error | null, data: NewsArticle[]) => void): void;
  }
}

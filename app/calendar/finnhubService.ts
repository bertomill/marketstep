'use client';

import { FollowedCompany } from '@/lib/userService';

// Define the Earnings type based on Finnhub API response
export type EarningsEvent = {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: 'bmo' | 'amc' | 'dmh'; // before market open, after market close, during market hour
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
  companyName?: string; // Added for display purposes
};

// Format hour code to readable text
export const formatEarningsHour = (hour: string): string => {
  switch (hour) {
    case 'bmo':
      return 'Before Market Open';
    case 'amc':
      return 'After Market Close';
    case 'dmh':
      return 'During Market Hours';
    default:
      return hour;
  }
};

// Format large numbers to millions/billions
export const formatRevenue = (revenue: number | null): string => {
  if (revenue === null) return 'N/A';
  
  if (revenue >= 1000000000) {
    return `$${(revenue / 1000000000).toFixed(2)}B`;
  } else if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(2)}M`;
  } else {
    return `$${revenue.toLocaleString()}`;
  }
};

// Get earnings for a specific company within a date range
export const getCompanyEarnings = async (
  symbol: string,
  from: string,
  to: string
): Promise<EarningsEvent[]> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      console.error('Finnhub API key is not defined');
      return [];
    }

    // First try using the proxy API route
    try {
      const proxyUrl = `/api/finnhub-proxy?symbol=${symbol}&from=${from}&to=${to}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        return data.earningsCalendar || [];
      }
    } catch (proxyError) {
      console.error('Proxy API error:', proxyError);
      // Continue to direct API call if proxy fails
    }

    // Direct API call (may encounter CORS issues)
    const url = `https://finnhub.io/api/v1/calendar/earnings?symbol=${symbol}&from=${from}&to=${to}&token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.earningsCalendar || [];
  } catch (error) {
    console.error(`Error fetching earnings for ${symbol}:`, error);
    
    // Return mock data as a fallback when all API attempts fail
    return [{
      date: from, // Use the start date
      epsActual: null,
      epsEstimate: null,
      hour: 'bmo',
      quarter: new Date().getMonth() < 3 ? 1 : new Date().getMonth() < 6 ? 2 : new Date().getMonth() < 9 ? 3 : 4,
      revenueActual: null,
      revenueEstimate: null,
      symbol: symbol,
      year: new Date().getFullYear(),
      companyName: symbol
    }];
  }
};

// Get earnings for multiple companies within a date range
export const getFollowedCompaniesEarnings = async (
  companies: FollowedCompany[],
  from: string,
  to: string
): Promise<EarningsEvent[]> => {
  try {
    // Create a map of company tickers to names for later use
    const companyNameMap = companies.reduce((map, company) => {
      map[company.ticker] = company.name;
      return map;
    }, {} as Record<string, string>);
    
    // Fetch earnings for each company in parallel
    const earningsPromises = companies.map(company => 
      getCompanyEarnings(company.ticker, from, to)
    );
    
    const earningsResults = await Promise.all(earningsPromises);
    
    // Flatten the results and add company names
    const allEarnings = earningsResults
      .flat()
      .map(event => ({
        ...event,
        companyName: companyNameMap[event.symbol] || event.symbol
      }));
    
    // Sort by date
    return allEarnings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching earnings for followed companies:', error);
    return [];
  }
};

// Convert earnings events to calendar events
export const convertEarningsToCalendarEvents = (
  earningsEvents: EarningsEvent[]
): { id: string; title: string; start: Date; end: Date; color: string; isEarningsEvent: boolean; earningsData: EarningsEvent }[] => {
  return earningsEvents.map(event => {
    // Determine the time based on the hour code
    let startHour = 9; // Default to 9 AM
    let endHour = 10; // Default to 10 AM
    let color = '#10B981'; // Default green
    
    if (event.hour === 'bmo') {
      startHour = 9;
      endHour = 10;
      color = '#3B82F6'; // Blue
    } else if (event.hour === 'amc') {
      startHour = 16;
      endHour = 17;
      color = '#8B5CF6'; // Purple
    } else if (event.hour === 'dmh') {
      startHour = 12;
      endHour = 13;
      color = '#F59E0B'; // Amber
    }
    
    const startDate = new Date(`${event.date}T${startHour.toString().padStart(2, '0')}:00:00`);
    const endDate = new Date(`${event.date}T${endHour.toString().padStart(2, '0')}:00:00`);
    
    return {
      id: `earnings-${event.symbol}-${event.date}`,
      title: `${event.symbol} Earnings`,
      start: startDate,
      end: endDate,
      color,
      isEarningsEvent: true,
      earningsData: event
    };
  });
};

export interface EarningsTranscript {
  date: string;
  transcript: string;
  transcript_split: {
    speaker: string;
    text: string;
  }[];
}

// Function to fetch earnings call transcript from API Ninjas
export const fetchEarningsTranscript = async (
  ticker: string,
  year: number,
  quarter: number
): Promise<EarningsTranscript | null> => {
  try {
    // Your API Ninjas key should be stored in environment variables
    const apiKey = process.env.NEXT_PUBLIC_API_NINJAS_KEY;
    
    if (!apiKey) {
      console.error('API Ninjas key is missing. Please add it to your environment variables.');
      return null;
    }
    
    const url = `https://api.api-ninjas.com/v1/earningstranscript?ticker=${ticker}&year=${year}&quarter=${quarter}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch transcript:', response.status, await response.text());
      return null;
    }
    
    const data = await response.json();
    return data as EarningsTranscript;
  } catch (error) {
    console.error('Error fetching earnings transcript:', error);
    return null;
  }
}; 
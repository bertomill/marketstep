import { NextResponse } from 'next/server';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json([]);
  }

  try {
    const today = new Date();
    const symbolsArray = symbols.split(',');
    const allEvents = [];

    // Fetch earnings calendar for each symbol
    for (const symbol of symbolsArray) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&symbol=${symbol}&horizon=3month&apikey=${ALPHA_VANTAGE_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`);
        }

        // Alpha Vantage returns CSV format for this endpoint
        const csvText = await response.text();
        const events = parseCSV(csvText);
        allEvents.push(...events);
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    // Format and sort the events
    const formattedEvents = allEvents
      .map(event => ({
        date: event.reportDate,
        company: event.name,
        symbol: event.symbol,
        estimate: event.estimate || 'N/A',
        time: getTimeOfDay(event.time),
        fiscalPeriod: event.fiscalPeriod,
        fiscalYear: event.fiscalYear
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching earnings calendar:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch earnings data' 
    }, { status: 500 });
  }
}

// Helper function to parse CSV response
function parseCSV(csv: string) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[toCamelCase(header)] = values[i];
        return obj;
      }, {} as any);
    });
}

// Helper function to convert header names to camelCase
function toCamelCase(str: string) {
  return str.toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

// Helper function to standardize time of day format
function getTimeOfDay(time: string): 'bmo' | 'amc' | 'dmh' {
  time = time.toLowerCase();
  if (time.includes('before') || time.includes('bmo')) return 'bmo';
  if (time.includes('after') || time.includes('amc')) return 'amc';
  return 'dmh';
} 
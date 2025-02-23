import { NextResponse } from 'next/server';

// SEC EDGAR API requires a user agent with contact info
const USER_AGENT = 'MarketStep/1.0 (bertovmill@gmail.com)';

interface SecFiling {
  id: string;
  company: string;
  symbol: string;
  type: 'filing';
  date: string;
  title: string;
  form: string;
  description?: string;
  url: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json([]);
  }

  try {
    const symbolsArray = symbols.split(',');
    const allFilings: SecFiling[] = [];

    // First get CIK numbers for each symbol
    for (const symbol of symbolsArray) {
      try {
        // Get CIK from ticker lookup
        const tickerResponse = await fetch(
          `https://www.sec.gov/files/company_tickers.json`,
          {
            headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'application/json',
            }
          }
        );

        if (!tickerResponse.ok) {
          console.error(`Failed to lookup CIK for ${symbol}`);
          continue;
        }

        const tickerData = await tickerResponse.json();
        const companyInfo = Object.values(tickerData).find(
          (company: any) => company.ticker === symbol
        );

        if (!companyInfo) {
          console.error(`No CIK found for ${symbol}`);
          continue;
        }

        // Get company filings using CIK
        const cik = companyInfo.cik_str.toString().padStart(10, '0');
        const response = await fetch(
          `https://data.sec.gov/submissions/CIK${cik}.json`,
          {
            headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch SEC data for ${symbol}`);
          continue;
        }

        const data = await response.json();
        
        // Get recent filings
        const recentFilings = data.filings.recent;
        
        // Only include important forms
        const importantForms = ['10-K', '10-Q', '8-K', '6-K', '20-F'];
        
        const formattedFilings = recentFilings.filings
          .filter((filing: any) => importantForms.includes(filing.form))
          .map((filing: any, index: number) => {
            const accessionNumber = filing.accessionNumber.replace(/-/g, '');
            return {
              id: `${symbol}-${accessionNumber}`,
              company: data.name,
              symbol: symbol,
              type: 'filing',
              date: filing.filingDate,
              title: `${filing.form} - ${filing.primaryDocDescription || 'Filing'}`,
              form: filing.form,
              description: filing.primaryDocDescription,
              url: `https://www.sec.gov/Archives/edgar/data/${data.cik}/${accessionNumber}/${filing.primaryDocument}`
            };
          });

        allFilings.push(...formattedFilings);
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
      }
    }

    // Sort filings by date
    allFilings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return only the most recent filings
    return NextResponse.json(allFilings.slice(0, 20));
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
    return NextResponse.json({ error: 'Failed to fetch SEC filings' }, { status: 500 });
  }
} 
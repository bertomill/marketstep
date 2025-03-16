import { NextRequest, NextResponse } from 'next/server';

// This function fetches real filings from the SEC EDGAR API
async function fetchSecFilings(cik: string) {
  try {
    // Format CIK with leading zeros to 10 digits as required by SEC API
    const formattedCik = cik.replace(/^0+/, '').padStart(10, '0');
    
    // Fetch the company submissions from the SEC API
    const url = `https://data.sec.gov/submissions/CIK${formattedCik}.json`;
    
    console.log(`Fetching SEC filings from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        // SEC requires a User-Agent header with company/contact info
        'User-Agent': 'MarketStep/1.0 (https://marketstep.com; info@marketstep.com)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`SEC API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch from SEC API: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the recent filings from the response
    const recentFilings = data.filings?.recent;
    
    if (!recentFilings || !recentFilings.form) {
      return [];
    }
    
    // Map the SEC API response to our filing format
    const filings = [];
    for (let i = 0; i < recentFilings.form.length; i++) {
      const form = recentFilings.form[i];
      const filingDate = recentFilings.filingDate[i];
      const reportDate = recentFilings.reportDate[i];
      const accessionNumber = recentFilings.accessionNumber[i];
      const primaryDocument = recentFilings.primaryDocument[i];
      const description = recentFilings.primaryDocDescription?.[i] || getFormDescription(form);
      
      // Create the document URL
      const accessionNumberFormatted = accessionNumber.replace(/-/g, '');
      const documentUrl = `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${accessionNumberFormatted}/${primaryDocument}`;
      
      filings.push({
        id: accessionNumber,
        form,
        filingDate,
        reportDate: reportDate || filingDate, // Some filings don't have report dates
        description,
        documentUrl,
      });
    }
    
    return filings;
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
    return null;
  }
}

// Get a description for common form types
function getFormDescription(formType: string): string {
  const descriptions: Record<string, string> = {
    '10-K': 'Annual Report',
    '10-Q': 'Quarterly Report',
    '8-K': 'Current Report',
    'S-1': 'Registration Statement',
    '4': 'Statement of Changes in Beneficial Ownership',
    'DEF 14A': 'Definitive Proxy Statement',
  };
  
  return descriptions[formType] || `${formType} Filing`;
}

// Fallback function to generate sample filings if SEC API fails
function generateSampleFilings(cik: string) {
  // Common SEC form types
  const formTypes = ['10-K', '10-Q', '8-K', 'S-1', '4', 'DEF 14A'];
  
  // Sample descriptions for different form types
  const descriptions = {
    '10-K': 'Annual Report',
    '10-Q': 'Quarterly Report',
    '8-K': 'Current Report',
    'S-1': 'Registration Statement',
    '4': 'Statement of Changes in Beneficial Ownership',
    'DEF 14A': 'Definitive Proxy Statement'
  };
  
  // Generate between 5 and 15 random filings
  const count = Math.floor(Math.random() * 10) + 5;
  const filings = [];
  
  // Current date for generating random past dates
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Pick a random form type
    const formType = formTypes[Math.floor(Math.random() * formTypes.length)];
    
    // Generate a random filing date within the last 2 years
    const filingDate = new Date(now);
    filingDate.setDate(now.getDate() - Math.floor(Math.random() * 730));
    
    // Report date is usually a bit before filing date
    const reportDate = new Date(filingDate);
    reportDate.setDate(filingDate.getDate() - Math.floor(Math.random() * 30));
    
    filings.push({
      id: `filing-${i}-${cik}`,
      form: formType,
      description: descriptions[formType as keyof typeof descriptions] || 'Other Filing',
      filingDate: filingDate.toISOString(),
      reportDate: reportDate.toISOString(),
      // In a real app, this would be the actual URL to the SEC document
      documentUrl: `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${Math.floor(Math.random() * 1000000)}/filing-document.html`
    });
  }
  
  // Sort by filing date (newest first)
  return filings.sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());
}

// This function handles the filings request
export async function GET(request: NextRequest) {
  try {
    // Get the company CIK from the URL
    const searchParams = request.nextUrl.searchParams;
    const cik = searchParams.get('cik');
    
    if (!cik) {
      return NextResponse.json({ error: 'CIK parameter is required' }, { status: 400 });
    }

    // Try to fetch real filings from SEC EDGAR API
    const filings = await fetchSecFilings(cik);
    
    // If SEC API fails, use sample data
    if (filings === null) {
      console.log('SEC API failed, using sample data');
      const sampleFilings = generateSampleFilings(cik);
      return NextResponse.json(sampleFilings);
    }

    return NextResponse.json(filings);
  } catch (error) {
    console.error('Filings API error:', error);
    return NextResponse.json({ error: 'Failed to fetch filings' }, { status: 500 });
  }
} 
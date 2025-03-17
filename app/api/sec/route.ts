// API route to handle SEC EDGAR data requests
// This serves as a proxy to avoid CORS issues with direct SEC API calls from the browser

import { NextRequest, NextResponse } from 'next/server';

// Get CIK number for a ticker symbol
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker');
  const documentUrl = searchParams.get('documentUrl');
  
  // If a document URL is provided, fetch the document content
  if (documentUrl) {
    return await getDocumentContent(documentUrl);
  }
  
  // Otherwise, get filing information
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }
  
  try {
    // First, get the CIK from the ticker
    const tickerResponse = await fetch('https://www.sec.gov/include/ticker.txt', {
      headers: {
        // SEC requires these headers
        'User-Agent': 'MarketStep investor-research-app contact@example.com',
        'Accept-Encoding': 'gzip, deflate',
        'Host': 'www.sec.gov'
      }
    });
    
    if (!tickerResponse.ok) {
      return NextResponse.json(
        { error: `SEC API returned ${tickerResponse.status}` }, 
        { status: tickerResponse.status }
      );
    }
    
    const tickerText = await tickerResponse.text();
    const lines = tickerText.split('\n');
    
    let cik = '';
    for (const line of lines) {
      const [tickerPart, cikPart] = line.split('\t');
      if (tickerPart.toLowerCase() === ticker.toLowerCase()) {
        cik = cikPart;
        break;
      }
    }
    
    if (!cik) {
      return NextResponse.json(
        { error: `Could not find CIK for ticker: ${ticker}` }, 
        { status: 404 }
      );
    }
    
    // Format CIK with leading zeros to 10 digits
    const formattedCik = cik.padStart(10, '0');
    
    // Now get the company filings
    const filingUrl = `https://data.sec.gov/submissions/CIK${formattedCik}.json`;
    
    const filingResponse = await fetch(filingUrl, {
      headers: {
        // SEC requires these headers
        'User-Agent': 'MarketStep investor-research-app contact@example.com',
        'Accept-Encoding': 'gzip, deflate',
        'Host': 'data.sec.gov'
      }
    });
    
    if (!filingResponse.ok) {
      return NextResponse.json(
        { error: `SEC API returned ${filingResponse.status}` },
        { status: filingResponse.status }
      );
    }
    
    const filingData = await filingResponse.json();
    
    // Return the relevant data
    return NextResponse.json({
      cik: cik,
      filings: filingData.filings
    });
    
  } catch (error) {
    console.error('Error fetching from SEC:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEC data' },
      { status: 500 }
    );
  }
}

// Function to fetch document content
async function getDocumentContent(url: string) {
  try {
    // Extract the host from the URL
    const urlObj = new URL(url);
    const host = urlObj.host;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MarketStep investor-research-app contact@example.com',
        'Accept-Encoding': 'gzip, deflate',
        'Host': host
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch document: ${response.status}` },
        { status: response.status }
      );
    }
    
    const contentType = response.headers.get('content-type');
    
    // If it's HTML, return the text content
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      return NextResponse.json({ documentContent: text });
    }
    
    // For PDF or other formats, just return a link to the document
    return NextResponse.json({ 
      documentContent: null,
      message: 'Document is not in HTML format, use the URL to access it directly',
      documentUrl: url
    });
    
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document content' },
      { status: 500 }
    );
  }
} 
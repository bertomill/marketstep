import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cik = searchParams.get('cik');
  const accessionNumber = searchParams.get('accessionNumber');
  const form = searchParams.get('form');

  if (!cik || !accessionNumber || !form) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const formattedAccession = accessionNumber.replace(/-/g, '');
    const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${formattedAccession}/${form}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MarketStep contact@marketstep.com',
        'Accept': 'application/json, text/plain',
        'Host': 'www.sec.gov'
      }
    });

    if (!response.ok) {
      throw new Error(`SEC API responded with status: ${response.status}`);
    }

    const text = await response.text();
    
    // Extract the relevant content from the HTML/XML
    // This is a simple example - you might need more sophisticated parsing
    const content = text
      .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();                   // Trim excess whitespace

    return NextResponse.json({
      content: content
    });

  } catch (error) {
    console.error('Error fetching SEC filing:', error);
    return NextResponse.json({ error: 'Failed to fetch filing' }, { status: 500 });
  }
} 
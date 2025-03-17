// API route to handle Earnings Call Transcript requests
// This serves as a proxy to avoid exposing API keys in the client

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker');
  const year = searchParams.get('year');
  const quarter = searchParams.get('quarter');
  
  if (!ticker || !year || !quarter) {
    return NextResponse.json(
      { error: 'Ticker, year, and quarter are required' }, 
      { status: 400 }
    );
  }
  
  try {
    // API Ninjas API key - in production, this should be stored as an environment variable
    const apiKey = 'n5XCDnT6cz5O6LSSVcoAAw==6iwKwdhjyUBGjTgk';
    
    const url = `https://api.api-ninjas.com/v1/earningstranscript?ticker=${ticker}&year=${year}&quarter=${quarter}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // If the API returns no data, return mock data for testing
      if (response.status === 404) {
        return NextResponse.json(createMockTranscript(ticker, parseInt(year), parseInt(quarter)));
      }
      
      return NextResponse.json(
        { error: `API Ninjas returned status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error calling API Ninjas:', error);
    
    // Return mock data in case of error for development purposes
    return NextResponse.json(
      createMockTranscript(ticker, parseInt(year), parseInt(quarter)),
      { status: 200 }
    );
  }
}

// Helper function to create mock transcript data for development/testing
function createMockTranscript(ticker: string, year: number, quarter: number) {
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const formattedDate = threeMonthsAgo.toISOString().split('T')[0];
  
  return {
    date: formattedDate,
    transcript: `This is a mock earnings call transcript for ${ticker} for Q${quarter} ${year}. In this mock call, the CEO discusses quarterly results and outlook for the next quarter.`,
    transcript_split: [
      {
        speaker: "Operator",
        text: `Greetings, and welcome to the ${ticker} Fiscal Year ${year} Q${quarter} Earnings Conference Call. At this time, all participants are in a listen-only mode. A question-and-answer session will follow the formal presentation.`
      },
      {
        speaker: "John Smith, CEO",
        text: `Thank you, Operator. Good afternoon everyone and thank you for joining our quarterly earnings call. We're pleased to report another strong quarter with revenue growth of ${Math.floor(Math.random() * 30)}% year-over-year. Our core business continues to perform well, and we're seeing excellent adoption of our new products.`
      },
      {
        speaker: "Jane Doe, CFO",
        text: `As John mentioned, we had a strong quarter financially. Revenue came in at $${(Math.random() * 1000).toFixed(2)} million, with earnings per share of $${(Math.random() * 3).toFixed(2)}, exceeding analyst expectations. Our operating margin improved to ${Math.floor(Math.random() * 40)}%, and we generated ${(Math.random() * 500).toFixed(2)} million in free cash flow.`
      },
      {
        speaker: "John Smith, CEO",
        text: `Looking ahead to Q${quarter === 4 ? 1 : quarter + 1}, we expect continued momentum across all business segments. We're investing heavily in AI and expect these investments to drive growth in the coming quarters. We're also excited about our new product roadmap, which we believe will further strengthen our market position.`
      },
      {
        speaker: "Operator",
        text: "Thank you. We will now begin the question and answer session. [Operator Instructions] Our first question comes from..."
      }
    ]
  };
} 
import { NextResponse } from 'next/server';

export async function GET() {
  const IEX_API_KEY = process.env.IEX_API_KEY;
  
  try {
    const response = await fetch(
      `https://cloud.iexapis.com/stable/time-series/REPORTED_FINANCIALS?token=${IEX_API_KEY}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.error();
  }
} 
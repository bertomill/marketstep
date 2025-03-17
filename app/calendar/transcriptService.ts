'use client';

// Types for the Earnings Call Transcript API response
export type EarningsTranscriptSplit = {
  speaker: string;
  text: string;
};

export type EarningsTranscript = {
  date: string;
  transcript: string;
  transcript_split: EarningsTranscriptSplit[];
};

// Function to fetch the transcript for a given company for a specific quarter
export async function getEarningsTranscript(
  ticker: string,
  year: number,
  quarter: number
): Promise<EarningsTranscript | null> {
  try {
    // Using our own API route to avoid exposing API key in client
    const response = await fetch(
      `/api/transcript?ticker=${encodeURIComponent(ticker)}&year=${year}&quarter=${quarter}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching earnings transcript:', error);
    return null;
  }
}

// Function to get most recent quarters for earnings
export function getRecentQuarters(count: number = 4): { year: number; quarter: number }[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Determine current quarter (0-based months: 0-2 is Q1, 3-5 is Q2, etc.)
  const currentQuarter = Math.floor(currentMonth / 3) + 1;
  
  const quarters: { year: number; quarter: number }[] = [];
  
  let year = currentYear;
  let quarter = currentQuarter;
  
  for (let i = 0; i < count; i++) {
    quarters.push({ year, quarter });
    
    // Move to previous quarter
    quarter--;
    if (quarter === 0) {
      quarter = 4;
      year--;
    }
  }
  
  return quarters;
} 
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiApiKey } from '../../utils/env';

// Get the API key from environment variables
const GEMINI_API_KEY = getGeminiApiKey();
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// This function searches for company information using Gemini
async function searchCompanyWithGemini(query: string) {
  try {
    // Check if we have an API key
    if (!GEMINI_API_KEY) {
      console.warn('No Gemini API key found in environment variables');
      return [];
    }

    // Create a prompt that asks for company information including CIK
    const prompt = `
      I need information about the company "${query}". 
      Please provide the following in JSON format:
      1. Full company name
      2. Stock ticker symbol
      3. CIK (Central Index Key) number from SEC EDGAR
      
      Format the response as valid JSON with these fields:
      {
        "name": "Company Name",
        "ticker": "SYMBOL",
        "cik": "0000123456"
      }
      
      If you can't find the information or are unsure, return an empty array: []
      Only return the JSON, no other text.
    `;

    // Call the Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text response from Gemini
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return [];
    }

    // Try to parse the JSON response
    try {
      // Find JSON in the response (in case there's extra text)
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // If we got a valid company, return it as an array with a source flag
      if (jsonData.name && jsonData.ticker && jsonData.cik) {
        return [{
          ...jsonData,
          fromGemini: true
        }];
      }
      
      // If we got an array, add the source flag to each item
      if (Array.isArray(jsonData)) {
        return jsonData.map(item => ({
          ...item,
          fromGemini: true
        }));
      }
      
      return [];
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
      return [];
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return [];
  }
}

// Fallback sample companies in case the API fails
const FALLBACK_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', cik: '0000789019' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', cik: '0001652044' },
];

// This function handles the search request
export async function GET(request: NextRequest) {
  try {
    // Get the search query from the URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search for company information using Gemini
    const results = await searchCompanyWithGemini(query);
    
    // If Gemini didn't return results, use fallback filtering
    if (results.length === 0) {
      console.log('No results from Gemini, using fallback data');
      const fallbackResults = FALLBACK_COMPANIES.filter(company => 
        company.ticker.toLowerCase().includes(query) || 
        company.name.toLowerCase().includes(query)
      ).map(company => ({
        ...company,
        fromFallback: true
      }));
      
      return NextResponse.json(fallbackResults);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to search companies' }, { status: 500 });
  }
} 
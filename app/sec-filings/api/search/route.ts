import { NextRequest, NextResponse } from 'next/server';
import { getGeminiApiKey } from '../../utils/env';

// Get the API key from environment variables
// Try to get the key directly from Next.js environment variables first
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || getGeminiApiKey();
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// This function searches for company information using Gemini
async function searchCompanyWithGemini(query: string) {
  try {
    // Check if we have an API key
    if (!GEMINI_API_KEY) {
      console.warn('No Gemini API key found in environment variables. Make sure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file.');
      return [];
    }

    // Create a prompt that asks for company information including CIK
    const prompt = `
      I need information about companies matching "${query}". 
      Please provide details for up to 5 most relevant companies in JSON format.
      For each company include:
      1. Full company name
      2. Stock ticker symbol
      3. CIK (Central Index Key) number from SEC EDGAR
      4. Brief description (1-2 sentences about what the company does)
      5. Industry sector
      
      Format the response as valid JSON array with these fields for each company:
      [
        {
          "name": "Company Name",
          "ticker": "SYMBOL",
          "cik": "0000123456",
          "description": "Brief description of the company",
          "sector": "Industry sector"
        },
        ...
      ]
      
      If you can't find any matching companies, return an empty array: []
      Only return the JSON array, no other text.
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
      const jsonMatch = textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      
      if (jsonMatch) {
        // Parse the JSON array
        const jsonArray = JSON.parse(jsonMatch[0]);
        
        // Add the source flag to each item
        if (Array.isArray(jsonArray) && jsonArray.length > 0) {
          return jsonArray.map(item => ({
            ...item,
            fromGemini: true
          }));
        }
      } else {
        // Try to parse as a single object (for backward compatibility)
        const singleJsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (singleJsonMatch) {
          const jsonData = JSON.parse(singleJsonMatch[0]);
          
          // If we got a valid company, return it as an array with a source flag
          if (jsonData.name && jsonData.ticker && jsonData.cik) {
            return [{
              ...jsonData,
              fromGemini: true
            }];
          }
        }
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
  { 
    ticker: 'AAPL', 
    name: 'Apple Inc.', 
    cik: '0000320193',
    description: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
    sector: 'Technology'
  },
  { 
    ticker: 'MSFT', 
    name: 'Microsoft Corporation', 
    cik: '0000789019',
    description: 'Develops, licenses, and supports software, services, devices, and solutions worldwide.',
    sector: 'Technology'
  },
  { 
    ticker: 'GOOGL', 
    name: 'Alphabet Inc.', 
    cik: '0001652044',
    description: 'Provides online advertising services, search engine, cloud computing, software, and hardware.',
    sector: 'Technology'
  },
];

// This function handles the search request
export async function GET(request: NextRequest) {
  try {
    // Log environment variables for debugging
    console.log('Environment check:');
    console.log('- NEXT_PUBLIC_GEMINI_API_KEY exists:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    console.log('- Using API key:', GEMINI_API_KEY ? 'Yes (key found)' : 'No (key missing)');
    
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
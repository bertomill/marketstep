# SEC Filings Feature

This is a self-contained feature that allows users to search for companies and view their SEC EDGAR filings.

## Structure

- `page.tsx` - The main page component that displays the SEC filings interface
- `components/` - Contains UI components for the feature
  - `CompanySearch.tsx` - Component for searching companies
  - `FilingsList.tsx` - Component for displaying a company's filings
- `api/` - Contains API routes for the feature
  - `search/route.ts` - API route for searching companies
  - `filings/route.ts` - API route for fetching a company's filings
- `utils/` - Contains utility functions
  - `env.ts` - Utility for loading environment variables
- `.env.local` - Environment variables for the feature

## Environment Variables

This feature uses the following environment variables:

- `GEMINI_API_KEY` - Google Gemini API key for searching company information

These variables are stored in the `.env.local` file in the `app/sec-filings` directory.

## How it Works

1. Users can search for a company by name or ticker symbol
2. The search query is sent to the `/sec-filings/api/search` endpoint
   - This endpoint uses the Google Gemini API to find company information including CIK numbers
   - If the Gemini API is unavailable, it falls back to sample data
3. When a company is selected, its filings are fetched from the `/sec-filings/api/filings` endpoint
   - This endpoint connects to the SEC EDGAR API to fetch real filing data
   - If the SEC API is unavailable, it falls back to sample data
4. The filings are displayed in a table with links to the original documents

## SEC EDGAR API Integration

This feature integrates with the SEC EDGAR API to fetch real filing data:

- The API endpoint used is `https://data.sec.gov/submissions/CIK{cik}.json`
- The CIK number is formatted with leading zeros to 10 digits as required by the SEC API
- The API requires a User-Agent header with company/contact information
- The response is parsed to extract filing information including:
  - Form type (10-K, 10-Q, 8-K, etc.)
  - Filing date
  - Report date
  - Document URL

### SEC API Rate Limits

The SEC EDGAR API has rate limits that should be respected:

- Maximum of 10 requests per second
- A valid User-Agent header is required with company name and contact information

## Fallback Mechanism

If the SEC EDGAR API is unavailable or returns an error, the feature falls back to using sample data:

- Sample filings are generated with realistic form types and dates
- A warning message is displayed to the user indicating that sample data is being used

## Demo Data

This implementation uses mock data for demonstration purposes. In a production environment, you would connect to the actual SEC EDGAR API to fetch real filing data.

## Removing the Feature

Since this feature is self-contained within the `app/sec-filings` directory, it can be easily removed by deleting this directory without affecting other parts of the application. 
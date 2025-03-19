import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Financial metrics that can be extracted from financial reports
 * This structure captures key financial data points in a standardized format
 */
export interface FinancialMetrics {
  // General metrics
  reportType: string;  // 10-K, 10-Q, 8-K, etc.
  fiscalPeriod: string; // Q1, Q2, Q3, Q4, Full Year
  fiscalYear: string;
  
  // Income statement metrics
  revenue?: number;
  revenueGrowth?: number; // percentage
  grossProfit?: number;
  grossMargin?: number; // percentage
  operatingIncome?: number;
  netIncome?: number;
  earningsPerShare?: number;
  
  // Balance sheet metrics
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  cash?: number;
  debt?: number;
  
  // Cash flow metrics
  operatingCashFlow?: number;
  freeCashFlow?: number;
  
  // Company guidance
  revenueGuidanceLow?: number;
  revenueGuidanceHigh?: number;
  epsGuidanceLow?: number;
  epsGuidanceHigh?: number;
  
  // Additional context
  keyRisks?: string[];
  significantEvents?: string[];
  
  // Source tracking
  source: string; // URL or identifier of the source document
  processingDate: string; // When the metrics were extracted
  confidence: number; // Confidence score of the extraction (0-1)
}

/**
 * Response type for the extractMetrics function
 */
export interface MetricsExtractionResponse {
  metrics: FinancialMetrics | null;
  error?: string;
}

/**
 * Options for metric extraction
 */
export interface ExtractionOptions {
  includeRisks?: boolean; // Extract risk factors
  includeGuidance?: boolean; // Extract forward-looking guidance
  confidenceThreshold?: number; // Minimum confidence level for extracted values (0-1)
}

/**
 * Extract financial metrics from an SEC filing using ML
 * 
 * @param filingText The text content of the SEC filing
 * @param filingType The type of filing (10-K, 10-Q, 8-K, etc.)
 * @param ticker The company ticker symbol
 * @param options Additional extraction options
 * @returns A promise that resolves to the extracted metrics or error
 */
export async function extractMetrics(
  filingText: string, 
  filingType: string, 
  ticker: string,
  options: ExtractionOptions = {}
): Promise<MetricsExtractionResponse> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-pro' });

    // Default options
    const defaultOptions: Required<ExtractionOptions> = {
      includeRisks: true,
      includeGuidance: true,
      confidenceThreshold: 0.7
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    // Prepare the prompt for extraction
    const prompt = `
      You are a financial analyst specialized in extracting key metrics from ${filingType} filings.
      
      Extract the following financial metrics from this ${filingType} filing for ${ticker}:
      1. Revenue
      2. Revenue growth percentage
      3. Gross profit
      4. Gross margin percentage
      5. Operating income
      6. Net income
      7. Earnings per share
      8. Total assets
      9. Total liabilities
      10. Total equity
      11. Cash and cash equivalents
      12. Total debt
      13. Operating cash flow
      14. Free cash flow
      
      ${mergedOptions.includeGuidance ? `
      Also extract the company's forward-looking guidance:
      1. Revenue guidance range
      2. EPS guidance range
      ` : ''}
      
      ${mergedOptions.includeRisks ? `
      Identify up to 3 key risk factors mentioned in the filing.
      ` : ''}
      
      For each metric:
      - Extract the exact numerical value
      - If a range is given, extract both the low and high values
      - If a metric is not found, indicate that it's not available
      - For each metric, provide a confidence score (0-1) indicating how confident you are in the extraction
      
      Format your response as valid JSON with the following structure:
      {
        "reportType": "10-K",
        "fiscalPeriod": "Full Year",
        "fiscalYear": "2023",
        "revenue": 1234.56,
        "revenueGrowth": 12.3,
        "grossProfit": 456.78,
        "grossMargin": 37.0,
        "operatingIncome": 234.56,
        "netIncome": 123.45,
        "earningsPerShare": 1.23,
        "totalAssets": 2345.67,
        "totalLiabilities": 1234.56,
        "totalEquity": 1111.11,
        "cash": 345.67,
        "debt": 567.89,
        "operatingCashFlow": 234.56,
        "freeCashFlow": 123.45,
        "revenueGuidanceLow": 1300.0,
        "revenueGuidanceHigh": 1400.0,
        "epsGuidanceLow": 1.25,
        "epsGuidanceHigh": 1.35,
        "keyRisks": ["Risk 1", "Risk 2", "Risk 3"],
        "significantEvents": ["Event 1", "Event 2"],
        "confidence": 0.85
      }
      
      FILING TEXT:
      ${filingText.substring(0, 30000)} // Limit text length to avoid token limits
    `;

    // Generate the metrics extraction
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    try {
      // Extract the JSON part from the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*?}/);
                        
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```/g, '') : responseText;
      
      // Parse the extracted metrics
      const extractedMetrics = JSON.parse(jsonString) as FinancialMetrics;
      
      // Filter out metrics with confidence below threshold
      if (extractedMetrics.confidence < mergedOptions.confidenceThreshold) {
        return {
          metrics: null,
          error: `Extraction confidence (${extractedMetrics.confidence}) is below the threshold (${mergedOptions.confidenceThreshold})`
        };
      }
      
      // Add processing metadata
      const metrics: FinancialMetrics = {
        ...extractedMetrics,
        source: `${ticker} ${filingType}`,
        processingDate: new Date().toISOString()
      };
      
      return { metrics };
    } catch (parseError) {
      console.error('Error parsing metrics JSON:', parseError);
      return {
        metrics: null,
        error: 'Failed to parse extracted metrics. The response format was invalid.'
      };
    }
  } catch (error) {
    console.error('Error extracting metrics:', error);
    return { 
      metrics: null,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Compare financial metrics between two periods
 * 
 * @param currentMetrics Metrics from the current period
 * @param previousMetrics Metrics from the previous period
 * @returns An object containing the percentage changes for key metrics
 */
export function compareMetrics(currentMetrics: FinancialMetrics, previousMetrics: FinancialMetrics) {
  const calculateChange = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined || previous === 0) {
      return undefined;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  return {
    revenueChange: calculateChange(currentMetrics.revenue, previousMetrics.revenue),
    grossProfitChange: calculateChange(currentMetrics.grossProfit, previousMetrics.grossProfit),
    grossMarginChange: currentMetrics.grossMargin !== undefined && previousMetrics.grossMargin !== undefined 
      ? currentMetrics.grossMargin - previousMetrics.grossMargin
      : undefined,
    operatingIncomeChange: calculateChange(currentMetrics.operatingIncome, previousMetrics.operatingIncome),
    netIncomeChange: calculateChange(currentMetrics.netIncome, previousMetrics.netIncome),
    epsChange: calculateChange(currentMetrics.earningsPerShare, previousMetrics.earningsPerShare),
    cashChange: calculateChange(currentMetrics.cash, previousMetrics.cash),
    debtChange: calculateChange(currentMetrics.debt, previousMetrics.debt),
    period: `${previousMetrics.fiscalPeriod} ${previousMetrics.fiscalYear} to ${currentMetrics.fiscalPeriod} ${currentMetrics.fiscalYear}`
  };
}

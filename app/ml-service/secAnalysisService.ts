import { FinancialMetrics, extractMetrics } from './metricsExtractionService';
import { detectAnomalies, FinancialAnomaly } from './anomalyDetectionService';

/**
 * Response from SEC filing analysis
 */
export interface SECAnalysisResponse {
  metrics: FinancialMetrics | null;
  previousMetrics?: FinancialMetrics;
  anomalies?: FinancialAnomaly[];
  error?: string;
}

/**
 * Options for SEC filing analysis
 */
export interface SECAnalysisOptions {
  includePreviousPeriod?: boolean; // Whether to include previous period metrics
  detectAnomalies?: boolean; // Whether to detect anomalies
  includeRisks?: boolean; // Whether to extract risk factors
  includeGuidance?: boolean; // Whether to extract forward-looking guidance
}

/**
 * Cache for storing extracted metrics to avoid processing the same filing multiple times
 */
const metricsCache: Record<string, FinancialMetrics> = {};

/**
 * Analyze an SEC filing to extract financial metrics, detect anomalies, etc.
 * 
 * @param filingText The text content of the SEC filing
 * @param filingType The type of filing (10-K, 10-Q, 8-K, etc.)
 * @param ticker The company ticker symbol
 * @param previousPeriods Array of previous filings for the same company (optional)
 * @param options Additional analysis options
 * @returns A promise that resolves to the analysis results
 */
export async function analyzeSECFiling(
  filingText: string, 
  filingType: string, 
  ticker: string,
  previousPeriods: { filingText: string; filingType: string }[] = [],
  options: SECAnalysisOptions = {}
): Promise<SECAnalysisResponse> {
  try {
    // Default options
    const defaultOptions: Required<SECAnalysisOptions> = {
      includePreviousPeriod: previousPeriods.length > 0,
      detectAnomalies: previousPeriods.length > 0,
      includeRisks: true,
      includeGuidance: true
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Generate cache key
    const cacheKey = `${ticker}_${filingType}_${filingText.slice(0, 100)}`;
    
    // Check if metrics are already in cache
    let currentMetrics: FinancialMetrics | null = metricsCache[cacheKey] || null;
    
    // If not in cache, extract metrics
    if (!currentMetrics) {
      const extractionResult = await extractMetrics(filingText, filingType, ticker, {
        includeRisks: mergedOptions.includeRisks,
        includeGuidance: mergedOptions.includeGuidance
      });
      
      if (extractionResult.error) {
        return { metrics: null, error: extractionResult.error };
      }
      
      currentMetrics = extractionResult.metrics;
      
      // Cache the metrics for future use
      if (currentMetrics) {
        metricsCache[cacheKey] = currentMetrics;
      }
    }
    
    if (!currentMetrics) {
      return { metrics: null, error: 'Failed to extract metrics from filing' };
    }
    
    // If requested, get previous period metrics
    let previousMetrics: FinancialMetrics | undefined = undefined;
    
    if (mergedOptions.includePreviousPeriod && previousPeriods.length > 0) {
      const previousPeriod = previousPeriods[0];
      const previousCacheKey = `${ticker}_${previousPeriod.filingType}_${previousPeriod.filingText.slice(0, 100)}`;
      
      // Check if previous metrics are already in cache
      previousMetrics = metricsCache[previousCacheKey];
      
      // If not in cache, extract previous metrics
      if (!previousMetrics) {
        const previousExtractionResult = await extractMetrics(
          previousPeriod.filingText, 
          previousPeriod.filingType,
          ticker,
          { includeRisks: false, includeGuidance: false }
        );
        
        if (!previousExtractionResult.error && previousExtractionResult.metrics) {
          previousMetrics = previousExtractionResult.metrics;
          // Cache the previous metrics
          metricsCache[previousCacheKey] = previousMetrics;
        }
      }
    }
    
    // Detect anomalies if requested and if we have enough historical data
    let anomalies: FinancialAnomaly[] | undefined = undefined;
    
    if (mergedOptions.detectAnomalies && previousPeriods.length >= 3) {
      // Extract metrics from all previous periods if not already in cache
      const historicalMetrics: FinancialMetrics[] = [];
      
      for (const period of previousPeriods) {
        const historicalCacheKey = `${ticker}_${period.filingType}_${period.filingText.slice(0, 100)}`;
        
        // Check if in cache
        let periodMetrics = metricsCache[historicalCacheKey];
        
        // If not in cache, extract metrics
        if (!periodMetrics) {
          const extractionResult = await extractMetrics(
            period.filingText, 
            period.filingType,
            ticker,
            { includeRisks: false, includeGuidance: false }
          );
          
          if (!extractionResult.error && extractionResult.metrics) {
            periodMetrics = extractionResult.metrics;
            // Cache the metrics
            metricsCache[historicalCacheKey] = periodMetrics;
          }
        }
        
        if (periodMetrics) {
          historicalMetrics.push(periodMetrics);
        }
      }
      
      // Detect anomalies using current and historical metrics
      if (historicalMetrics.length >= 3) {
        const anomalyResult = detectAnomalies(currentMetrics, historicalMetrics);
        anomalies = anomalyResult.anomalies;
      }
    }
    
    // Return the analysis results
    return {
      metrics: currentMetrics,
      previousMetrics,
      anomalies,
    };
  } catch (error) {
    console.error('Error analyzing SEC filing:', error);
    return { 
      metrics: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

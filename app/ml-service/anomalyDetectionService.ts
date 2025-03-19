import { FinancialMetrics } from './metricsExtractionService';

/**
 * Represents an anomaly detected in financial data
 */
export interface FinancialAnomaly {
  metricName: string;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  deviation: number; // How many standard deviations from the mean
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

/**
 * Response from the anomaly detection function
 */
export interface AnomalyDetectionResponse {
  anomalies: FinancialAnomaly[];
  error?: string;
}

/**
 * Options for anomaly detection
 */
export interface AnomalyDetectionOptions {
  deviationThreshold?: number; // Number of standard deviations to consider anomalous
  prioritizeMetrics?: string[]; // Which metrics to prioritize for anomaly detection
  industryContext?: string; // Industry context for more accurate anomaly detection
}

/**
 * Detect anomalies in a company's financial metrics by comparing to historical data
 * 
 * @param currentMetrics The current period's financial metrics
 * @param historicalMetrics Array of historical financial metrics for comparison
 * @param options Additional detection options
 * @returns A promise that resolves to detected anomalies or error
 */
export function detectAnomalies(
  currentMetrics: FinancialMetrics,
  historicalMetrics: FinancialMetrics[],
  options: AnomalyDetectionOptions = {}
): AnomalyDetectionResponse {
  try {
    // Default options
    const defaultOptions: Required<AnomalyDetectionOptions> = {
      deviationThreshold: 2.0, // 2 standard deviations is common for anomaly detection
      prioritizeMetrics: [
        'revenue', 
        'grossMargin', 
        'operatingIncome', 
        'netIncome',
        'earningsPerShare',
        'freeCashFlow'
      ],
      industryContext: ''
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Make sure we have enough historical data
    if (historicalMetrics.length < 3) {
      return {
        anomalies: [],
        error: 'Not enough historical data for reliable anomaly detection (minimum 3 periods required)'
      };
    }
    
    const anomalies: FinancialAnomaly[] = [];
    
    // Define the metrics we want to check for anomalies
    // If prioritizeMetrics is set, use those; otherwise use a default set
    const metricsToCheck = mergedOptions.prioritizeMetrics.length > 0
      ? mergedOptions.prioritizeMetrics
      : ['revenue', 'grossMargin', 'operatingIncome', 'netIncome', 'earningsPerShare', 'freeCashFlow'];
      
    // Check each metric for anomalies
    for (const metricName of metricsToCheck) {
      // Skip if current metric is undefined
      if (currentMetrics[metricName as keyof FinancialMetrics] === undefined) {
        continue;
      }
      
      // Get historical values for this metric
      const historicalValues = historicalMetrics
        .map(m => m[metricName as keyof FinancialMetrics])
        .filter((value): value is number => value !== undefined);
        
      if (historicalValues.length < 3) {
        // Not enough historical data for this specific metric
        continue;
      }
      
      // Calculate mean and standard deviation of historical values
      const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
      const squaredDiffs = historicalValues.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / historicalValues.length;
      const stdDev = Math.sqrt(variance);
      
      // Get current value
      const currentValue = currentMetrics[metricName as keyof FinancialMetrics] as number;
      
      // Calculate how many standard deviations the current value is from the mean
      const deviation = Math.abs((currentValue - mean) / stdDev);
      
      // Check if it exceeds our threshold
      if (deviation > mergedOptions.deviationThreshold) {
        // Determine severity based on deviation
        let severity: 'low' | 'medium' | 'high';
        if (deviation > 3.0) {
          severity = 'high';
        } else if (deviation > 2.5) {
          severity = 'medium';
        } else {
          severity = 'low';
        }
        
        // Create explanation
        const direction = currentValue > mean ? 'higher' : 'lower';
        const percentChange = Math.abs(((currentValue - mean) / mean) * 100).toFixed(1);
        
        let explanation = `The ${metricName} is ${direction} than historical average by ${percentChange}%. `;
        
        // Add more context based on the metric type
        switch(metricName) {
          case 'grossMargin':
            explanation += direction === 'higher' 
              ? 'This could indicate improved production efficiency or pricing power.' 
              : 'This could indicate increased production costs or pricing pressure.';
            break;
          case 'revenue':
            explanation += direction === 'higher'
              ? 'This could indicate strong growth or a successful new product/market.'
              : 'This could indicate declining market share or product issues.';
            break;
          case 'netIncome':
          case 'operatingIncome':
            explanation += direction === 'higher'
              ? 'This could indicate improved operational efficiency or cost controls.'
              : 'This could indicate increased costs or operational challenges.';
            break;
          case 'freeCashFlow':
            explanation += direction === 'higher'
              ? 'This could indicate improved cash generation or reduced capital expenditures.'
              : 'This could indicate issues with cash conversion or increased investments.';
            break;
          default:
            explanation += 'This deviation from historical patterns may warrant further investigation.';
        }
        
        // Add anomaly to the list
        anomalies.push({
          metricName,
          value: currentValue,
          expectedRange: {
            min: mean - stdDev,
            max: mean + stdDev
          },
          deviation,
          severity,
          explanation
        });
      }
    }
    
    // Sort anomalies by severity (high to low) and then by deviation (high to low)
    const sortedAnomalies = anomalies.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.deviation - a.deviation;
    });
    
    return { anomalies: sortedAnomalies };
  } catch (error: unknown) {
    console.error('Error detecting anomalies:', error);
    return { 
      anomalies: [],
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

interface Trend {
  metric: string;
  trendType: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number;
  recentValue: number;
  percentChangeFromEarliest: number;
  periods: string[];
}

/**
 * Identify trends in a company's financial metrics over time
 * 
 * @param historicalMetrics Array of historical financial metrics in chronological order
 * @returns An object containing identified trends
 */
export function identifyTrends(historicalMetrics: FinancialMetrics[]) {
  if (historicalMetrics.length < 4) {
    return {
      trends: [],
      error: 'Not enough historical data for reliable trend identification (minimum 4 periods required)'
    };
  }
  
  // Sort metrics by fiscal year and period to ensure chronological order
  const sortedMetrics = [...historicalMetrics].sort((a, b) => {
    // First compare years
    const yearA = parseInt(a.fiscalYear);
    const yearB = parseInt(b.fiscalYear);
    if (yearA !== yearB) return yearA - yearB;
    
    // If years are the same, compare quarters
    const quarterMap: Record<string, number> = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4, 'Full Year': 5 };
    const quarterA = quarterMap[a.fiscalPeriod] || 0;
    const quarterB = quarterMap[b.fiscalPeriod] || 0;
    return quarterA - quarterB;
  });
  
  // Define metrics to analyze for trends
  const metricsToAnalyze = [
    'revenue', 
    'grossMargin', 
    'operatingIncome', 
    'netIncome',
    'earningsPerShare',
    'freeCashFlow'
  ];
  
  const trends: Trend[] = [];
  
  // For each metric, analyze its trend
  for (const metric of metricsToAnalyze) {
    // Extract values for this metric
    const values = sortedMetrics
      .map(m => ({
        value: m[metric as keyof FinancialMetrics],
        period: `${m.fiscalPeriod} ${m.fiscalYear}`
      }))
      .filter((item): item is { value: number, period: string } => 
        item.value !== undefined && !isNaN(item.value));
    
    if (values.length < 4) continue; // Skip if not enough data points
    
    // Calculate period-over-period changes
    const changes = values.slice(1).map((current, index) => ({
      from: values[index].period,
      to: current.period,
      percentChange: ((current.value - values[index].value) / values[index].value) * 100
    }));
    
    // Determine if there's a consistent trend
    let trendType: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
    let trendStrength = 0;
    
    // Check consecutive changes in the same direction
    let increasingCount = 0;
    let decreasingCount = 0;
    
    for (const change of changes) {
      if (change.percentChange > 1) { // More than 1% increase
        increasingCount++;
        decreasingCount = 0;
      } else if (change.percentChange < -1) { // More than 1% decrease
        decreasingCount++;
        increasingCount = 0;
      } else { // Relatively stable (-1% to 1%)
        increasingCount = 0;
        decreasingCount = 0;
      }
      
      // Update trend type based on consecutive counts
      if (increasingCount >= 2) {
        trendType = 'increasing';
        trendStrength = increasingCount;
      } else if (decreasingCount >= 2) {
        trendType = 'decreasing';
        trendStrength = decreasingCount;
      }
    }
    
    // If no clear increasing/decreasing trend, check for volatility
    if (trendType === 'stable') {
      const volatility = Math.std(changes.map(c => c.percentChange));
      if (volatility > 10) { // More than 10% standard deviation
        trendType = 'volatile';
        trendStrength = Math.round(volatility / 10 * 100) / 100; // Scale the strength
      }
    }
    
    // Only add significant trends
    if (trendType !== 'stable' || trendStrength > 0) {
      trends.push({
        metric,
        trendType,
        strength: trendStrength,
        recentValue: values[values.length - 1].value,
        percentChangeFromEarliest: ((values[values.length - 1].value - values[0].value) / values[0].value) * 100,
        periods: values.map(v => v.period)
      });
    }
  }
  
  return { trends };
}

// Helper function to calculate standard deviation
declare global {
  interface Math {
    std(values: number[]): number;
  }
}

// Add standard deviation calculation to Math object
Math.std = function(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

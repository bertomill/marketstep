import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { fetchStockData } from './stockDataService';

/**
 * Stock price data point
 */
export interface StockDataPoint {
  date: string;
  price: number;
}

/**
 * Prediction result
 */
export interface PredictionResult {
  predictedPrices: Array<{
    date: string;
    actual?: number;
    predicted: number;
  }>;
  slope: number;
  intercept: number;
  r2: number;
  trend: 'up' | 'down' | 'neutral';
  confidence: number;
  dataSource: 'api' | 'fallback';
  symbol: string;
  lastRefreshed?: string;
  error?: string;
}

/**
 * Fetch stock data and predict future prices
 * 
 * @param symbol Stock ticker symbol
 * @param historyDays Number of days of historical data to use
 * @param futureDays Number of days to predict into the future
 * @returns Promise with prediction result
 */
export async function fetchAndPredictStockPrices(
  symbol: string,
  historyDays: number = 60,
  futureDays: number = 30
): Promise<PredictionResult> {
  // Fetch real stock data from API
  const stockDataResult = await fetchStockData(symbol, historyDays);
  
  // Run the prediction model on the fetched data
  const predictionResult = predictStockPrices(stockDataResult.data, futureDays);
  
  // Add metadata to the prediction result
  return {
    ...predictionResult,
    dataSource: stockDataResult.source,
    symbol: stockDataResult.symbol,
    lastRefreshed: stockDataResult.lastRefreshed,
    error: stockDataResult.error
  };
}

/**
 * Simple linear regression model for stock price prediction
 * 
 * @param historicalData Array of historical stock prices
 * @param daysToPredict Number of days to predict into the future
 * @returns Prediction result with predicted prices and model metrics
 */
export function predictStockPrices(
  historicalData: StockDataPoint[],
  daysToPredict: number = 30
): PredictionResult {
  // Sort data by date
  const sortedData = [...historicalData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Create x (days) and y (prices) arrays for regression
  const x: number[] = [];
  const y: number[] = [];
  
  sortedData.forEach((dataPoint, index) => {
    x.push(index);
    y.push(dataPoint.price);
  });
  
  // Create and train the regression model
  const regression = new SimpleLinearRegression(x, y);
  
  // Get model metrics
  const slope = regression.slope;
  const intercept = regression.intercept;
  const r2Score = regression.score(x, y); // R-squared value
  const r2 = typeof r2Score === 'number' ? r2Score : 0.5; // Default to 0.5 if not a number
  
  // Determine trend
  const trend: 'up' | 'down' | 'neutral' = 
    slope > 0.01 ? 'up' : (slope < -0.01 ? 'down' : 'neutral');
  
  // Calculate confidence (simplified as absolute r2 value)
  const confidence = Math.abs(r2) * 100;
  
  // Generate predictions
  const predictedPrices = [];
  
  // Include historical data with predictions
  for (let i = 0; i < sortedData.length; i++) {
    predictedPrices.push({
      date: sortedData[i].date,
      actual: sortedData[i].price,
      predicted: regression.predict(i)
    });
  }
  
  // Add future predictions
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  
  for (let i = 1; i <= daysToPredict; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(lastDate.getDate() + i);
    
    predictedPrices.push({
      date: futureDate.toISOString().split('T')[0],
      predicted: regression.predict(x.length - 1 + i)
    });
  }
  
  return {
    predictedPrices,
    slope,
    intercept,
    r2,
    trend,
    confidence,
    dataSource: 'api', // Default, will be overridden in fetchAndPredictStockPrices
    symbol: '' // Default, will be overridden in fetchAndPredictStockPrices
  };
}

/**
 * Generate sample stock data for demonstration
 * 
 * @param days Number of days of historical data
 * @param startPrice Starting price
 * @param volatility Price volatility factor
 * @returns Array of sample stock data points
 */
export function generateSampleStockData(
  days: number = 60,
  startPrice: number = 100,
  volatility: number = 2,
  trend: number = 0.1
): StockDataPoint[] {
  const data: StockDataPoint[] = [];
  const today = new Date();
  let price = startPrice;
  
  for (let i = days; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Add some randomness to the price
    const change = (Math.random() - 0.5) * volatility + trend;
    price = Math.max(0, price + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
}

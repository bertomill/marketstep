import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { RandomForestRegression as RandomForest } from 'ml-random-forest';
import MLR from 'ml-regression-multivariate-linear';
import { fetchStockData } from './stockDataService';

/**
 * Stock price data point
 */
export interface StockDataPoint {
  date: string;
  price: number;
}

/**
 * Model type options
 */
export type ModelType = 'simple-linear' | 'multivariate' | 'random-forest';

// Define a type for hyperparameters
interface ModelHyperparameters {
  features?: number;
  nEstimators?: number;
  maxFeatures?: number;
  replacement?: boolean;
  seed?: number;
}

/**
 * Model explanation
 */
export interface ModelExplanation {
  name: string;
  description: string;
  strengths: string[];
  limitations: string[];
  features: string[];
  hyperparameters?: ModelHyperparameters;
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
  slope?: number;
  intercept?: number;
  r2: number;
  trend: 'up' | 'down' | 'neutral';
  confidence: number;
  dataSource: 'api' | 'fallback';
  symbol: string;
  lastRefreshed?: string;
  error?: string;
  modelType: ModelType;
  modelExplanation: ModelExplanation;
}

/**
 * Fetch stock data and predict future prices
 * 
 * @param symbol Stock ticker symbol
 * @param historyDays Number of days of historical data to use
 * @param futureDays Number of days to predict into the future
 * @param modelType Type of model to use for prediction
 * @returns Promise with prediction result
 */
export async function fetchAndPredictStockPrices(
  symbol: string,
  historyDays: number = 60,
  futureDays: number = 30,
  modelType: ModelType = 'random-forest'
): Promise<PredictionResult> {
  try {
    // Fetch real stock data from API
    const stockDataResult = await fetchStockData(symbol, historyDays);
    
    // Validate that we have enough data points for prediction
    if (!stockDataResult.data || stockDataResult.data.length < 5) {
      throw new Error('Insufficient data points for prediction');
    }
    
    // Run the prediction model on the fetched data
    const predictionResult = predictStockPrices(stockDataResult.data, futureDays, modelType);
    
    // Add metadata to the prediction result
    return {
      ...predictionResult,
      dataSource: stockDataResult.source,
      symbol: stockDataResult.symbol,
      lastRefreshed: stockDataResult.lastRefreshed,
      error: stockDataResult.error
    };
  } catch (error) {
    console.error('Error in stock price prediction:', error);
    
    // Generate fallback data if prediction fails
    const fallbackData = generateSampleStockData(historyDays, 100, 2, 0.1);
    const fallbackPrediction = predictStockPrices(fallbackData, futureDays, 'simple-linear');
    
    return {
      ...fallbackPrediction,
      dataSource: 'fallback',
      symbol,
      lastRefreshed: new Date().toISOString().split('T')[0],
      error: error instanceof Error ? error.message : 'Unknown prediction error'
    };
  }
}

/**
 * Get model explanation based on model type
 * 
 * @param modelType Type of model
 * @param hyperparameters Optional hyperparameters used
 * @returns Model explanation
 */
function getModelExplanation(modelType: ModelType, hyperparameters?: ModelHyperparameters): ModelExplanation {
  switch (modelType) {
    case 'simple-linear':
      return {
        name: 'Simple Linear Regression',
        description: 'A basic statistical model that fits a straight line to the data points, assuming a linear relationship between time and price.',
        strengths: [
          'Easy to understand and interpret',
          'Computationally efficient',
          'Works well for short-term trends with stable patterns'
        ],
        limitations: [
          'Cannot capture non-linear relationships',
          'Sensitive to outliers',
          'Does not account for market volatility or external factors',
          'Assumes constant rate of change over time'
        ],
        features: ['Time (sequential day index)'],
        hyperparameters
      };
    
    case 'multivariate':
      return {
        name: 'Multivariate Linear Regression',
        description: 'An extension of simple linear regression that uses multiple features derived from the time series data to make predictions.',
        strengths: [
          'Can capture more complex relationships than simple linear regression',
          'Incorporates multiple aspects of the price history',
          'Still relatively easy to interpret'
        ],
        limitations: [
          'Still assumes linear relationships between features and target',
          'May overfit with too many features',
          'Cannot capture highly non-linear market behaviors'
        ],
        features: [
          'Time (sequential day index)',
          'Moving averages (5-day, 10-day)',
          'Price momentum',
          'Price volatility'
        ],
        hyperparameters
      };
    
    case 'random-forest':
      return {
        name: 'Random Forest Regression',
        description: 'An ensemble learning method that builds multiple decision trees and merges their predictions to create a more robust model.',
        strengths: [
          'Can capture non-linear relationships in the data',
          'Robust to outliers and noise',
          'Handles feature interactions automatically',
          'Less prone to overfitting than single decision trees'
        ],
        limitations: [
          'More complex and computationally intensive',
          'Less interpretable than linear models',
          'Still limited by the quality and quantity of historical data',
          'May struggle with long-term predictions in highly volatile markets'
        ],
        features: [
          'Time (sequential day index)',
          'Moving averages (5-day, 10-day, 20-day)',
          'Price momentum',
          'Price volatility',
          'Relative strength indicators',
          'Day of week patterns'
        ],
        hyperparameters
      };
    
    default:
      return {
        name: 'Unknown Model',
        description: 'Model details not available',
        strengths: [],
        limitations: ['Unknown model limitations'],
        features: []
      };
  }
}

/**
 * Generate features for advanced models
 * 
 * @param prices Array of historical prices
 * @returns Features array for each data point
 */
function generateFeatures(prices: number[]): number[][] {
  const features: number[][] = [];
  
  for (let i = 0; i < prices.length; i++) {
    const feature: number[] = [];
    
    // Basic time index
    feature.push(i);
    
    // Current price
    feature.push(prices[i]);
    
    // 5-day moving average (if enough data)
    if (i >= 4) {
      const ma5 = (prices[i] + prices[i-1] + prices[i-2] + prices[i-3] + prices[i-4]) / 5;
      feature.push(ma5);
    } else {
      feature.push(prices[i]); // Fallback for early data points
    }
    
    // 10-day moving average (if enough data)
    if (i >= 9) {
      let sum = 0;
      for (let j = 0; j < 10; j++) {
        sum += prices[i-j];
      }
      feature.push(sum / 10);
    } else {
      feature.push(prices[i]); // Fallback for early data points
    }
    
    // Price momentum (1-day change)
    if (i > 0) {
      feature.push(prices[i] - prices[i-1]);
    } else {
      feature.push(0);
    }
    
    // Volatility (standard deviation of last 5 days if available)
    if (i >= 4) {
      const recentPrices = prices.slice(i-4, i+1);
      const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const variance = recentPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentPrices.length;
      feature.push(Math.sqrt(variance));
    } else {
      feature.push(0);
    }
    
    // Day of week cyclical features (assuming weekdays only)
    // Convert to sine and cosine components to represent cyclical nature
    const dayOfWeek = i % 5; // 0-4 representing Monday-Friday
    feature.push(Math.sin(2 * Math.PI * dayOfWeek / 5));
    feature.push(Math.cos(2 * Math.PI * dayOfWeek / 5));
    
    features.push(feature);
  }
  
  return features;
}

/**
 * Stock price prediction using selected model
 * 
 * @param historicalData Array of historical stock prices
 * @param daysToPredict Number of days to predict into the future
 * @param modelType Type of model to use
 * @returns Prediction result with predicted prices and model metrics
 */
export function predictStockPrices(
  historicalData: StockDataPoint[],
  daysToPredict: number = 30,
  modelType: ModelType = 'random-forest'
): PredictionResult {
  // Sort data by date
  const sortedData = [...historicalData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Extract prices
  const prices = sortedData.map(d => d.price);
  
  // Initialize variables for prediction
  const predictedPrices: number[] = [];
  let r2 = 0;
  let slope: number | undefined;
  let intercept: number | undefined;
  let hyperparameters: ModelHyperparameters = {};
  
  // Generate prediction based on selected model
  if (modelType === 'simple-linear') {
    // Simple linear regression (original implementation)
    const x = sortedData.map((_, index) => index);
    const y = prices;
    
    const regression = new SimpleLinearRegression(x, y);
    slope = regression.slope;
    intercept = regression.intercept;
    
    // Calculate R² (coefficient of determination)
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const totalVariance = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const residualVariance = y.reduce((a, b, i) => a + Math.pow(b - regression.predict(x[i]), 2), 0);
    r2 = 1 - (residualVariance / totalVariance);
    
    // Predict future prices
    for (let i = 0; i < daysToPredict; i++) {
      const futureX = x.length + i;
      predictedPrices.push(regression.predict(futureX));
    }
  } 
  else if (modelType === 'multivariate') {
    // Multivariate linear regression
    // Generate features from the time series
    const features = generateFeatures(prices);
    
    // Train the model - MLR expects features as a 2D array
    const mlr = new MLR(features, prices.map(p => [p]));
    hyperparameters = { features: features[0].length };
    
    // Calculate R² for multivariate model
    const predictions = features.map(f => mlr.predict([f])[0][0]);
    const yMean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const totalVariance = prices.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const residualVariance = prices.reduce((a, b, i) => a + Math.pow(b - predictions[i], 2), 0);
    r2 = 1 - (residualVariance / totalVariance);
    
    // Predict future prices
    const lastFeatures = features[features.length - 1];
    for (let i = 0; i < daysToPredict; i++) {
      // Create a new feature vector for the future day
      const futureFeature = [...lastFeatures];
      futureFeature[0] = features.length + i; // Update time index
      
      // If we've predicted prices already, use them to update other features
      if (predictedPrices.length > 0) {
        futureFeature[1] = predictedPrices[predictedPrices.length - 1]; // Use last predicted price
        
        // Update moving averages and other features based on previous predictions
        // (simplified implementation)
      }
      
      const prediction = mlr.predict([futureFeature])[0][0];
      predictedPrices.push(prediction);
    }
  }
  else if (modelType === 'random-forest') {
    // Random Forest regression
    const features = generateFeatures(prices);
    
    // Configure Random Forest hyperparameters
    const rfOptions = {
      nEstimators: 50,
      maxFeatures: 3,
      replacement: true,
      seed: 42
    };
    hyperparameters = rfOptions;
    
    // Train the model
    const rf = new RandomForest(rfOptions);
    rf.train(features, prices);
    
    // Calculate R² for random forest model
    const predictions = features.map(f => rf.predict([f])[0]);
    const yMean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const totalVariance = prices.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const residualVariance = prices.reduce((a, b, i) => a + Math.pow(b - predictions[i], 2), 0);
    r2 = 1 - (residualVariance / totalVariance);
    
    // Predict future prices
    let lastFeatures = [...features[features.length - 1]];
    for (let i = 0; i < daysToPredict; i++) {
      // Update time index
      lastFeatures[0] = features.length + i;
      
      // If we've predicted prices already, use them to update other features
      if (predictedPrices.length > 0) {
        lastFeatures[1] = predictedPrices[predictedPrices.length - 1];
        
        // Update other features based on previous predictions
        // (simplified implementation)
      }
      
      const prediction = rf.predict([lastFeatures])[0];
      predictedPrices.push(prediction);
      
      // Update features for next prediction
      lastFeatures = [...lastFeatures];
      lastFeatures[1] = prediction;
    }
  }
  
  // Ensure R² is within valid range
  r2 = Math.max(0, Math.min(1, r2));
  
  // Determine trend direction
  const trend = predictedPrices[predictedPrices.length - 1] > prices[prices.length - 1] 
    ? 'up' 
    : predictedPrices[predictedPrices.length - 1] < prices[prices.length - 1]
      ? 'down'
      : 'neutral';
  
  // Calculate confidence based on R²
  const confidence = r2 * 100;
  
  // Generate dates for predictions
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  const predictedDates: string[] = [];
  
  for (let i = 0; i < daysToPredict; i++) {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i + 1);
    
    // Skip weekends (simplified approach)
    if (date.getDay() === 0) date.setDate(date.getDate() + 1); // Skip Sunday
    if (date.getDay() === 6) date.setDate(date.getDate() + 2); // Skip Saturday
    
    predictedDates.push(date.toISOString().split('T')[0]);
  }
  
  // Format the predicted prices with dates
  const formattedPredictions = predictedPrices.map((price, i) => ({
    date: predictedDates[i],
    predicted: price
  }));
  
  // Add historical data as "actual" prices
  const historicalWithPrediction = sortedData.map(d => ({
    date: d.date,
    actual: d.price,
    predicted: d.price // For historical data, predicted = actual
  }));
  
  // Get model explanation
  const modelExplanation = getModelExplanation(modelType, hyperparameters);
  
  return {
    predictedPrices: [...historicalWithPrediction, ...formattedPredictions],
    slope,
    intercept,
    r2,
    trend,
    confidence,
    dataSource: 'api', // Will be overridden by caller if needed
    symbol: '',        // Will be set by caller
    modelType,
    modelExplanation
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
  const today = new Date();
  const stockData: StockDataPoint[] = [];
  let price = startPrice;
  
  for (let i = days; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    // Add some randomness to the price
    const change = (Math.random() - 0.5) * volatility + trend;
    price = Math.max(0, price * (1 + change / 100));
    
    stockData.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return stockData;
}

export async function predictStockPrice(symbol: string, days: number): Promise<PredictionResult> {
  try {
    // Get historical data
    const historicalData = await getHistoricalData(symbol);
    
    // Prepare data for training
    const { dates, prices } = prepareTrainingData(historicalData);
    
    // Train model
    const model = await trainModel(dates, prices);
    
    // Generate future dates
    const futureDates = generateFutureDates(dates[dates.length - 1], days);
    
    // Make predictions
    const predictedPrices = await model.predict(futureDates);
    
    // Calculate R² score
    const r2 = calculateR2Score(prices, predictedPrices);
    
    return {
      dates: futureDates,
      prices: predictedPrices,
      r2
    };
  } catch (error: unknown) {
    console.error('Error predicting stock price:', error);
    throw new Error('Failed to predict stock price');
  }
}

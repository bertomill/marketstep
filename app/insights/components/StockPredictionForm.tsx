import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Search, BarChart3, AlertTriangle } from 'lucide-react';
import { 
  fetchAndPredictStockPrices, 
  PredictionResult 
} from '@/app/ml-service/stockPredictionService';

interface StockPredictionFormProps {
  onPredictionGenerated: (result: PredictionResult, ticker: string) => void;
}

export function StockPredictionForm({ onPredictionGenerated }: StockPredictionFormProps) {
  const [ticker, setTicker] = useState('');
  const [historyDays, setHistoryDays] = useState(60);
  const [futureDays, setFutureDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStatus('Fetching historical stock data...');

    try {
      // Fetch real stock data and generate prediction
      const predictionResult = await fetchAndPredictStockPrices(
        ticker.toUpperCase(),
        historyDays,
        futureDays
      );

      setLoadingStatus('Analyzing data and generating prediction...');

      // Check if we're using fallback data
      if (predictionResult.dataSource === 'fallback') {
        setError(`Warning: Using simulated data because API request failed. ${predictionResult.error || ''}`);
      }

      // Pass the result to the parent component
      onPredictionGenerated(predictionResult, ticker.toUpperCase());
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to generate prediction. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Stock Price Prediction
        </CardTitle>
        <CardDescription>
          Generate a ML-based price prediction using real historical data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium mb-1">
              Stock Ticker Symbol
            </label>
            <div className="relative">
              <Input
                id="ticker"
                placeholder="e.g. AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="pr-10"
                maxLength={5}
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label htmlFor="historyDays" className="block text-sm font-medium mb-1">
              Historical Data Days: {historyDays}
            </label>
            <Slider
              id="historyDays"
              min={30}
              max={180}
              step={5}
              value={[historyDays]}
              onValueChange={(values: number[]) => setHistoryDays(values[0])}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Amount of historical data to use for training the model
            </p>
          </div>

          <div>
            <label htmlFor="futureDays" className="block text-sm font-medium mb-1">
              Prediction Days: {futureDays}
            </label>
            <Slider
              id="futureDays"
              min={7}
              max={90}
              step={1}
              value={[futureDays]}
              onValueChange={(values: number[]) => setFutureDays(values[0])}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Number of days to predict into the future
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingStatus || 'Processing...'}
              </>
            ) : (
              'Generate Prediction'
            )}
          </Button>

          <div className="text-xs text-muted-foreground space-y-2 mt-2">
            <p>
              <strong>Data Source:</strong> Finnhub API (daily closing prices)
            </p>
            <p>
              <strong>Model:</strong> Simple linear regression on time series data
            </p>
            <p>
              <strong>Note:</strong> This is a simplified model for demonstration purposes. 
              Real stock predictions require more sophisticated models and additional factors.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

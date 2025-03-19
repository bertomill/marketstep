import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionResult } from '@/app/ml-service/stockPredictionService';
import { ParentSize } from '@visx/responsive';
import { XYChart, AnimatedLineSeries, Tooltip, AnimatedAxis, Grid, Annotation } from '@visx/xychart';
import { curveMonotoneX } from '@visx/curve';
import { format } from 'date-fns';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface StockDataPoint {
  date: string;
  price: number;
  isProjection?: boolean;
}

interface StockPredictionChartProps {
  predictionResult: PredictionResult;
  ticker: string;
}

export function StockPredictionChart({ predictionResult, ticker }: StockPredictionChartProps) {
  const { predictedPrices, r2, confidence, trend, error, dataSource } = predictionResult;
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Prepare data for chart
  const historicalData: StockDataPoint[] = predictedPrices
    .filter(p => p.actual !== undefined)
    .map(p => ({ date: p.date, price: p.actual as number }));
  
  const predictedData: StockDataPoint[] = predictedPrices.map(p => ({ 
    date: p.date, 
    price: p.predicted,
    isProjection: p.actual === undefined
  }));

  // Find the index where prediction starts
  const predictionStartIndex = historicalData.length > 0 ? historicalData.length - 1 : 0;
  const predictionStartDate = historicalData.length > 0 
    ? historicalData[historicalData.length - 1].date 
    : predictedData.length > 0 ? predictedData[0].date : '';

  // Combine historical and predicted data for the chart
  const allData = [...historicalData, ...predictedData];
  
  // Get min and max values for better axis scaling
  const prices = allData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95; // Add 5% padding
  const maxPrice = Math.max(...prices) * 1.05; // Add 5% padding

  // Determine trend color
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-yellow-500';
  };

  // Get confidence level text
  const getConfidenceText = () => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  // Get confidence level color
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get R² score text
  const getR2ScoreText = () => {
    if (r2 >= 0.7) return 'Strong';
    if (r2 >= 0.4) return 'Moderate';
    return 'Weak';
  };

  // Get R² score color
  const getR2ScoreColor = () => {
    if (r2 >= 0.7) return 'text-green-500';
    if (r2 >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Prediction Error</CardTitle>
          <CardDescription>There was an error generating the prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg">{ticker.toUpperCase()} Stock Price Prediction</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Historical and projected stock prices
            </CardDescription>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <InfoCircledIcon className="h-3 w-3" />
            <span>Data: {dataSource === 'api' ? 'Alpha Vantage API' : 'Demo Data'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[250px] sm:h-[300px]">
          <ParentSize>
            {({ width, height }) => (
              <XYChart 
                height={height} 
                width={width}
                xScale={{ type: 'band', paddingInner: 0.3 }}
                yScale={{ type: 'linear', domain: [minPrice, maxPrice] }}
              >
                <AnimatedAxis 
                  orientation="bottom" 
                  label="Date" 
                  labelOffset={15}
                  tickFormat={(value) => {
                    // Only show some of the dates to avoid overcrowding
                    const date = new Date(value);
                    // On small screens, show fewer labels
                    return width < 500 ? format(date, 'MM/dd') : format(date, 'MMM dd');
                  }}
                  numTicks={width < 500 ? 5 : 10}
                />
                <AnimatedAxis 
                  orientation="left" 
                  label="Price (USD)" 
                  labelOffset={40}
                  tickFormat={(value) => {
                    return formatPrice(value).replace('$', '');
                  }}
                  numTicks={width < 500 ? 4 : 5}
                />
                <Grid columns={false} numTicks={5} />
                
                {/* Historical data line */}
                <AnimatedLineSeries
                  dataKey="Historical"
                  data={historicalData}
                  xAccessor={(d: StockDataPoint) => d.date}
                  yAccessor={(d: StockDataPoint) => d.price}
                  curve={curveMonotoneX}
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                
                {/* Predicted data line */}
                <AnimatedLineSeries
                  dataKey="Predicted"
                  data={predictedData}
                  xAccessor={(d: StockDataPoint) => d.date}
                  yAccessor={(d: StockDataPoint) => d.price}
                  curve={curveMonotoneX}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray={predictedData[0]?.isProjection ? "4,4" : ""}
                />
                
                {/* Annotation for prediction start - only show on larger screens */}
                {predictionStartDate && width >= 500 && (
                  <Annotation
                    dataKey="Predicted"
                    datum={{ date: predictionStartDate, price: predictedData[predictionStartIndex]?.price || 0 }}
                    dx={0}
                    dy={-40}
                  >
                    {/* Use custom annotation elements instead of Annotation.Line and Annotation.Label */}
                    <line 
                      x1={0} 
                      y1={0} 
                      x2={0} 
                      y2={-30} 
                      stroke="#f59e0b" 
                      strokeWidth={1} 
                      strokeDasharray="2,2" 
                    />
                    <g transform="translate(-50, -60)">
                      <rect 
                        width={100} 
                        height={30} 
                        fill="white" 
                        fillOpacity={0.8} 
                        stroke="#f59e0b" 
                        strokeWidth={1} 
                        rx={4} 
                      />
                      <text 
                        x={50} 
                        y={12} 
                        fontSize={10} 
                        textAnchor="middle" 
                        fontWeight="bold"
                      >
                        Prediction Start
                      </text>
                      <text 
                        x={50} 
                        y={24} 
                        fontSize={8} 
                        textAnchor="middle"
                      >
                        {formatDate(predictionStartDate)}
                      </text>
                    </g>
                  </Annotation>
                )}
                
                <Tooltip
                  snapTooltipToDatumX
                  snapTooltipToDatumY
                  showVerticalCrosshair
                  showSeriesGlyphs
                  renderTooltip={({ tooltipData }) => {
                    if (!tooltipData?.nearestDatum) return null;
                    
                    const datum = tooltipData.nearestDatum.datum as StockDataPoint;
                    const isProjection = datum.isProjection;
                    
                    return (
                      <div className="bg-white p-2 rounded shadow-lg border text-xs">
                        <div className="font-bold">{formatDate(datum.date)}</div>
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${isProjection ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                          <span>{isProjection ? 'Projected' : 'Historical'} Price: {formatPrice(datum.price)}</span>
                        </div>
                        {isProjection && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Confidence: {(confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </XYChart>
            )}
          </ParentSize>
        </div>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
          <div className="border rounded-md p-2 sm:p-3">
            <div className="text-muted-foreground text-xs mb-1">Trend</div>
            <div className={`font-medium ${getTrendColor()}`}>
              {trend === 'up' ? '↑ Upward' : trend === 'down' ? '↓ Downward' : '→ Sideways'}
            </div>
          </div>
          
          <div className="border rounded-md p-2 sm:p-3">
            <div className="text-muted-foreground text-xs mb-1">Confidence Level</div>
            <div className={`font-medium ${getConfidenceColor()}`}>
              {getConfidenceText()} ({(confidence * 100).toFixed(0)}%)
            </div>
          </div>
          
          <div className="border rounded-md p-2 sm:p-3">
            <div className="text-muted-foreground text-xs mb-1">Model Quality (R²)</div>
            <div className={`font-medium ${getR2ScoreColor()}`}>
              {getR2ScoreText()} ({r2.toFixed(2)})
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="mb-1">
            <strong>Note:</strong> This prediction is based on a simple linear regression model and should not be used as the sole basis for investment decisions.
          </p>
          <p>
            Past performance is not indicative of future results. The model has a coefficient of determination (R²) of {r2.toFixed(2)}, 
            indicating {getR2ScoreText().toLowerCase()} correlation between time and price in the historical data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '../../components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart, AlertTriangle, TrendingUp, BarChart3, Info } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '../components/Sidebar';
import { StockPredictionForm } from './components/StockPredictionForm';
import { StockPredictionChart } from './components/StockPredictionChart';
import { PredictionResult } from '../ml-service/stockPredictionService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MachineLearningInsightsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictionTicker, setPredictionTicker] = useState<string>('');
  const [apiKeyWarning, setApiKeyWarning] = useState<boolean>(false);

  // Check URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handlePredictionGenerated = (result: PredictionResult, ticker: string) => {
    setPredictionResult(result);
    setPredictionTicker(ticker);
    setActiveTab('prediction');
    
    // Check if we're using fallback data due to missing API key
    if (result.error && result.error.includes('API key')) {
      setApiKeyWarning(true);
    } else {
      setApiKeyWarning(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader 
            title="Machine Learning Financial Insights" 
            description="Machine learning-powered analysis of your financial data"
          />
          
          {apiKeyWarning && (
            <Alert variant="warning" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Key Required</AlertTitle>
              <AlertDescription>
                To use real stock data, you need to set up an Alpha Vantage API key. 
                Currently using fallback data for demonstration.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prediction">Stock Prediction</TabsTrigger>
              <TabsTrigger value="filings">SEC Filings Analysis</TabsTrigger>
              <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
              <TabsTrigger value="trends">Financial Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard 
                  title="Stock Price Prediction" 
                  description="ML-based prediction of future stock prices using real market data"
                  icon={<BarChart3 className="h-12 w-12 text-purple-500" />}
                  linkHref="/insights?tab=prediction"
                  linkText="Try Stock Prediction"
                  onClick={() => setActiveTab('prediction')}
                />
                
                <FeatureCard 
                  title="SEC Filings Analysis" 
                  description="Machine Learning-powered extraction of financial metrics from SEC filings"
                  icon={<AreaChart className="h-12 w-12 text-primary" />}
                  linkHref="/sec-filings"
                  linkText="Analyze SEC Filings"
                />
                
                <FeatureCard 
                  title="Anomaly Detection" 
                  description="Identify unusual patterns in financial metrics"
                  icon={<AlertTriangle className="h-12 w-12 text-amber-500" />}
                  linkHref="/insights?tab=anomalies"
                  linkText="View Anomalies"
                  onClick={() => setActiveTab('anomalies')}
                />
                
                <FeatureCard 
                  title="Financial Trends" 
                  description="Track and visualize trends in company performance"
                  icon={<TrendingUp className="h-12 w-12 text-green-500" />}
                  linkHref="/insights?tab=trends"
                  linkText="View Trends"
                  onClick={() => setActiveTab('trends')}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>About Financial Machine Learning Analysis</CardTitle>
                  <CardDescription>How machine learning enhances your financial research</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    MarketStep's Machine Learning financial analysis tools use machine learning to help you make better investment decisions. 
                    Our tools analyze SEC filings, earnings calls, and other financial data to extract key insights that would 
                    take hours to find manually.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-4">Key Features:</h3>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Stock Price Prediction:</strong> Use linear regression to predict future stock prices based on real historical data from Alpha Vantage API.
                    </li>
                    <li>
                      <strong>Automated Metrics Extraction:</strong> Automatically extract revenue, margins, EPS, and dozens of 
                      other financial metrics from dense SEC filings.
                    </li>
                    <li>
                      <strong>Anomaly Detection:</strong> Identify metrics that deviate significantly from historical patterns, 
                      highlighting potential risks or opportunities.
                    </li>
                    <li>
                      <strong>Trend Analysis:</strong> Visualize financial trends over time to spot long-term patterns in 
                      company performance.
                    </li>
                    <li>
                      <strong>Risk Factor Identification:</strong> Machine Learning-powered analysis of risk disclosures to highlight key 
                      concerns.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prediction" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <StockPredictionForm onPredictionGenerated={handlePredictionGenerated} />
                  
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        About This Feature
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        This feature uses the Alpha Vantage API to fetch real historical stock data and applies a linear regression model to predict future prices.
                      </p>
                      <p>
                        <strong>Data Source:</strong> Alpha Vantage API (daily closing prices)
                      </p>
                      <p>
                        <strong>Model:</strong> Simple linear regression on time series data
                      </p>
                      <p>
                        <strong>Transparency:</strong> The UI shows the data source (real or fallback), model quality metrics (R²), and confidence level.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2">
                  {predictionResult ? (
                    <StockPredictionChart 
                      predictionResult={predictionResult} 
                      ticker={predictionTicker} 
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="text-center p-8">
                        <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Prediction Yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter a ticker symbol and generate a prediction to see results here.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="filings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEC Filings Analysis</CardTitle>
                  <CardDescription>Machine Learning-powered extraction of financial metrics from SEC filings</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="mb-6">
                    Our advanced machine learning models can automatically extract key financial metrics from SEC filings, 
                    saving you hours of manual analysis. Simply navigate to a company's SEC filings and click the "ML Analysis" 
                    button to get started.
                  </p>
                  
                  <Link
                    href="/sec-filings"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Go to SEC Filings
                  </Link>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Filing Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>10-K:</strong> Annual reports</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>10-Q:</strong> Quarterly reports</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>8-K:</strong> Significant events</span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-muted mr-2"></div>
                        <span><strong>More coming soon</strong></span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>Revenue & Growth</strong></span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>Profit Margins</strong></span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>EPS & P/E Ratio</strong></span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>Debt & Liquidity Ratios</strong></span>
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        <span><strong>Cash Flow Metrics</strong></span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="anomalies">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <CardDescription>Identify unusual patterns in financial metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This feature is coming soon. Our anomaly detection system will help you identify unusual patterns in 
                    financial metrics that could indicate risks or opportunities.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Trends</CardTitle>
                  <CardDescription>Track and visualize trends in company performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This feature is coming soon. Our trend analysis tools will help you visualize and understand 
                    long-term patterns in company performance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Feature card component for the overview tab
function FeatureCard({ 
  title, 
  description, 
  icon, 
  linkHref, 
  linkText,
  onClick
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  linkHref: string;
  linkText: string;
  onClick?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={linkHref}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={onClick}
        >
          {linkText}
        </Link>
      </CardContent>
    </Card>
  );
}

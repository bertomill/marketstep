'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '../../components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, AlertTriangle, TrendingUp, BarChart3, Info } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '../components/Sidebar';
import { StockPredictionForm } from './components/StockPredictionForm';
import { StockPredictionChart } from './components/StockPredictionChart';
import { PredictionResult } from '../ml-service/stockPredictionService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

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
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:ml-64 p-4 md:p-6 pt-16 md:pt-6">
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
            <TabsList className="mb-4 w-full overflow-x-auto flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="prediction">Stock Prediction</TabsTrigger>
              <TabsTrigger value="filings">SEC Filings Analysis</TabsTrigger>
              <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
              <TabsTrigger value="trends">Financial Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  description="ML-powered trend analysis and forecasting"
                  icon={<TrendingUp className="h-12 w-12 text-green-500" />}
                  linkHref="/insights?tab=trends"
                  linkText="Explore Trends"
                  onClick={() => setActiveTab('trends')}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="prediction" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <StockPredictionForm onPredictionGenerated={handlePredictionGenerated} />
                </div>
                
                <div className="space-y-6">
                  {predictionResult && (
                    <StockPredictionChart 
                      predictionResult={predictionResult}
                      ticker={predictionTicker}
                    />
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="filings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEC Filings Analysis</CardTitle>
                  <CardDescription>
                    Machine learning-powered extraction of financial metrics from SEC filings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This feature is available on the dedicated SEC Filings page.</p>
                  <div className="mt-4">
                    <Link 
                      href="/sec-filings" 
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Go to SEC Filings Analysis
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="anomalies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <CardDescription>
                    Identify unusual patterns in financial metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This feature is coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Trends</CardTitle>
                  <CardDescription>
                    ML-powered trend analysis and forecasting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This feature is coming soon.</p>
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="mb-4">
          {icon}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <div className="bg-muted/50 p-3">
        <Link 
          href={linkHref} 
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={onClick}
        >
          {linkText}
        </Link>
      </div>
    </Card>
  );
}

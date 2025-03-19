'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FinancialMetrics } from '@/app/ml-service/metricsExtractionService';
import { FinancialAnomaly } from '@/app/ml-service/anomalyDetectionService';
import { AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react';

// Format number as currency
const formatCurrency = (value?: number) => {
  if (value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

// Format number as percentage
const formatPercentage = (value?: number) => {
  if (value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

// Determine trend icon and color
const TrendIndicator = ({ value }: { value?: number }) => {
  if (value === undefined) return null;
  
  if (value > 0) {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  } else if (value < 0) {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  
  return null;
};

// Severity badge component
const SeverityBadge = ({ severity }: { severity: 'low' | 'medium' | 'high' }) => {
  const colorMap = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  };
  
  return (
    <Badge variant="outline" className={`${colorMap[severity]} border-none`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

interface FinancialAnalysisProps {
  metrics: FinancialMetrics;
  previousMetrics?: FinancialMetrics;
  anomalies?: FinancialAnomaly[];
  isLoading?: boolean;
}

export function FinancialAnalysis({ 
  metrics, 
  previousMetrics, 
  anomalies = [],
  isLoading = false 
}: FinancialAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate year-over-year or quarter-over-quarter changes
  const calculateChange = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined || previous === 0) {
      return undefined;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-muted h-6 w-48 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-muted h-4 w-32 rounded"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="animate-pulse bg-muted h-4 w-32 rounded"></div>
              <div className="animate-pulse bg-muted h-6 w-full rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  // Derived changes
  const changes = previousMetrics ? {
    revenue: calculateChange(metrics.revenue, previousMetrics.revenue),
    grossProfit: calculateChange(metrics.grossProfit, previousMetrics.grossProfit),
    grossMargin: metrics.grossMargin !== undefined && previousMetrics.grossMargin !== undefined 
      ? metrics.grossMargin - previousMetrics.grossMargin
      : undefined,
    operatingIncome: calculateChange(metrics.operatingIncome, previousMetrics.operatingIncome),
    netIncome: calculateChange(metrics.netIncome, previousMetrics.netIncome),
    eps: calculateChange(metrics.earningsPerShare, previousMetrics.earningsPerShare),
  } : undefined;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Machine Learning Analysis</CardTitle>
        <CardDescription>
          {metrics.reportType} for {metrics.fiscalPeriod} {metrics.fiscalYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            {anomalies.length > 0 && (
              <TabsTrigger value="anomalies" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Anomalies
                <Badge variant="destructive" className="ml-1 px-1 h-5 min-w-5">
                  {anomalies.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard 
                label="Revenue" 
                value={metrics.revenue} 
                formatter={formatCurrency}
                change={changes?.revenue}
              />
              <MetricCard 
                label="Net Income" 
                value={metrics.netIncome} 
                formatter={formatCurrency}
                change={changes?.netIncome}
              />
              <MetricCard 
                label="Earnings Per Share" 
                value={metrics.earningsPerShare} 
                formatter={(v) => v !== undefined ? `$${v.toFixed(2)}` : 'N/A'}
                change={changes?.eps}
              />
              <MetricCard 
                label="Gross Margin" 
                value={metrics.grossMargin} 
                formatter={formatPercentage}
                change={changes?.grossMargin}
              />
            </div>
            
            {metrics.keyRisks && metrics.keyRisks.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Key Risk Factors</h4>
                <ul className="space-y-2">
                  {metrics.keyRisks.map((risk, index) => (
                    <li key={index} className="text-sm flex gap-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {metrics.significantEvents && metrics.significantEvents.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Significant Events</h4>
                <ul className="space-y-2">
                  {metrics.significantEvents.map((event, index) => (
                    <li key={index} className="text-sm flex gap-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                      <span>{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="income" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard 
                label="Revenue" 
                value={metrics.revenue} 
                formatter={formatCurrency}
                change={changes?.revenue}
              />
              <MetricCard 
                label="Gross Profit" 
                value={metrics.grossProfit} 
                formatter={formatCurrency}
                change={changes?.grossProfit}
              />
              <MetricCard 
                label="Gross Margin" 
                value={metrics.grossMargin} 
                formatter={formatPercentage}
                change={changes?.grossMargin}
              />
              <MetricCard 
                label="Operating Income" 
                value={metrics.operatingIncome} 
                formatter={formatCurrency}
                change={changes?.operatingIncome}
              />
              <MetricCard 
                label="Net Income" 
                value={metrics.netIncome} 
                formatter={formatCurrency}
                change={changes?.netIncome}
              />
              <MetricCard 
                label="Earnings Per Share" 
                value={metrics.earningsPerShare} 
                formatter={(v) => v !== undefined ? `$${v.toFixed(2)}` : 'N/A'}
                change={changes?.eps}
              />
            </div>
            
            {(metrics.revenueGuidanceLow !== undefined || metrics.epsGuidanceLow !== undefined) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Forward Guidance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.revenueGuidanceLow !== undefined && metrics.revenueGuidanceHigh !== undefined && (
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">Revenue Guidance</div>
                      <div className="font-medium">
                        {formatCurrency(metrics.revenueGuidanceLow)} - {formatCurrency(metrics.revenueGuidanceHigh)}
                      </div>
                    </div>
                  )}
                  
                  {metrics.epsGuidanceLow !== undefined && metrics.epsGuidanceHigh !== undefined && (
                    <div className="p-4 rounded-lg border">
                      <div className="text-sm text-muted-foreground">EPS Guidance</div>
                      <div className="font-medium">
                        ${metrics.epsGuidanceLow.toFixed(2)} - ${metrics.epsGuidanceHigh.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="balance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard 
                label="Total Assets" 
                value={metrics.totalAssets} 
                formatter={formatCurrency}
              />
              <MetricCard 
                label="Total Liabilities" 
                value={metrics.totalLiabilities} 
                formatter={formatCurrency}
              />
              <MetricCard 
                label="Total Equity" 
                value={metrics.totalEquity} 
                formatter={formatCurrency}
              />
              <MetricCard 
                label="Cash & Equivalents" 
                value={metrics.cash} 
                formatter={formatCurrency}
              />
              <MetricCard 
                label="Total Debt" 
                value={metrics.debt} 
                formatter={formatCurrency}
              />
              {metrics.operatingCashFlow !== undefined && (
                <MetricCard 
                  label="Operating Cash Flow" 
                  value={metrics.operatingCashFlow} 
                  formatter={formatCurrency}
                />
              )}
              {metrics.freeCashFlow !== undefined && (
                <MetricCard 
                  label="Free Cash Flow" 
                  value={metrics.freeCashFlow} 
                  formatter={formatCurrency}
                />
              )}
            </div>
          </TabsContent>
          
          {anomalies.length > 0 && (
            <TabsContent value="anomalies" className="space-y-4">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {anomaly.metricName.charAt(0).toUpperCase() + anomaly.metricName.slice(1).replace(/([A-Z])/g, ' $1')}
                    </h4>
                    <SeverityBadge severity={anomaly.severity} />
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{anomaly.explanation}</p>
                  
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-500 mb-1">
                      Current value: <span className="font-medium">{formatMetricValue(anomaly.metricName, anomaly.value)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Expected range: <span className="font-medium">
                        {formatMetricValue(anomaly.metricName, anomaly.expectedRange.min)} - {formatMetricValue(anomaly.metricName, anomaly.expectedRange.max)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Deviation: <span className="font-medium">{anomaly.deviation.toFixed(1)} standard deviations</span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper component for displaying individual metrics
function MetricCard({ 
  label, 
  value, 
  formatter, 
  change 
}: { 
  label: string; 
  value?: number; 
  formatter: (value?: number) => string;
  change?: number;
}) {
  return (
    <div className="p-4 rounded-lg border">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium text-lg">{formatter(value)}</div>
      
      {change !== undefined && (
        <div className="flex items-center mt-1 text-sm">
          <TrendIndicator value={change} />
          <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Format metric value based on its type
function formatMetricValue(metricName: string, value: number): string {
  if (metricName.toLowerCase().includes('margin') || metricName.toLowerCase().includes('percentage')) {
    return `${value.toFixed(2)}%`;
  } else if (metricName.toLowerCase().includes('eps') || metricName.toLowerCase().includes('earningspershare')) {
    return `$${value.toFixed(2)}`;
  } else {
    return formatCurrency(value);
  }
}

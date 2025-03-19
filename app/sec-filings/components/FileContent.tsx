'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';
import { analyzeSECFiling } from '@/app/ml-service/secAnalysisService';
import { FinancialMetrics } from '@/app/ml-service/metricsExtractionService';
import { FinancialAnomaly } from '@/app/ml-service/anomalyDetectionService';
import { FinancialAnalysis } from './FinancialAnalysis';

interface FileContentProps {
  accessKey: string;
  fileName: string;
  fileContent: string;
  filingType: string;
  ticker: string;
  previousFilings?: {
    filingText: string;
    filingType: string;
  }[];
}

export function FileContent({ 
  accessKey, 
  fileName, 
  fileContent, 
  filingType,
  ticker,
  previousFilings = []
}: FileContentProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<FinancialMetrics | undefined>(undefined);
  const [anomalies, setAnomalies] = useState<FinancialAnomaly[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  
  // Check if this is a financial filing that can be analyzed
  const canAnalyze = ['10-K', '10-Q', '8-K'].includes(filingType);
  
  // Handle the analyze button click
  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(undefined);
      
      const analysisResult = await analyzeSECFiling(
        fileContent,
        filingType,
        ticker,
        previousFilings,
        {
          includePreviousPeriod: previousFilings.length > 0,
          detectAnomalies: previousFilings.length >= 3,
          includeRisks: true,
          includeGuidance: true
        }
      );
      
      if (analysisResult.error) {
        setError(analysisResult.error);
      } else {
        setMetrics(analysisResult.metrics);
        setPreviousMetrics(analysisResult.previousMetrics);
        setAnomalies(analysisResult.anomalies || []);
        // Switch to the analysis tab
        setActiveTab('analysis');
      }
    } catch (err) {
      setError('An unexpected error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{fileName}</h3>
        
        {canAnalyze && !analysisComplete && (
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                ML Analysis
              </>
            )}
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Document Content</TabsTrigger>
          {(analysisComplete || metrics) && (
            <TabsTrigger value="analysis" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Financial Analysis
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="content" className="mt-4">
          <Card className="p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs">{fileContent}</pre>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-4">
          {error ? (
            <Card className="p-4">
              <div className="text-red-500 mb-2">Analysis Error:</div>
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAnalyze}
              >
                Try Again
              </Button>
            </Card>
          ) : metrics ? (
            <FinancialAnalysis 
              metrics={metrics}
              previousMetrics={previousMetrics}
              anomalies={anomalies}
            />
          ) : (
            <Card className="p-4">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4">No analysis available yet.</div>
                <Button onClick={handleAnalyze}>Analyze Document</Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

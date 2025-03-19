'use client';

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialMetrics } from '@/app/ml-service/metricsExtractionService'
import { FinancialAnomaly } from '@/app/ml-service/anomalyDetectionService'

interface FinancialAnalysisProps {
  metrics: FinancialMetrics
  previousMetrics?: FinancialMetrics
  anomalies: FinancialAnomaly[]
}

export function FinancialAnalysis({ metrics, previousMetrics, anomalies }: FinancialAnalysisProps) {
  const [activeTab, setActiveTab] = useState('metrics')

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="metrics">Financial Metrics</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies ({anomalies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {/* Render metrics */}
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <div className="font-medium">{key}</div>
                  <div className="text-sm text-muted-foreground">{value}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="anomalies" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {anomalies.length > 0 ? (
                anomalies.map((anomaly, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="font-medium">{anomaly.metric}</div>
                    <div className="text-sm text-muted-foreground">{anomaly.description}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No anomalies detected
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

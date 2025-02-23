'use client';

import { ApiTests } from '@/components/testing/ApiTests';
import { AlphaVantageTest } from '@/components/testing/AlphaVantageTest';
import { SECTest } from '@/components/testing/SECTest';
import { TechTrendAnalyzer } from '@/components/testing/TechTrendAnalyzer';
import { DocFeed } from '@/components/testing/DocFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestPage() {
  return (
    <main className="container mx-auto py-8">
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Tech Trends</TabsTrigger>
          <TabsTrigger value="docfeed">Doc Feed</TabsTrigger>
          <TabsTrigger value="sec">SEC Basic</TabsTrigger>
          <TabsTrigger value="apis">Other APIs</TabsTrigger>
          <TabsTrigger value="alpha">Alpha Vantage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <TechTrendAnalyzer />
        </TabsContent>

        <TabsContent value="docfeed">
          <DocFeed />
        </TabsContent>

        <TabsContent value="sec">
          <SECTest />
        </TabsContent>
        
        <TabsContent value="apis">
          <ApiTests />
        </TabsContent>
        
        <TabsContent value="alpha">
          <AlphaVantageTest />
        </TabsContent>
      </Tabs>
    </main>
  );
} 
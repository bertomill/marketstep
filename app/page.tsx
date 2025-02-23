'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TechTrendAnalyzer } from "@/components/testing/TechTrendAnalyzer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Tech Trend Analyzer
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Analyze technology trends and investments from SEC filings using AI-powered insights
            </p>
            <div className="space-x-4">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-2">SEC Filing Analysis</h3>
              <p className="text-gray-600">Extract key insights from company filings automatically</p>
            </div>
            <div className="p-6 rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Get intelligent analysis of technology trends and investments</p>
            </div>
            <div className="p-6 rounded-lg bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Stay current with the latest technology investments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <TechTrendAnalyzer />
    </ProtectedRoute>
  );
}

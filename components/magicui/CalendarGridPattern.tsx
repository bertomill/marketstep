"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { summarizeFiling } from "@/app/calendar/aiService";

interface FinancialEvent {
  company: string;
  type: 'earnings' | 'filing' | 'announcement';
  date: string;
}

const sampleEvents: FinancialEvent[] = [
  { company: "AAPL", type: "earnings", date: "Q1 2024" },
  { company: "TSLA", type: "filing", date: "10-K" },
  { company: "MSFT", type: "earnings", date: "Q2 2024" },
  { company: "NVDA", type: "announcement", date: "AI Day" },
  { company: "AMZN", type: "filing", date: "8-K" },
  { company: "GOOGL", type: "earnings", date: "Q1 2024" },
  { company: "META", type: "announcement", date: "Connect" },
];

// Mock function to simulate fetching 8-K data
// In a real app, this would come from your SEC filings API
const fetchLatest8K = async (symbol: string) => {
  // Simulated delay and mock data
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data for demonstration
  const mockFilings = {
    AMZN: "Amazon.com, Inc. announces acquisition of healthcare technology startup for $5 billion to expand healthcare services division. The acquisition is expected to close in Q2 2024.",
    MSFT: "Microsoft Corporation reports significant advancement in quantum computing capabilities with new breakthrough in qubit stability, potentially accelerating the development of practical quantum computers.",
    NVDA: "NVIDIA announces new AI chip architecture with 50% improved performance and energy efficiency. The company expects this to drive significant revenue growth in the data center segment."
  };
  
  return mockFilings[symbol as keyof typeof mockFilings] || "No recent 8-K filing found.";
};

interface CalendarGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number];
  className?: string;
  squaresClassName?: string;
}

export function CalendarGridPattern({
  width = 60,
  height = 60,
  squares = [16, 16],
  className,
  squaresClassName,
  ...props
}: CalendarGridPatternProps) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [summaryData, setSummaryData] = useState<{ [key: string]: string }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Helper function to wrap text
  const wrapText = (text: string, maxCharsPerLine: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + words[i].length + 1 <= maxCharsPerLine) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Helper function to measure text width
  const getTextWidth = (text: string): number => {
    // Approximate width: 4.5 pixels per character for 8px font
    return text.length * 4.5;
  };

  // Randomly assign events to grid positions
  const eventPositions = React.useMemo(() => {
    const positions = new Map<number, FinancialEvent>();
    const totalSquares = horizontal * vertical;
    const usedPositions = new Set<number>();

    sampleEvents.forEach(event => {
      let position;
      do {
        position = Math.floor(Math.random() * totalSquares);
      } while (usedPositions.has(position));
      
      usedPositions.add(position);
      positions.set(position, event);
    });

    return positions;
  }, [horizontal, vertical]);

  // Handle click on company event
  const handleEventClick = async (event: FinancialEvent) => {
    // Only handle clicks for specific companies
    if (!['AMZN', 'MSFT', 'NVDA'].includes(event.company)) return;
    
    // If we already have the summary, just toggle its visibility
    if (summaryData[event.company]) {
      const newSummaryData = { ...summaryData };
      delete newSummaryData[event.company];
      setSummaryData(newSummaryData);
      return;
    }

    // Show loading state
    setLoadingStates(prev => ({ ...prev, [event.company]: true }));

    try {
      // Fetch the latest 8-K
      const filingText = await fetchLatest8K(event.company);
      
      // Generate summary using AI
      const { summary } = await summarizeFiling(filingText);
      
      // Update summary data
      setSummaryData(prev => ({
        ...prev,
        [event.company]: summary
      }));
    } catch (error) {
      console.error('Error fetching 8-K summary:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [event.company]: false }));
    }
  };

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full",
        className,
      )}
      {...props}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        const event = eventPositions.get(index);
        const showSummary = event && summaryData[event.company];
        const isLoading = event && loadingStates[event.company];

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              className={cn(
                "stroke-gray-400/30 transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
                hoveredSquare === index ? "fill-gray-300/30" : "fill-transparent",
                event ? "stroke-primary/40" : "stroke-gray-400/30",
                squaresClassName,
              )}
              onMouseEnter={() => setHoveredSquare(index)}
              onMouseLeave={() => setHoveredSquare(null)}
            />
            {event && (
              <g
                className={cn(
                  "text-primary transition-opacity cursor-pointer",
                  hoveredSquare === index ? "opacity-100" : "opacity-70"
                )}
                style={{ filter: "url(#glow)" }}
                onClick={() => handleEventClick(event)}
              >
                <text
                  x={x + width/2}
                  y={y + height/2 - 8}
                  textAnchor="middle"
                  className="fill-current text-[10px] font-bold"
                >
                  {event.company}
                </text>
                <text
                  x={x + width/2}
                  y={y + height/2 + 8}
                  textAnchor="middle"
                  className="fill-current text-[8px]"
                >
                  {event.date}
                </text>
                
                {/* Loading indicator */}
                {isLoading && (
                  <g transform={`translate(${x + width/2}, ${y + height/2 + 20})`}>
                    <circle
                      r="4"
                      className="fill-primary animate-ping opacity-75"
                    />
                  </g>
                )}
                
                {/* Summary popup */}
                {showSummary && (
                  <g>
                    {(() => {
                      const lines = wrapText(summaryData[event.company], 30);
                      const lineHeight = 12; // Height per line (includes spacing)
                      const padding = 10; // Padding top and bottom
                      const sidePadding = 8; // Padding left and right
                      const boxHeight = lines.length * lineHeight + padding * 2;
                      
                      // Calculate maximum line width
                      const maxLineWidth = Math.max(...lines.map(getTextWidth));
                      const boxWidth = Math.max(maxLineWidth + sidePadding * 2, width * 0.8); // At least 80% of cell width
                      
                      // Center the box
                      const xOffset = (width - boxWidth) / 2;
                      
                      return (
                        <>
                          <rect
                            x={x + xOffset}
                            y={y + height/2 + 15}
                            width={boxWidth}
                            height={boxHeight}
                            rx="4"
                            className="fill-white stroke-primary/20"
                          />
                          <text
                            x={x + xOffset + sidePadding}
                            y={y + height/2 + 25}
                            className="fill-gray-700 text-[8px]"
                          >
                            {lines.map((line, i) => (
                              <tspan
                                key={i}
                                x={x + xOffset + sidePadding}
                                dy={i === 0 ? 0 : "1.2em"}
                              >
                                {line}
                              </tspan>
                            ))}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
} 
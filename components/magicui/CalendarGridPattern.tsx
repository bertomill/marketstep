"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

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
                  "text-primary transition-opacity",
                  hoveredSquare === index ? "opacity-100" : "opacity-70"
                )}
                style={{ filter: "url(#glow)" }}
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
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
} 
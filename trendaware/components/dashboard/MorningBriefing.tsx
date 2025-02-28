'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MorningBriefing() {
  const [expanded, setExpanded] = useState(false);
  
  // Mock data - would come from API in real implementation
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const insights = [
    "AI adoption in financial services increased by 37% in the last quarter",
    "New regulations on cryptocurrency expected to impact blockchain applications",
    "Major tech companies investing heavily in quantum computing research"
  ];
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Morning Briefing
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here are your key insights for today:
          </p>
          
          <ul className="mt-3 space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
} 
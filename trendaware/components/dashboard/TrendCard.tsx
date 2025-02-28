'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

interface TrendCardProps {
  title: string;
  description: string;
  category: string;
  relevanceScore: number;
}

export default function TrendCard({ title, description, category, relevanceScore }: TrendCardProps) {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            {category}
          </span>
          <div className="ml-auto flex items-center">
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
            <span className="ml-1 text-sm font-medium text-green-500">{relevanceScore}%</span>
          </div>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Explore trend
          </button>
        </div>
      </div>
    </motion.div>
  );
} 
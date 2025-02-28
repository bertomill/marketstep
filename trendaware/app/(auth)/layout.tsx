'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!loading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        {/* Left side - Brand/Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex-col justify-center items-center p-12 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Animated gradient orb */}
          {mounted && (
            <motion.div 
              className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          )}
          
          <div className="relative z-10 max-w-md">
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl font-bold mb-6 text-white">
                  <span className="inline-block">
                    Trend<span className="text-indigo-300">Aware</span>
                  </span>
                </h1>
                <p className="text-xl mb-10 text-white/90 leading-relaxed">
                  Stay ahead of technology trends with AI-powered insights tailored for finance professionals.
                </p>
                
                <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm border border-white/10 shadow-xl">
                  <svg className="w-10 h-10 text-indigo-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                  </svg>
                  <p className="italic text-white/90 text-lg leading-relaxed">
                    &ldquo;TrendAware has transformed how I monitor technology developments in the banking sector. 
                    It saves me hours each day and ensures I never miss critical insights.&rdquo;
                  </p>
                  <div className="mt-6 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold">SJ</div>
                    <div className="ml-3">
                      <p className="font-semibold text-white">Sarah Johnson</p>
                      <p className="text-indigo-200 text-sm">Technology Consultant, FinBank</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-10 lg:hidden">
              <Image
                src="/logo.svg"
                alt="TrendAware"
                width={180}
                height={45}
                priority
                className="drop-shadow-md"
              />
            </div>
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {children}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
} 
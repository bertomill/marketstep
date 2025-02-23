'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Product Info - Mobile Header */}
      <div className="lg:hidden bg-black text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">MarketStep</h1>
          <span className="text-xs text-gray-400">AI-Powered Analysis</span>
        </div>
        
        {/* Horizontal scrolling features - more compact */}
        <div className="flex space-x-2 overflow-x-auto py-2 -mx-4 px-4">
          <div className="flex-shrink-0 bg-gray-800 rounded-lg p-2 w-32">
            <h4 className="font-medium text-xs">Tech Analysis</h4>
            <p className="text-xs text-gray-400">AI insights</p>
          </div>
          <div className="flex-shrink-0 bg-gray-800 rounded-lg p-2 w-32">
            <h4 className="font-medium text-xs">SEC Filings</h4>
            <p className="text-xs text-gray-400">Real-time data</p>
          </div>
          <div className="flex-shrink-0 bg-gray-800 rounded-lg p-2 w-32">
            <h4 className="font-medium text-xs">Personalized</h4>
            <p className="text-xs text-gray-400">Custom views</p>
          </div>
        </div>
      </div>

      {/* Desktop Product Info - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-6">MarketStep</h1>
          <p className="text-gray-400 text-lg mb-8">
            AI-Powered Financial Document Analysis
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Analyze SEC Filings with AI</h2>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Instant analysis of financial documents</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Track technology trends across companies</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Personalized insights based on your interests</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Latest Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tech Trend Analysis</h4>
                <p className="text-sm text-gray-400">Track emerging technologies across multiple companies</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Document Feed</h4>
                <p className="text-sm text-gray-400">Real-time analysis of SEC filings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          © 2024 MarketStep. All rights reserved.
        </div>
      </div>

      {/* Login Form - Updated for better mobile fit */}
      <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-4 lg:space-y-8">
          <div className="text-center">
            <h2 className="text-xl lg:text-3xl font-bold">Welcome Back</h2>
            <p className="mt-1 text-sm lg:text-base text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-3 lg:space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 lg:h-11"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 lg:h-11"
              />
            </div>

            <Button type="submit" className="w-full h-10 lg:h-11">
              Sign In with Email
            </Button>

            <div className="relative my-3 lg:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 lg:h-11 text-sm"
              onClick={handleGoogleSignIn}
            >
              <Image
                src="/google.svg"
                alt="Google"
                width={18}
                height={18}
                className="mr-2"
              />
              Sign in with Google
            </Button>
          </form>

          <div className="space-y-4">
            <p className="text-center text-xs lg:text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </p>

            {/* Mobile footer - more compact */}
            <div className="lg:hidden text-center text-xs text-gray-400">
              © 2024 MarketStep
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
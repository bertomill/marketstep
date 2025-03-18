'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Landing from './Landing'
import { Sidebar } from './components/Sidebar'
import CompanySelection from './components/CompanySelection'
import { Loader2, Calendar, FileText, Star } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MagicCard } from '@/components/magicui/magic-card'
import { useTheme } from 'next-themes'

// This is the main page of the app
// It shows the landing page for unauthenticated users
// It shows the company selection screen for first-time users
// And shows the actual app content for authenticated users who have completed onboarding
export default function Home() {
  const { user, loading } = useAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Mount effect to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determine the current theme safely
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const gradientColor = currentTheme === 'dark' ? "#262626" : "#D9D9D955"

  // Check if the user has completed the onboarding process
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) return

      setCheckingOnboarding(true)
      try {
        // Check if the user document exists and has completed onboarding
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists() && userDoc.data().hasCompletedOnboarding) {
          setHasCompletedOnboarding(true)
        } else {
          setHasCompletedOnboarding(false)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        // If there's an error, assume they haven't completed onboarding
        setHasCompletedOnboarding(false)
      } finally {
        setCheckingOnboarding(false)
      }
    }

    if (user) {
      checkOnboardingStatus()
    }
  }, [user])

  // Function to handle completion of the onboarding process
  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true)
  }

  // Show a loading spinner while checking authentication or onboarding status
  if (loading || (user && checkingOnboarding)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not logged in, show the landing page
  if (!user) {
    return <Landing />;
  }

  // If the user is logged in but hasn't completed onboarding, show the company selection screen
  if (hasCompletedOnboarding === false) {
    return <CompanySelection user={user} onComplete={handleOnboardingComplete} />;
  }

  // If the user is logged in and has completed onboarding, show the app with the sidebar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="flex-1 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">MarketStep Dashboard</h1>
            <p className="text-lg text-gray-600">Your financial market companion</p>
          </div>
          
          {mounted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Calendar Card */}
              <Card>
                <MagicCard gradientColor={gradientColor} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-primary" />
                      Calendar
                    </CardTitle>
                    <CardDescription>
                      Track earnings calls and important market events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Stay organized with upcoming financial events and create your own custom reminders.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/calendar">
                        View Calendar
                      </Link>
                    </Button>
                  </CardFooter>
                </MagicCard>
              </Card>

              {/* SEC Filings Card */}
              <Card>
                <MagicCard gradientColor={gradientColor} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      SEC Filings
                    </CardTitle>
                    <CardDescription>
                      Access and analyze SEC documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Search through recent filings and stay updated on company disclosures and financial reports.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/sec-filings">
                        Browse Filings
                      </Link>
                    </Button>
                  </CardFooter>
                </MagicCard>
              </Card>

              {/* My Companies Card */}
              <Card>
                <MagicCard gradientColor={gradientColor} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5 text-primary" />
                      My Companies
                    </CardTitle>
                    <CardDescription>
                      Manage your watchlist
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Follow companies you&apos;re interested in to receive updates and track their performance.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/my-companies">
                        View Companies
                      </Link>
                    </Button>
                  </CardFooter>
                </MagicCard>
              </Card>
              
              {/* Studio Card */}
              <Card>
                <MagicCard gradientColor={gradientColor} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m12 19 7-7 3 3-7 7-3-3z" />
                        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        <path d="m2 2 7.586 7.586" />
                        <circle cx="11" cy="11" r="2" />
                      </svg>
                      Content Studio
                    </CardTitle>
                    <CardDescription>
                      Create AI-powered content from your events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Use Gemini AI to transform your calendar events into polished documents and reports.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href="/studio">
                        Open Studio
                      </Link>
                    </Button>
                  </CardFooter>
                </MagicCard>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

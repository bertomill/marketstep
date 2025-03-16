'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Landing from './Landing'
import { Sidebar } from './components/Sidebar'
import CompanySelection from './components/CompanySelection'
import { Loader2 } from 'lucide-react'

// This is the main page of the app
// It shows the landing page for unauthenticated users
// It shows the company selection screen for first-time users
// And shows the actual app content for authenticated users who have completed onboarding
export default function Home() {
  const { user, loading } = useAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)

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
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to MarketStep</h1>
            <p className="text-lg text-gray-600">Your financial market companion</p>
          </div>
        </div>
      </main>
    </div>
  );
}

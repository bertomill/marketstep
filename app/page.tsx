'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Landing from './Landing'
import CompanySelection from './components/CompanySelection'
import { Loader2 } from 'lucide-react'

// This is the main page of the app
// It shows the landing page for unauthenticated users
// It shows the company selection screen for first-time users
// And redirects authenticated users who have completed onboarding to the my-companies page
export default function Home() {
  const { user, loading } = useAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const router = useRouter()

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
          // Redirect to my-companies page
          router.push('/my-companies')
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
  }, [user, router])

  // Function to handle completion of the onboarding process
  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true)
    // After completing onboarding, redirect to my-companies page
    router.push('/my-companies')
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

  // This is just a fallback in case the redirect doesn't happen immediately
  // It will show a loading spinner while the redirect is happening
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

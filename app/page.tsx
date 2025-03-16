'use client'

import { useAuth } from '@/lib/auth'
import Landing from './Landing'
import { Sidebar } from './components/Sidebar'
import { Loader2 } from 'lucide-react'

// This is the main page of the app
// It shows the landing page for unauthenticated users
// And shows the actual app content for authenticated users
export default function Home() {
  const { user, loading } = useAuth()

  // Show a loading spinner while checking authentication
  if (loading) {
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

  // If the user is logged in, show the app with the sidebar
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

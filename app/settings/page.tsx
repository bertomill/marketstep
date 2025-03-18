'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { Sidebar } from '../components/Sidebar'
import { Loader2, Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// List of occupation options
const occupationOptions = [
  "Investor Relations",
  "Strategy/M&A",
  "Investment Banking",
  "Consultancy",
  "Private Investor",
  "Student",
  "Media",
  "Buy Side",
  "Sell Side",
  "Researcher",
  "Other"
] as const

interface UserPreferences {
  occupation: string;
  displayName: string;
  email: string;
  bio: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences>({
    occupation: '',
    displayName: '',
    email: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Load user preferences
  useEffect(() => {
    async function loadPreferences() {
      if (!user) return

      try {
        setLoading(true)
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        
        setPreferences({
          occupation: userData?.occupation || '',
          displayName: user.displayName || '',
          email: user.email || '',
          bio: userData?.bio || ''
        })
      } catch (error) {
        console.error('Error loading preferences:', error)
        toast.error('Failed to load preferences')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadPreferences()
    }
  }, [user])

  // Save preferences
  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        occupation: preferences.occupation,
        bio: preferences.bio,
        updatedAt: new Date()
      })

      // Update display name if changed
      if (preferences.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: preferences.displayName
        })
      }

      toast.success('Preferences saved successfully')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated, don't render the page content
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={preferences.displayName}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    displayName: e.target.value
                  }))}
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={preferences.email}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={preferences.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPreferences(prev => ({
                    ...prev,
                    bio: e.target.value
                  }))}
                  className="h-32 resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Write a short bio to introduce yourself to other users and the purpose for tracking the market
                </p>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Select
                  value={preferences.occupation}
                  onValueChange={(value: string) => setPreferences(prev => ({
                    ...prev,
                    occupation: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <Button 
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 
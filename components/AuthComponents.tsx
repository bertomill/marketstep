'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import { X } from 'lucide-react'

// This is the login/signup dialog component
// It shows a popup with tabs for login and signup
export function LoginSignupDialog({ buttonText = "Login / Sign Up" }: { buttonText?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()

  // Form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await signInWithEmail(loginEmail, loginPassword)
      setIsOpen(false) // Close dialog on success
    } catch (err: Error | unknown) {
      const error = err as Error
      setError(error.message || 'Failed to login')
    }
  }

  // Handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await signUpWithEmail(signupEmail, signupPassword)
      setIsOpen(false) // Close dialog on success
    } catch (err: Error | unknown) {
      const error = err as Error
      setError(error.message || 'Failed to sign up')
    }
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setError(null)
    
    try {
      await signInWithGoogle()
      setIsOpen(false) // Close dialog on success
    } catch (err: Error | unknown) {
      const error = err as Error
      setError(error.message || 'Failed to sign in with Google')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="absolute right-4 top-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {error && (
          <div className="mb-4 p-2 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="login-password">Password</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleGoogleSignIn}
                  >
                    Continue with Google
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Login</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create a new account to get started.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input 
                      id="signup-name" 
                      placeholder="John Doe" 
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleGoogleSignIn}
                  >
                    Continue with Google
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Sign Up</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
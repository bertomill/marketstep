'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import { X } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { 
  fetchSignInMethodsForEmail, 
  GithubAuthProvider, 
  GoogleAuthProvider, 
  linkWithCredential, 
  signInWithPopup,
  AuthCredential
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

// This is the login/signup dialog component
// It shows a popup with tabs for login and signup
export function LoginSignupDialog({ buttonText = "Login / Sign Up" }: { buttonText?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingCred, setPendingCred] = useState<AuthCredential | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth()

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Clear error and pending state when dialog closes
      setError(null)
      setPendingCred(null)
      setPendingEmail(null)
      setLoginEmail('')
      setLoginPassword('')
      setSignupEmail('')
      setSignupPassword('')
      setSignupName('')
    }
  }

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
      
      // If there's a pending credential, link accounts after login
      if (pendingCred) {
        try {
          const currentUser = auth.currentUser
          if (currentUser) {
            await linkWithCredential(currentUser, pendingCred)
            setPendingCred(null)
            setPendingEmail(null)
          }
        } catch (linkError) {
          console.error("Error linking accounts:", linkError)
        }
      }
      
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
      // If there's a pending GitHub credential, try to link with Google
      if (pendingCred && pendingEmail) {
        const googleProvider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, googleProvider)
        await linkWithCredential(result.user, pendingCred)
        setPendingCred(null)
        setPendingEmail(null)
        setIsOpen(false)
        return
      }
      
      await signInWithGoogle()
      setIsOpen(false) // Close dialog on success
    } catch (err: Error | unknown) {
      const error = err as Error
      setError(error.message || 'Failed to sign in with Google')
    }
  }

  // Handle GitHub sign in
  const handleGithubSignIn = async () => {
    setError(null)
    
    try {
      await signInWithGithub()
      setIsOpen(false) // Close dialog on success
    } catch (err: unknown) {
      console.log("GitHub auth error:", err); // Log the full error for debugging
      
      // Special handling for account-exists-with-different-credential error
      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = err.code as string;
        
        if (errorCode === 'auth/account-exists-with-different-credential') {
          // Get the email from the error
          if ('customData' in err && err.customData && typeof err.customData === 'object' && 'email' in err.customData) {
            const email = err.customData.email as string
            
            if (email) {
              try {
                // Save the pending credential - use the Firebase method to extract credential safely
                const firebaseErr = err as FirebaseError
                const credential = GithubAuthProvider.credentialFromError(firebaseErr)
                
                if (credential) {
                  setPendingCred(credential)
                  setPendingEmail(email)
                  
                  // Find providers for this email
                  const providers = await fetchSignInMethodsForEmail(auth, email)
                  
                  if (providers.includes('google.com')) {
                    setError(`An account already exists with the same email address using Google Sign-in. Please sign in with Google to link your accounts.`)
                  } else if (providers.includes('password')) {
                    setLoginEmail(email)
                    setError(`An account already exists with the same email address using email/password. Please sign in with your password to link your accounts.`)
                  } else if (providers.length > 0) {
                    setError(`An account already exists with the same email address using ${providers.join(', ')}. Please sign in with that method to link your accounts.`)
                  } else {
                    setError(`An account already exists with the same email address. Please sign in with your existing account to link with GitHub.`)
                  }
                } else {
                  setError('Could not authenticate with GitHub. Please try another sign-in method.')
                }
              } catch (providerError) {
                console.error("Error getting auth providers:", providerError);
                setError('An error occurred while trying to resolve the sign-in method. Please try again later.')
              }
            } else {
              setError('An account already exists with the same email address but we could not determine the provider. Please try another sign-in method.')
            }
          } else {
            setError('An account already exists with the same email address but we could not determine the email. Please try another sign-in method.')
          }
        } else {
          // Handle other Firebase auth errors with specific messages
          setError(`GitHub authentication error: ${errorCode}. Please try again.`)
        }
      } else {
        // Handle other errors
        const error = err as Error
        setError(error.message || 'Failed to sign in with GitHub')
      }
    }
  }

  // Social login button components with logos
  const GoogleButton = ({ onClick }: { onClick: () => void }) => (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full mt-2 flex items-center gap-2"
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
      Continue with Google
    </Button>
  )

  const GitHubButton = ({ onClick }: { onClick: () => void }) => (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full mt-2 flex items-center gap-2"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
      Continue with GitHub
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <div className="absolute right-4 top-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleOpenChange(false)}
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
        
        {pendingCred && pendingEmail && (
          <div className="mb-4 p-2 text-sm bg-blue-50 text-blue-700 rounded-md">
            Please sign in with your existing account to link with GitHub
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
                  <GoogleButton onClick={handleGoogleSignIn} />
                  <GitHubButton onClick={handleGithubSignIn} />
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
                  <GoogleButton onClick={handleGoogleSignIn} />
                  <GitHubButton onClick={handleGithubSignIn} />
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
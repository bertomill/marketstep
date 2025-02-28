# TrendAware: Project Setup

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Authentication**: Firebase Auth (Email/Password and Google)
- **Database**: Firestore
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Theme Switching**: next-themes

## Project Structure

## 1. Project Initialization (Completed) ✅

trendaware/
├── app/ # Next.js app router
│ ├── (auth)/ # Authentication routes
│ │ ├── login/ # Login page
│ │ ├── register/ # Registration page
│ │ └── layout.tsx # Auth layout with split screen design
│ ├── (dashboard)/ # Dashboard routes
│ │ ├── dashboard/ # Main dashboard page
│ │ ├── themes/ # Themes page (pending)
│ │ ├── library/ # Content library (pending)
│ │ ├── calendar/ # Earnings calendar (pending)
│ │ ├── analytics/ # Analytics dashboard (pending)
│ │ ├── settings/ # User settings (pending)
│ │ └── layout.tsx # Dashboard layout with sidebar and header
│ ├── api/ # API routes (pending)
│ ├── globals.css # Global styles
│ └── layout.tsx # Root layout with theme provider
├── components/ # React components
│ ├── auth/ # Authentication components
│ │ ├── LoginForm.tsx # Login form with email and Google auth
│ │ ├── RegistrationForm.tsx # Registration form
│ │ └── ProtectedRoute.tsx # Route protection for authenticated users
│ ├── dashboard/ # Dashboard components
│ │ ├── Header.tsx # Dashboard header with search and user menu
│ │ ├── Sidebar.tsx # Navigation sidebar
│ │ ├── MorningBriefing.tsx # Daily digest component
│ │ └── TrendCard.tsx # Individual trend item
│ ├── ui/ # Shadcn UI components
│ └── ThemeProvider.tsx # Dark/light mode provider
├── context/ # React context
│ └── AuthContext.tsx # Authentication context with Firebase
├── lib/ # Utility functions
│ └── firebase.ts # Firebase configuration
├── public/ # Static assets
│ └── logo.svg # TrendAware logo
└── docs/ # Project documentation


## Environment Variables

Create a `.env.local` file with the following variables:

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

## 2. Project Structure (Next.js App Router) ✅

trendaware/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ ├── register/
│ │ │ └── page.tsx
│ │ └── onboarding/
│ │ └── page.tsx
│ ├── dashboard/
│ │ └── page.tsx
│ ├── themes/
│ │ └── page.tsx
│ ├── library/
│ │ └── page.tsx
│ ├── calendar/
│ │ └── page.tsx
│ ├── api/
│ │ └── [...routes]
│ ├── layout.tsx  ✅
│ ├── page.tsx
│ └── globals.css  ✅
├── components/
│ ├── auth/
│ │ ├── LoginForm.tsx
│ │ ├── RegistrationForm.tsx
│ │ └── OnboardingWizard.tsx
│ ├── dashboard/
│ │ ├── MorningBriefing.tsx
│ │ ├── TrendCard.tsx
│ │ └── ThemeHighlights.tsx
│ ├── shared/
│ │ ├── Navbar.tsx
│ │ ├── Sidebar.tsx
│ │ └── SearchBar.tsx
│ └── index.ts
├── lib/
│ ├── firebase.ts ✅
│ ├── auth.ts
│ └── themes.ts
├── hooks/
│ ├── useAuth.ts
│ └── useThemes.ts
├── context/
│ ├── AuthContext.tsx ✅
│ └── ThemeContext.tsx
├── types/
│ ├── user.ts
│ └── theme.ts
├── utils/
│ └── helpers.ts
└── public/
└── assets/
└── images/


## 3. Core Configuration Files

### Firebase Configuration ✅

typescript:lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };


### Authentication Context 

typescript:context/AuthContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
User,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
interface AuthContextType {
currentUser: User | null;
loading: boolean;
login: (email: string, password: string) => Promise<void>;
register: (email: string, password: string) => Promise<void>;
logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (user) => {
setCurrentUser(user);
setLoading(false);
});
return unsubscribe;
}, []);
const login = async (email: string, password: string) => {
return signInWithEmailAndPassword(auth, email, password);
};
const register = async (email: string, password: string) => {
return createUserWithEmailAndPassword(auth, email, password);
};
const logout = async () => {
return signOut(auth);
};
const value = {
currentUser,
loading,
login,
register,
logout
};
return (
<AuthContext.Provider value={value}>
{!loading && children}
</AuthContext.Provider>
);
};

## Next Steps

1. **Complete the Dashboard Pages**:
   - Implement the remaining dashboard pages (Themes, Library, Calendar, Analytics, Settings)
   - Create placeholder content for each section

2. **User Profile Management**:
   - Create a user profile page
   - Allow users to update their profile information
   - Implement profile picture upload

3. **Theme Management**:
   - Develop the theme creation interface
   - Implement theme storage in Firestore
   - Create the theme listing and editing components

4. **Content Library**:
   - Build the content saving mechanism
   - Develop the library view with filtering options
   - Implement content organization features

5. **Data Integration**:
   - Connect to real data sources for financial news and trends
   - Implement data fetching and caching strategies
   - Create data transformation utilities




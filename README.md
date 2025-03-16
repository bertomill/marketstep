# MarketStep

MarketStep is a financial market companion app that helps users track market movements, analyze SEC filings, and plan investments.

## Authentication with Firebase

MarketStep uses Firebase Authentication for user management. Here's how it works:

### Features

- Email/password authentication
- Google sign-in
- Protected routes (only accessible to authenticated users)
- Landing page for non-authenticated users

### Setup Instructions

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)

2. Enable Authentication in your Firebase project:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google sign-in

3. Create a `.env.local` file in the root of your project based on the `.env.local.example` file:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `lib/auth.tsx` - Authentication context provider
- `lib/firebase.ts` - Firebase configuration
- `components/AuthComponents.tsx` - Login/signup components
- `app/Landing.tsx` - Landing page for non-authenticated users
- `app/page.tsx` - Main application page that conditionally renders based on auth state
- `app/components/Sidebar.tsx` - Navigation sidebar with logout button

## How It Works

1. The application is wrapped with `AuthProvider` in `app/layout.tsx`
2. `useAuth` hook provides authentication state and methods throughout the app
3. The main page checks auth state and shows either the landing page or the app
4. Protected routes check for authentication and redirect to home if not authenticated

## Development

To add a new protected page:

1. Use the `useAuth` hook to get the current user
2. Check if the user is authenticated
3. Redirect to the home page if not authenticated

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

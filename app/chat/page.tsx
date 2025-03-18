'use client';

import { Thread } from "@/components/assistant-ui/thread";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserPreferences {
  occupation: string;
  bio: string;
}

// This is the main chat page component that uses assistant-ui
// It provides a ChatGPT-like interface with thread support
export default function ChatPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user preferences from Firestore
  useEffect(() => {
    async function loadUserPreferences() {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData) {
          setUserPreferences({
            occupation: userData.occupation || '',
            bio: userData.bio || ''
          });
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }

    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const runtime = useChatRuntime({
    api: "/api/chat",
    body: {
      userContext: mounted && user && userPreferences ? {
        displayName: user.displayName,
        email: user.email,
        occupation: userPreferences.occupation,
        bio: userPreferences.bio
      } : undefined
    }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="h-[calc(100vh-3.5rem)]">
          <AssistantRuntimeProvider runtime={runtime}>
            <Thread />
          </AssistantRuntimeProvider>
        </div>
      </main>
    </div>
  );
} 
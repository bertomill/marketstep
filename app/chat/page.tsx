'use client';

import { Sidebar } from "../components/Sidebar";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ChatThread } from "@/components/chat/ChatThread";
import { Note } from "@/types/note";

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
  const [notes, setNotes] = useState<Note[]>([]);

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

  // Load notes when component mounts
  useEffect(() => {
    async function loadNotes() {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'notes'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedNotes: Note[] = [];
        
        querySnapshot.forEach((doc) => {
          loadedNotes.push({ id: doc.id, ...doc.data() } as Note);
        });
        
        setNotes(loadedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }

    loadNotes();
  }, [user]);

  const runtime = useChatRuntime({
    api: "/api/chat",
    body: {
      userContext: mounted && user && userPreferences ? {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        occupation: userPreferences.occupation,
        bio: userPreferences.bio,
        notes: notes
      } : undefined
    }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="h-[calc(100vh-3.5rem)]">
          <AssistantRuntimeProvider runtime={runtime}>
            <ChatThread notes={notes} />
          </AssistantRuntimeProvider>
        </div>
      </main>
    </div>
  );
} 
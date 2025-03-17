'use client';

import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  QueryDocumentSnapshot,
  orderBy
} from 'firebase/firestore';

// Define the Event type
export interface Event {
  id: string;
  title: string;
  start: Date | string; // Allow Date object or ISO string
  end: Date | string;
  color: string;
  userId: string;
  eventUrl?: string; // URL to external resource like YouTube video or website
  createdAt?: Date | string; // Timestamp when the event was created
  metadata?: {
    notes?: string;
    [key: string]: string | number | boolean | null | undefined; // Include undefined for optional properties
  };
}

// Convert a Firestore document to an Event object
export const convertToEvent = (doc: QueryDocumentSnapshot): Event => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    start: new Date(data.start.toDate()),
    end: new Date(data.end.toDate()),
    color: data.color || '#3b82f6',
    userId: data.userId || 'anonymous',
    eventUrl: data.eventUrl || '',
    metadata: data.metadata || {},
    createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined
  };
};

// Convert an Event object to a Firestore document
export const convertToFirestore = (event: Omit<Event, 'id'>) => {
  return {
    title: event.title,
    start: Timestamp.fromDate(new Date(event.start)),
    end: Timestamp.fromDate(new Date(event.end)),
    color: event.color,
    userId: event.userId || 'anonymous', // Default to anonymous if no user ID
    eventUrl: event.eventUrl || '', // Include the event URL
    metadata: event.metadata || {},
    createdAt: event.createdAt ? Timestamp.fromDate(new Date(event.createdAt)) : Timestamp.now() // Use provided timestamp or create new one
  };
};

// Get all events for a user
export const getEvents = async (userId: string): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('userId', '==', userId),
      // Add ordering by createdAt timestamp to get newest events first
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertToEvent);
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

// Add a new event
export const addEvent = async (event: Omit<Event, 'id'>, userId: string): Promise<Event | null> => {
  try {
    const eventsRef = collection(db, 'events');
    const eventWithUser = { 
      ...event, 
      userId,
      createdAt: new Date() // Add creation timestamp
    };
    const docRef = await addDoc(eventsRef, convertToFirestore(eventWithUser as Event));
    
    return {
      id: docRef.id,
      ...eventWithUser
    } as Event;
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', event.id);
    await updateDoc(eventRef, convertToFirestore(event));
    return true;
  } catch (error) {
    console.error('Error updating event:', error);
    return false;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}; 
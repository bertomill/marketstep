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
  DocumentData
} from 'firebase/firestore';

// Define the Event type
export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  userId?: string;
}

// Convert Firestore data to Event
export const convertFirestoreEvent = (doc: DocumentData): Event => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    start: data.start.toDate(),
    end: data.end.toDate(),
    color: data.color,
    userId: data.userId
  };
};

// Convert Event to Firestore data
export const convertToFirestoreEvent = (event: Event) => {
  return {
    title: event.title,
    start: Timestamp.fromDate(new Date(event.start)),
    end: Timestamp.fromDate(new Date(event.end)),
    color: event.color,
    userId: event.userId || 'anonymous' // Default to anonymous if no user ID
  };
};

// Get all events for a user
export const getEvents = async (userId: string = 'anonymous'): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertFirestoreEvent);
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

// Add a new event
export const addEvent = async (event: Omit<Event, 'id'>, userId: string = 'anonymous'): Promise<Event | null> => {
  try {
    const eventsRef = collection(db, 'events');
    const eventWithUser = { ...event, userId };
    const docRef = await addDoc(eventsRef, convertToFirestoreEvent(eventWithUser as Event));
    
    return {
      ...event,
      id: docRef.id,
      userId
    };
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', event.id);
    await updateDoc(eventRef, convertToFirestoreEvent(event));
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
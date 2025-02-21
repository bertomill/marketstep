import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

interface UserPreferences {
  industries: string[];
  technologies: string[];
  companies?: string[];
}

interface UserData {
  email: string;
  displayName?: string;
  jobTitle?: string;
  company?: string;
  createdAt: Date;
  lastUpdated: Date;
}

// User related functions
export const createUserProfile = async (uid: string, userData: UserData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: new Date(),
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserPreferences = async (uid: string, preferences: UserPreferences) => {
  try {
    await setDoc(doc(db, 'userPreferences', uid), {
      ...preferences,
      lastUpdated: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getUserPreferences = async (uid: string) => {
  try {
    const prefsDoc = await getDoc(doc(db, 'userPreferences', uid));
    return prefsDoc.exists() ? prefsDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

// Feed related functions
export const getFeedItems = async (
  industries: string[]
) => {
  try {
    const feedRef = collection(db, 'feed');
    // Create a query that matches any of the user's interests
    const q = query(
      feedRef,
      where('relatedIndustries', 'array-contains-any', industries)
      // Add more complex queries as needed
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }
}; 
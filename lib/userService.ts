'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

// Define the company type
export type FollowedCompany = {
  ticker: string;
  name: string;
  cik: string;
};

// Get a user's followed companies
export const getUserFollowedCompanies = async (userId: string): Promise<FollowedCompany[]> => {
  try {
    // Get the user profile document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    // If user profile exists and has followed companies, return them
    if (userDoc.exists() && userDoc.data().followedCompanies) {
      return userDoc.data().followedCompanies;
    }
    
    // If no followed companies, return empty array
    return [];
  } catch (error) {
    console.error('Error getting followed companies:', error);
    throw error;
  }
};

// Add a company to user's followed companies
export const followCompany = async (userId: string, company: FollowedCompany): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User exists, update their followed companies
      await updateDoc(userRef, {
        followedCompanies: arrayUnion(company)
      });
    } else {
      // User doesn't exist, create profile with followed companies
      await setDoc(userRef, {
        followedCompanies: [company]
      });
    }
  } catch (error) {
    console.error('Error following company:', error);
    throw error;
  }
};

// Remove a company from user's followed companies
export const unfollowCompany = async (userId: string, company: FollowedCompany): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      followedCompanies: arrayRemove(company)
    });
  } catch (error) {
    console.error('Error unfollowing company:', error);
    throw error;
  }
};

// Check if a user is following a specific company
export const isFollowingCompany = async (userId: string, ticker: string): Promise<boolean> => {
  try {
    const companies = await getUserFollowedCompanies(userId);
    return companies.some(company => company.ticker === ticker);
  } catch (error) {
    console.error('Error checking if following company:', error);
    return false;
  }
}; 
'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

// Define the company type
export type FollowedCompany = {
  ticker: string;
  name: string;
  cik: string;
};

// Map of company tickers to their full information
// This is used to convert from ticker-only format to full company objects
const companyData: Record<string, { name: string, cik: string }> = {
  'AAPL': { name: 'Apple Inc.', cik: '0000320193' },
  'MSFT': { name: 'Microsoft Corporation', cik: '0000789019' },
  'GOOGL': { name: 'Alphabet Inc.', cik: '0001652044' },
  'AMZN': { name: 'Amazon.com, Inc.', cik: '0001018724' },
  'META': { name: 'Meta Platforms, Inc.', cik: '0001326801' },
  'TSLA': { name: 'Tesla, Inc.', cik: '0001318605' },
  'NVDA': { name: 'NVIDIA Corporation', cik: '0001045810' },
  'JPM': { name: 'JPMorgan Chase & Co.', cik: '0000019617' },
  'V': { name: 'Visa Inc.', cik: '0001403161' },
  'WMT': { name: 'Walmart Inc.', cik: '0000104169' },
  'JNJ': { name: 'Johnson & Johnson', cik: '0000200406' },
  'PG': { name: 'Procter & Gamble Company', cik: '0000080424' },
};

// Get a user's followed companies
export const getUserFollowedCompanies = async (userId: string): Promise<FollowedCompany[]> => {
  try {
    // Get the user profile document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if followedCompanies exists
      if (userData.followedCompanies) {
        // Handle both formats: array of strings and array of objects
        return userData.followedCompanies.map((company: string | FollowedCompany) => {
          // If company is already a FollowedCompany object, return it
          if (typeof company === 'object' && company.ticker) {
            return company;
          }
          
          // If company is a string (ticker), convert it to a FollowedCompany object
          const ticker = typeof company === 'string' ? company : '';
          const companyInfo = companyData[ticker] || { name: ticker, cik: '' };
          
          return {
            ticker,
            name: companyInfo.name,
            cik: companyInfo.cik
          };
        });
      }
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
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let followedCompanies = userData.followedCompanies || [];
      
      // Handle both formats: array of strings and array of objects
      if (followedCompanies.length > 0) {
        if (typeof followedCompanies[0] === 'string') {
          // If companies are stored as strings, remove the ticker
          followedCompanies = followedCompanies.filter((ticker: string) => ticker !== company.ticker);
        } else {
          // If companies are stored as objects, use arrayRemove
          await updateDoc(userRef, {
            followedCompanies: arrayRemove(company)
          });
          return;
        }
        
        // Update with the filtered array
        await updateDoc(userRef, {
          followedCompanies: followedCompanies
        });
      }
    }
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
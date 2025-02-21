import { Timestamp } from 'firebase/firestore';

// This is just for reference of the schema we'll create
export interface FirestoreSchema {
  users: {
    [uid: string]: {
      email: string;
      displayName?: string;
      createdAt: Timestamp;
      lastUpdated: Timestamp;
      jobTitle: string;
      industry: string;
      companySize?: string;
      location?: string;
    };
  };
  
  userPreferences: {
    [uid: string]: {
      industries: string[];
      technologies: string[];
      companies: string[];
      lastUpdated: Timestamp;
    };
  };

  industries: {
    [id: string]: {
      name: string;
      description: string;
      parentIndustry?: string;
    };
  };

  companies: {
    [id: string]: {
      name: string;
      industries: string[];
      technologies: string[];
      description: string;
      website?: string;
    };
  };

  feed: {
    [id: string]: {
      type: 'news' | 'update' | 'analysis';
      title: string;
      content: string;
      source: string;
      url: string;
      publishedAt: Timestamp;
      relatedIndustries: string[];
      relatedCompanies: string[];
      relatedTechnologies: string[];
    };
  };
} 
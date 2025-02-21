import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ServiceAccount } from 'firebase-admin/app';

dotenv.config({ path: '.env.local' });

const serviceAccountPath = path.join(process.cwd(), 'marketstep-5056d-firebase-adminsdk-fbsvc-0e81637c62.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize admin SDK (only if not already initialized)
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

const adminDb = getFirestore();

export { adminDb };

// Initialize default industries
export const initializeIndustries = async () => {
  const batch = adminDb.batch();
  
  const industries = [
    { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Artificial Intelligence and Machine Learning technologies' },
    { id: 'cloud', name: 'Cloud Computing', description: 'Cloud infrastructure and services' },
    { id: 'cybersecurity', name: 'Cybersecurity', description: 'Security technologies and solutions' },
    // Add more industries as needed
  ];

  industries.forEach((industry) => {
    const ref = adminDb.doc(`industries/${industry.id}`);
    batch.set(ref, industry);
  });

  await batch.commit();
};

// Initialize default companies
export const initializeCompanies = async () => {
  const batch = adminDb.batch();
  
  const companies = [
    {
      id: 'openai',
      name: 'OpenAI',
      industries: ['ai-ml'],
      technologies: ['gpt', 'dall-e'],
      description: 'Leading AI research company',
      website: 'https://openai.com'
    },
    // Add more companies as needed
  ];

  companies.forEach((company) => {
    const ref = adminDb.doc(`companies/${company.id}`);
    batch.set(ref, company);
  });

  await batch.commit();
};

// Helper function to seed initial data (use carefully!)
export const seedDatabase = async () => {
  try {
    await initializeIndustries();
    await initializeCompanies();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}; 
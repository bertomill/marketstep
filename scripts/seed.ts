import * as dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { adminDb } from '../lib/firebase/admin';
import { 
  seedIndustries, 
  seedCompanies, 
  seedFeedItems 
} from '../lib/firebase/seed-data';

async function seedDatabase() {
  try {
    // Create a batch
    const batch = adminDb.batch();

    // Seed Industries
    console.log('Seeding industries...');
    seedIndustries.forEach((industry) => {
      const ref = adminDb.collection('industries').doc(industry.id);
      batch.set(ref, {
        ...industry,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Seed Companies
    console.log('Seeding companies...');
    seedCompanies.forEach((company) => {
      const ref = adminDb.collection('companies').doc(company.id);
      batch.set(ref, {
        ...company,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Seed Feed Items
    console.log('Seeding feed items...');
    seedFeedItems.forEach((item) => {
      const ref = adminDb.collection('feed').doc(item.id);
      batch.set(ref, {
        ...item,
        publishedAt: new Date(),
        createdAt: new Date()
      });
    });

    // Commit the batch
    await batch.commit();
    console.log('✅ Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Only run in development
if (process.env.NODE_ENV === 'development') {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 
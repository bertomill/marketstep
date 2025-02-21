import { seedDatabase } from '../lib/firebase/admin';

// Only run this in development!
if (process.env.NODE_ENV === 'development') {
  seedDatabase()
    .then(() => console.log('Seeding complete'))
    .catch((error) => console.error('Seeding failed:', error));
} 
import admin from 'firebase-admin';
import fs from 'fs';

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) return;

  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    let credential;

    if (serviceAccountPath) {
      const raw = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(raw);
      credential = admin.credential.cert(serviceAccount);
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, '\n')
        .replace(/^"|"$/g, '')
        .replace(/^'|'$/g, '');

      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      });
    } else {
      throw new Error(
        'Missing Firebase credentials. Please set either:\n' +
        '1. GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON file)\n' +
        '2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY'
      );
    }

    admin.initializeApp({ credential });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
};

initializeFirebaseAdmin();

export default admin;

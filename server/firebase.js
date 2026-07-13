const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Attempt to initialize Firebase Admin SDK
try {
  // Option 1: Using service account JSON file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized via service account file.");
  } 
  // Option 2: Using environment variables mapped to service account fields
  else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines from .env file
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
      })
    });
    console.log("Firebase Admin initialized via environment variables.");
  } else {
    console.warn("WARNING: Firebase Admin not initialized. Provide FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE variables in .env");
  }
} catch (error) {
  console.error("Firebase admin initialization error:", error);
}

const db = admin.apps.length ? admin.firestore() : null;

module.exports = { admin, db };

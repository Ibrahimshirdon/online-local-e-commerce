const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-adminsdk.json');
    let credential;

    if (fs.existsSync(serviceAccountPath)) {
        // Local: use file
        credential = admin.credential.cert(require(serviceAccountPath));
    } else {
        // Production (Vercel): use env variables
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
        });
    }

    admin.initializeApp({ credential });
    console.log(`🔌 Connected to Firebase Firestore`);
}

const db = admin.firestore();
module.exports = db;


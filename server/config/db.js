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
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            // Remove beginning and ending quotes if the user copied them from the JSON file
            privateKey = privateKey.replace(/^"|"$/g, '');
            // Convert literal '\n' text to actual linebreaks
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        // Production (Vercel): use env variables
        credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
        });
    }

    admin.initializeApp({ credential });
    console.log(`🔌 Connected to Firebase Firestore`);
}

const db = admin.firestore();
module.exports = db;


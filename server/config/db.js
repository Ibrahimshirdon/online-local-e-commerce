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
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Foolproof method: parsing the entire JSON string
            credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
        } else {
            // Fallback for individual variables
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;
            if (privateKey) {
                privateKey = privateKey.replace(/^"|"$/g, '');
                privateKey = privateKey.replace(/\\n/g, '\n');
            }

            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            });
        }
    }

    admin.initializeApp({ credential });
    console.log(`🔌 Connected to Firebase Firestore`);
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
module.exports = db;

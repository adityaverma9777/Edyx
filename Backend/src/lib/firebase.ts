import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Note: Ensure the following environment variables are set in Render/Vercel/env
// FIREBASE_PROJECT_ID
// FIREBASE_CLIENT_EMAIL
// FIREBASE_PRIVATE_KEY (remember to replace \\n with actual newlines in the string)

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines if passed via environment variables
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin Initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
    }
}

export const auth = admin.auth();

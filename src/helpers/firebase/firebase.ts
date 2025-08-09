import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics";

// Firebase config from .env (safe for prototype)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize once
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Optional analytics (client-only)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  void import("firebase/analytics").then((mod) => {
    analytics = mod.getAnalytics(app);
  });
}

// Auth + DB + Storage getters (avoid SSR issues)
export const getAuthClient = (): Auth => getAuth(app);
export const getDbClient = (): Firestore => getFirestore(app);
export const getStorageClient = (): FirebaseStorage => getStorage(app);

export { analytics };

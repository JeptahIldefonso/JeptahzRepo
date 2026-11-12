import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let app: App | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;

export function getFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return { app: null, db: null, storage: null, bucket: null };
  }

  // Format escaped newlines in environment variable
  privateKey = privateKey.replace(/\\n/g, "\n");

  if (!getApps().length) {
    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } catch (err: any) {
      console.error("Failed to initialize Firebase Admin:", err.message);
      return { app: null, db: null, storage: null, bucket: null };
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  storage = getStorage(app);
  const bucket = process.env.FIREBASE_STORAGE_BUCKET
    ? storage.bucket(process.env.FIREBASE_STORAGE_BUCKET)
    : storage.bucket();

  return { app, db, storage, bucket };
}

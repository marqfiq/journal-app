// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getFunctions, Functions } from 'firebase/functions'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const functions: Functions = getFunctions(app)
export const storage: FirebaseStorage = getStorage(app)

// For local development with emulator
if (import.meta.env.DEV) {
  // Uncomment these lines when you set up Firebase emulators
  // import { connectAuthEmulator } from 'firebase/auth'
  // import { connectFirestoreEmulator } from 'firebase/firestore'
  // import { connectFunctionsEmulator } from 'firebase/functions'
  
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectFunctionsEmulator(functions, 'localhost', 5001)
}

export default app


import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { initializeUser, checkAndExpireTrial } from '../services/userService';
import { User as AppUser } from '../types';
import { useUserAccess, UserAccess } from '../hooks/useUserAccess';

interface AuthContextType {
  user: User | null; // Firebase Auth User
  appUser: AppUser | null; // Full App User (Firestore + Auth)
  userAccess: UserAccess; // Access Level (Trial, Pro, etc.)
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hook handles its own logging in dev mode
  const userAccess = useUserAccess(appUser);

  useEffect(() => {
    let unsubscribeFirestore: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Subscribe to Firestore user document for real-time updates
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            // Merge Auth data with Firestore data
            const firestoreData = docSnap.data();
            const fullUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              // Access Fields (using 'as any' safely since we defined the type to match or be optional)
              trial_start_at: firestoreData.trial_start_at,
              trial_end_at: firestoreData.trial_end_at,
              subscription_status: firestoreData.subscription_status,
              has_written_first_entry: firestoreData.has_written_first_entry,
              pro_override: firestoreData.pro_override,
              // Stripe Fields
              stripeCustomerId: firestoreData.stripeCustomerId,
              stripeSubscriptionId: firestoreData.stripeSubscriptionId,
              stripePriceId: firestoreData.stripePriceId,
              stripeCurrentPeriodEnd: firestoreData.stripeCurrentPeriodEnd,
              stripeCancelAtPeriodEnd: firestoreData.stripeCancelAtPeriodEnd,
              // Account Management
              scheduledForDeletionAt: firestoreData.scheduledForDeletionAt,
            };

            // Check for trial expiration
            checkAndExpireTrial(firebaseUser.uid, fullUser).catch(err => {
              console.error("Error checking trial expiration:", err);
            });

            setAppUser(fullUser);
          } else {
            // Doc might not exist yet if just created, or error. 
            // initializeUser should handle creation, but we might be racing it.
            // For now, allow partial app user or null. 
            // We'll set a basic AppUser so the hook doesn't crash but defaults to expired/trial logic
            setAppUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            } as AppUser);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user document:", error);
          setLoading(false);
        });
      } else {
        setAppUser(null);
        if (unsubscribeFirestore) unsubscribeFirestore();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await initializeUser(result.user.uid);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setAppUser(null);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, userAccess, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

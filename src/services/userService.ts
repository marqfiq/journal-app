import { doc, getDoc, setDoc, Timestamp, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SYSTEM_STICKERS } from '../constants/stickers';
import { User } from '../types';

export interface UserSettings {
    themeMode?: 'light' | 'dark';
    accentColor?: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
    fontSize?: 'small' | 'medium' | 'large';
    headerFont?: string;
    bodyFont?: string;
}

const USERS_COLLECTION = 'users';
const TRIAL_DURATION_DAYS = 30;

/**
 * Starts the free trial for a user if they are eligible.
 * Safe to call multiple times (idempotent).
 * 
 * @returns {Promise<{ trialStarted: boolean, accessLevel: string }>}
 */
export const startTrialForUser = async (userId: string): Promise<{ trialStarted: boolean, accessLevel: string }> => {
    const docRef = doc(db, USERS_COLLECTION, userId);

    // We use a transaction or simple get/update pattern. 
    // Since this is a specific user action (clicking "Done"), a simple get-then-update 
    // is usually sufficient and simpler than a transaction unless high concurrency is expected on the same user doc.
    // Given the requirements request "atomic" updates for the fields, updateDoc is atomic for the fields provided.

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("User document does not exist");
    }

    const userData = docSnap.data() as User;

    // 1. Check Pro Override (Permanent Pro)
    if (userData.pro_override) {
        console.log(`startTrialForUser: User ${userId} has pro_override. Skipping trial.`);
        return { trialStarted: false, accessLevel: 'pro' };
    }

    // 2. Check if Trial already started
    if (userData.trial_start_at) {
        console.log(`startTrialForUser: User ${userId} already has trial_start_at. Skipping.`);
        // They are either in trial or expired
        return { trialStarted: false, accessLevel: 'trial_or_expired' };
    }

    // 3. Start Trial (If not already started and no override)
    // We proceed even if has_written_first_entry is true (if for some reason it got set but trial didn't start),
    // but typically this is called on the first entry.

    // Calculate end date safely on client for the UI return, but serverTimestamp preferred for DB 
    // For simplicity and consistency matching the serverTimestamp, we'll assume ~30 days from now for the return value.

    const updates: Partial<User> = {
        has_written_first_entry: true,
        // We use serverTimestamp for the database to be accurate
        trial_start_at: serverTimestamp() as Timestamp,
        // 30 Days from now
        trial_end_at: Timestamp.fromDate(new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)),
        subscription_status: 'trialing'
    };

    await updateDoc(docRef, updates);
    console.log(`startTrialForUser: Trial started for user ${userId}`);

    return { trialStarted: true, accessLevel: 'trial' };
};

/**
 * Retrieves user settings from Firestore.
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    console.log("initializeUser called for", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().settings) {
        return docSnap.data().settings as UserSettings;
    }

    return null;
};

/**
 * Updates user settings in Firestore.
 * Merges with existing settings.
 */
export const updateUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);

    // We use setDoc with merge: true to ensure the document exists and we don't overwrite other fields
    await setDoc(docRef, {
        settings: settings
    }, { merge: true });
};

/**
 * Initializes a user document if it doesn't exist, or ensures default fields are present.
 * This is called on sign-in.
 */
export const initializeUser = async (userId: string): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    console.log("initializeUser called for", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        // New user: Create doc with default stickers
        const defaultStickers = SYSTEM_STICKERS.map(s => s.url);
        await setDoc(docRef, {
            stickers: defaultStickers,
            settings: {
                themeMode: 'light', // Default settings
                accentColor: 'pink',
                fontSize: 'medium'
            }
        });
    } else {
        // Existing user: Check if stickers field exists
        const data = docSnap.data();
        console.log("initializeUser: Existing user found", userId, "Stickers:", data.stickers ? "Found" : "Missing");
        // We no longer force-write defaults here, as getUserStickers handles the fallback safely.
    }
};

/**
 * Checks if a user's trial has expired and updates their status if necessary.
 * Designed to be called from the client side when user data loads.
 */
export const checkAndExpireTrial = async (userId: string, userData: User): Promise<boolean> => {
    if (userData.subscription_status !== 'trialing' || !userData.trial_end_at) {
        return false;
    }

    const now = new Date();
    const endDate = userData.trial_end_at instanceof Timestamp ? userData.trial_end_at.toDate() : new Date(0);

    if (now > endDate) {
        console.log(`Trial expired for user ${userId}. Updating status.`);
        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, {
            subscription_status: 'expired'
        });
        return true;
    }

    return false;
};

/**
 * Schedules an account for deletion (Soft Delete).
 */
export const scheduleAccountDeletion = async (userId: string): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
        scheduledForDeletionAt: serverTimestamp()
    });
};

/**
 * Restores an account scheduled for deletion.
 */
export const restoreAccount = async (userId: string): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
        scheduledForDeletionAt: null
    });
};

/**
 * Permanently deletes user data via Cloud Function.
 */
export const deleteAccountPermanently = async (userId: string): Promise<void> => {
    // Dynamic import to avoid loading functions SDK unless needed
    const { httpsCallable } = await import('firebase/functions');
    const { functions } = await import('../lib/firebase');

    const deleteAccountFn = httpsCallable(functions, 'deleteUserAccount');
    try {
        await deleteAccountFn();
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
};

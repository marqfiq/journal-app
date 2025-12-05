import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SYSTEM_STICKERS } from '../constants/stickers';

export interface UserSettings {
    themeMode?: 'light' | 'dark';
    accentColor?: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
    fontSize?: 'small' | 'medium' | 'large';
}

const USERS_COLLECTION = 'users';

/**
 * Retrieves user settings from Firestore.
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
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
        if (!data.stickers) {
            // Legacy user without stickers: Add defaults
            const defaultStickers = SYSTEM_STICKERS.map(s => s.url);
            await setDoc(docRef, {
                stickers: defaultStickers
            }, { merge: true });
        }
    }
};

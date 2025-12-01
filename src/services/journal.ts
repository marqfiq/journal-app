import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JournalEntry } from '../types';

const COLLECTION_NAME = 'entries';

export const JournalService = {
    // Create
    async createEntry(userId: string, entryData: Partial<JournalEntry>) {
        try {
            const now = new Date();
            const dayKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

            const newEntry = {
                userId,
                date: Date.now(),
                dayKey,
                text: '',
                photos: [],
                tags: [],
                mood: 3, // Default neutral
                ...entryData
            };

            const docRef = await addDoc(collection(db, COLLECTION_NAME), newEntry);
            return { id: docRef.id, ...newEntry };
        } catch (error) {
            console.error("Error adding document: ", error);
            throw error;
        }
    },

    // Read
    async getEntries(userId: string) {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId),
                orderBy("date", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as JournalEntry[];
        } catch (error) {
            console.error("Error getting documents: ", error);
            throw error;
        }
    },

    async getEntry(id: string) {
        // Note: In a real app, you'd want to verify userId matches here too for safety, 
        // though security rules handle the hard enforcement.
        // For now, we'll fetch it and let the component handle permission checks if needed.
        // But since we don't have a direct getDoc wrapper here yet, we can rely on list or add it.
        // Let's stick to list for now.
        return null;
    },

    // Update
    async updateEntry(id: string, updates: Partial<JournalEntry>) {
        try {
            const entryRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(entryRef, updates);
        } catch (error) {
            console.error("Error updating document: ", error);
            throw error;
        }
    },

    // Delete
    async deleteEntry(id: string) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting document: ", error);
            throw error;
        }
    },

    // Search (Client-side for now)
    searchEntries(entries: JournalEntry[], queryText: string) {
        if (!queryText) return entries;
        const lowerQuery = queryText.toLowerCase();
        return entries.filter(entry =>
            entry.text.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            (entry.location?.address && entry.location.address.toLowerCase().includes(lowerQuery))
        );
    }
};

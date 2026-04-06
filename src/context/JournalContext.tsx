import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from './AuthContext';

interface JournalContextType {
    entries: JournalEntry[];
    loading: boolean;
    refreshEntries: () => Promise<void>;
    addEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<string>;
    updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchEntries = useCallback(async () => {
        if (!user) {
            setEntries([]);
            setLoading(false);
            return;
        }

        try {
            const data = await JournalService.getEntries(user.uid);
            // Sort entries initially (newest first)
            setEntries(data.sort((a, b) => b.date - a.date));
        } catch (error) {
            console.error("Failed to fetch journal entries", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial load
    useEffect(() => {
        let isMounted = true;
        
        const init = async () => {
            if (isMounted) setLoading(true);
            await fetchEntries();
            if (isMounted) setLoading(false);
        };
        
        init();
        
        return () => { isMounted = false; };
    }, [fetchEntries]);

    const addEntry = async (entry: Omit<JournalEntry, 'id'>) => {
        if (!user) throw new Error("Must be logged in to add entry");
        
        // Firestore call returns { id, ...newEntry }
        const result = await JournalService.createEntry(user.uid, entry);
        const id = result.id;
        
        // Update local state with the new entry (include the ID)
        const newEntry = { ...entry, id };
        setEntries(prev => [newEntry, ...prev].sort((a, b) => b.date - a.date));
        
        return id;
    };

    const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
        // Optimistic local update
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e).sort((a, b) => b.date - a.date));
        
        try {
            await JournalService.updateEntry(id, updates);
        } catch (error) {
            // If it fails, we should ideally revert or refresh
            console.error("Failed to update entry", error);
            await fetchEntries(); // Re-sync
            throw error;
        }
    };

    const deleteEntry = async (id: string) => {
        // Optimistic local delete
        setEntries(prev => prev.filter(e => e.id !== id));
        
        try {
            await JournalService.deleteEntry(id);
        } catch (error) {
            console.error("Failed to delete entry", error);
            await fetchEntries(); // Re-sync
            throw error;
        }
    };

    return (
        <JournalContext.Provider value={{ 
            entries, 
            loading, 
            refreshEntries: fetchEntries,
            addEntry,
            updateEntry,
            deleteEntry
        }}>
            {children}
        </JournalContext.Provider>
    );
}

export function useJournal() {
    const context = useContext(JournalContext);
    if (context === undefined) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
}

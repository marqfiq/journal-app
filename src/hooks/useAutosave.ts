import { useState, useEffect, useRef, useCallback } from 'react';

interface AutosaveOptions<T> {
    data: T;
    onSave: (data: T) => Promise<void>;
    interval?: number;
    saveOnUnmount?: boolean;
    key?: string; // LocalStorage key
}

export type AutosaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error' | 'offline';

export function useAutosave<T>({ data, onSave, interval = 2000, saveOnUnmount = true, key }: AutosaveOptions<T>) {
    const [status, setStatus] = useState<AutosaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const dataRef = useRef(data);
    const previousDataRef = useRef(data);
    const isOnline = useRef(navigator.onLine);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingSave = useRef(false);

    // Keep refs up to date
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    // Online/Offline listeners
    useEffect(() => {
        const handleOnline = () => {
            isOnline.current = true;
            if (status === 'offline') {
                setStatus('idle');
            }
        };
        const handleOffline = () => {
            isOnline.current = false;
            setStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [status]);

    // Local Storage Backup (Immediate)
    useEffect(() => {
        if (key && JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('Failed to save to local storage', e);
            }
        }
    }, [data, key]);

    // Core Save Logic
    const performSave = useCallback(async (dataToSave: T) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        pendingSave.current = false;
        setStatus('saving');

        try {
            await onSave(dataToSave);
            setStatus('saved');
            setLastSaved(new Date());
            previousDataRef.current = dataToSave;
        } catch (error) {
            console.error('Autosave failed', error);
            setStatus('error');
            // If failed, we might want to keep pendingSave true? 
            // But for now let's assume error state handles it.
        }
    }, [onSave]);

    // Debounced Cloud Save Effect
    useEffect(() => {
        // Skip if data hasn't changed, unless forced by retry
        if (retryTrigger === 0 && JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
            return;
        }

        if (!isOnline.current) {
            setStatus('offline');
            return;
        }

        // Immediate feedback: Unsaved changes
        setStatus('unsaved');
        pendingSave.current = true;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            performSave(data);
        }, interval);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Save on unmount if pending
            if (saveOnUnmount && pendingSave.current) {
                // Fire and forget - cannot await in cleanup
                onSave(dataRef.current).catch(e => console.error("Save on unmount failed", e));
            }
        };
    }, [data, interval, performSave, retryTrigger, saveOnUnmount, onSave]);

    const retry = () => setRetryTrigger(prev => prev + 1);

    const saveNow = useCallback(async () => {
        await performSave(dataRef.current);
    }, [performSave]);

    return { status, lastSaved, retry, saveNow };
}

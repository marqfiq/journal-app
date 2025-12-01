import { useState, useEffect, useRef, useCallback } from 'react';

interface AutosaveOptions<T> {
    data: T;
    onSave: (data: T) => Promise<void>;
    interval?: number;
    saveOnUnmount?: boolean;
    key?: string; // LocalStorage key
}

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export function useAutosave<T>({ data, onSave, interval = 1500, saveOnUnmount = true, key }: AutosaveOptions<T>) {
    const [status, setStatus] = useState<AutosaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const dataRef = useRef(data);
    const previousDataRef = useRef(data);
    const isOnline = useRef(navigator.onLine);

    // Keep refs up to date
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    // Online/Offline listeners
    useEffect(() => {
        const handleOnline = () => {
            isOnline.current = true;
            // Trigger save if we have unsaved changes? 
            // For now, let's just update status if we were offline
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

    // Debounced Cloud Save
    useEffect(() => {
        // Skip if data hasn't changed (deep comparison simplistic for now, but effective for small objects)
        if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
            return;
        }

        if (!isOnline.current) {
            setStatus('offline');
            return;
        }

        setStatus('saving');

        const handler = setTimeout(async () => {
            try {
                await onSave(data);
                setStatus('saved');
                setLastSaved(new Date());
                previousDataRef.current = data;

                // Clear local storage backup on successful cloud save? 
                // Or keep it as a cache? Let's keep it for now, maybe clear on explicit "exit" or "delete".
            } catch (error) {
                console.error('Autosave failed', error);
                setStatus('error');
            }
        }, interval);

        return () => {
            clearTimeout(handler);
        };
    }, [data, interval, onSave]);

    return { status, lastSaved };
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { StickerService } from '../services/stickerService';
import { SYSTEM_STICKERS } from '../constants/stickers';
import { Sticker } from '../types';

interface StickerContextType {
    stickers: Sticker[];
    loading: boolean;
    addSticker: (file: File) => Promise<void>;
    removeSticker: (stickerOrUrl: Sticker | string) => Promise<void>;
    restoreStickers: () => Promise<void>;
    canManage: boolean;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

export function StickerProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [stickers, setStickers] = useState<Sticker[]>(SYSTEM_STICKERS);
    const [loading, setLoading] = useState(true);

    // Load from cache immediately on mount or user change
    useEffect(() => {
        if (!user) {
            setStickers(SYSTEM_STICKERS);
            setLoading(false);
            return;
        }

        const cacheKey = `user_stickers_${user.uid}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setStickers(parsed);
                setLoading(false); // Show cached immediately
            } catch (e) {
                console.error("Failed to parse sticker cache", e);
            }
        }

        // Fetch fresh data in background
        loadStickers(user.uid, cacheKey);
    }, [user]);

    const loadStickers = async (userId: string, cacheKey: string) => {
        try {
            const urls = await StickerService.getUserStickers(userId);
            const mappedStickers = urls.map(url => {
                const systemSticker = SYSTEM_STICKERS.find(s => s.url === url);
                if (systemSticker) return systemSticker;

                return {
                    id: url,
                    url: url,
                    owner_id: userId
                };
            });

            setStickers(mappedStickers);
            localStorage.setItem(cacheKey, JSON.stringify(mappedStickers));
        } catch (error) {
            console.error("Error loading stickers:", error);
            // If cache existed, we keep showing it. If not, we might be in trouble but we have system stickers default.
        } finally {
            setLoading(false);
        }
    };

    const addSticker = async (file: File) => {
        if (!user) return;
        try {
            await StickerService.uploadSticker(user.uid, file);
            // Reload to update cache and UI
            await loadStickers(user.uid, `user_stickers_${user.uid}`);
        } catch (error) {
            console.error("Error adding sticker:", error);
            throw error;
        }
    };

    const removeSticker = async (stickerOrUrl: Sticker | string) => {
        if (!user) return;
        try {
            const url = typeof stickerOrUrl === 'string' ? stickerOrUrl : stickerOrUrl.url;
            await StickerService.deleteSticker(user.uid, url);
            // Reload to update cache and UI
            await loadStickers(user.uid, `user_stickers_${user.uid}`);
        } catch (error) {
            console.error("Error removing sticker:", error);
            throw error;
        }
    };

    return (
        <StickerContext.Provider value={{
            stickers,
            loading,
            addSticker,
            removeSticker,
            restoreStickers: async () => {
                if (!user) return;
                await StickerService.restoreStickersFromStorage(user.uid);
                await loadStickers(user.uid, `user_stickers_${user.uid}`);
            },
            canManage: !!user
        }}>
            {children}
        </StickerContext.Provider>
    );
}

export function useStickerContext() {
    const context = useContext(StickerContext);
    if (context === undefined) {
        throw new Error('useStickerContext must be used within a StickerProvider');
    }
    return context;
}

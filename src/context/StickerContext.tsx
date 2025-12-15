import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { StickerService } from '../services/stickerService';
import { SYSTEM_STICKERS } from '../constants/stickers';
import { Sticker } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StickerContextType {
    stickers: Sticker[];
    loading: boolean;
    addSticker: (file: File) => Promise<void>;
    removeSticker: (stickerOrUrl: Sticker | string) => Promise<void>;
    reorderStickers: (stickers: Sticker[]) => Promise<void>;
    restoreStickers: () => Promise<void>;
    canManage: boolean;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

export function StickerProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [loading, setLoading] = useState(true);

    // Load stickers via realtime listener
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setStickers(SYSTEM_STICKERS);
            setLoading(false);
            return;
        }

        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.stickers) {
                    const urls = data.stickers as string[];
                    const mappedStickers = urls.map(url => {
                        const systemSticker = SYSTEM_STICKERS.find(s => s.url === url);
                        if (systemSticker) return systemSticker;
                        return {
                            id: url,
                            url: url,
                            owner_id: user.uid
                        };
                    });
                    setStickers(mappedStickers);
                } else {
                    // Doc exists but no stickers field -> Use defaults
                    setStickers(SYSTEM_STICKERS);
                }
            } else {
                // Doc doesn't exist -> Use defaults
                setStickers(SYSTEM_STICKERS);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to sticker updates:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    const addSticker = async (file: File) => {
        if (!user) return;
        try {
            await StickerService.uploadSticker(user.uid, file);
            // No need to manually reload, onSnapshot will catch the update
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
            // No need to manually reload, onSnapshot will catch the update
        } catch (error) {
            console.error("Error removing sticker:", error);
            throw error;
        }
    };

    const reorderStickers = async (newStickers: Sticker[]) => {
        if (!user) return;
        try {
            const urls = newStickers.map(s => s.url);
            await StickerService.updateStickerOrder(user.uid, urls);
        } catch (error) {
            console.error("Error reordering stickers:", error);
            throw error;
        }
    };

    return (
        <StickerContext.Provider value={{
            stickers,
            loading,
            addSticker,
            removeSticker,
            reorderStickers,
            restoreStickers: async () => {
                if (!user) return;
                await StickerService.restoreStickersFromStorage(user.uid);
                // No need to manually reload
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

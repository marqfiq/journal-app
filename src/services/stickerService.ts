import { db, storage } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, getDocFromServer } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { SYSTEM_STICKERS } from '../constants/stickers';
import { JournalService } from './journal';

const COLLECTION_NAME = 'users';

export const StickerService = {
    async getUserStickers(userId: string): Promise<string[]> {
        const userDocRef = doc(db, COLLECTION_NAME, userId);
        console.log("getUserStickers: Fetching from SERVER for", userId);
        const userDoc = await getDocFromServer(userDocRef);

        if (userDoc.exists() && userDoc.data().stickers) {
            return userDoc.data().stickers;
        } else {
            // Return system stickers if no data exists (Read-only fallback)
            return SYSTEM_STICKERS.map(s => s.url);
        }
    },

    async uploadSticker(userId: string, file: File): Promise<string> {
        // 0. Resize Image (Client-side)
        const resizedBlob = await this.resizeImage(file, 128);

        // 1. Upload to Firebase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/\.[^/.]+$/, "")}.webp`; // Force WebP
        const storageRef = ref(storage, `stickers/${userId}/${fileName}`);

        await uploadBytes(storageRef, resizedBlob);
        const downloadURL = await getDownloadURL(storageRef);

        // 2. Add to Firestore (Prepend to list)
        const userDocRef = doc(db, COLLECTION_NAME, userId);
        const userDoc = await getDoc(userDocRef);

        let currentStickers: string[] = [];
        if (userDoc.exists() && userDoc.data().stickers) {
            currentStickers = userDoc.data().stickers;
        } else {
            currentStickers = SYSTEM_STICKERS.map(s => s.url);
        }

        const updatedStickers = [downloadURL, ...currentStickers];

        await setDoc(userDocRef, { stickers: updatedStickers }, { merge: true });

        return downloadURL;
    },

    // Helper: Resize image to max dimensions
    resizeImage(file: File, maxDimension: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxDimension) {
                            height *= maxDimension / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width *= maxDimension / height;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    }, 'image/webp', 0.8);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    },

    async deleteSticker(userId: string, stickerUrl: string): Promise<void> {
        // 1. Remove from Firestore
        const userDocRef = doc(db, COLLECTION_NAME, userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) return;

        const currentStickers = userDoc.data().stickers || [];
        const updatedStickers = currentStickers.filter((url: string) => url !== stickerUrl);

        await updateDoc(userDocRef, { stickers: updatedStickers });

        // 2. If it's a custom sticker (firebase storage), check usage before deleting from Storage
        if (stickerUrl.includes('firebasestorage')) {
            try {
                // Check if sticker is used in any journal entry
                const isUsed = await JournalService.isStickerUsed(userId, stickerUrl);

                if (!isUsed) {
                    // Only delete from storage if NOT used
                    const storageRef = ref(storage, stickerUrl);
                    await deleteObject(storageRef);
                } else {
                    console.log("Sticker is used in entries, keeping in storage but removed from list.");
                }
            } catch (error) {
                console.error("Error managing sticker storage:", error);
                // Continue even if storage operations fail
            }
        }
    },

    async restoreStickersFromStorage(userId: string): Promise<string[]> {
        const stickersRef = ref(storage, `stickers/${userId}`);
        try {
            const { listAll } = await import('firebase/storage');
            const res = await listAll(stickersRef);

            const urls = await Promise.all(
                res.items.map((itemRef) => getDownloadURL(itemRef))
            );

            // Merge with system stickers
            const systemUrls = SYSTEM_STICKERS.map(s => s.url);
            const allStickers = [...new Set([...urls, ...systemUrls])]; // Deduplicate

            // Update Firestore
            const userDocRef = doc(db, COLLECTION_NAME, userId);
            await setDoc(userDocRef, { stickers: allStickers }, { merge: true });

            return allStickers;
        } catch (error) {
            console.error("Error restoring stickers:", error);
            throw error;
        }
    },

    async updateStickerOrder(userId: string, stickers: string[]): Promise<void> {
        const userDocRef = doc(db, COLLECTION_NAME, userId);
        await updateDoc(userDocRef, { stickers });
    }
};

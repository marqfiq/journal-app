import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { compressImage } from '../utils/imageProcessing';

export const StorageService = {
    async uploadImage(file: File, userId: string): Promise<string> {
        try {
            // Compress image before upload (WebP, max 1920px)
            const compressedBlob = await compressImage(file);

            // Create a unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            const fileName = `${timestamp}-${random}.webp`;

            // Path: entries/{userId}/{fileName}
            const storageRef = ref(storage, `entries/${userId}/${fileName}`);

            await uploadBytes(storageRef, compressedBlob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error("Error uploading image: ", error);
            throw error;
        }
    },

    async deleteImage(url: string): Promise<void> {
        try {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
        } catch (error) {
            console.error("Error deleting image: ", error);
            throw error;
        }
    }
};

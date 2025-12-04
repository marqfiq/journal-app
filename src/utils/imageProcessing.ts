/**
 * Compresses and resizes an image file to a maximum dimension while maintaining aspect ratio.
 * Converts to WebP format.
 * @param file The file to resize
 * @param maxDimension The maximum width or height in pixels (default 1920)
 * @returns A Promise that resolves to a Blob of the compressed image
 */
export const compressImage = (file: File, maxDimension: number = 1920): Promise<Blob> => {
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

                // Only downscale if larger than maxDimension
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height *= maxDimension / width;
                        width = maxDimension;
                    } else {
                        width *= maxDimension / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Could not create blob from canvas'));
                    }
                }, 'image/webp', 0.85); // 0.85 quality, WebP format
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

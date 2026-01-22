/**
 * Client-safe utilities for file handling.
 * This file is safe to import in client components.
 */

/**
 * Convert a File/Blob to a base64 data URL for upload.
 */
export function fileToBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

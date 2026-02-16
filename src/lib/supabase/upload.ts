import { createClient } from './client';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../types';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(
    bucket: string,
    file: File,
    path?: string
): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF allowed.' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: 'File too large. Maximum size is 5MB.' };
    }

    const supabase = createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = path ? `${path}/${timestamp}.${ext}` : `${timestamp}.${ext}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(bucket: string, url: string): Promise<boolean> {
    const supabase = createClient();

    // Extract path from URL
    const urlParts = url.split(`/${bucket}/`);
    if (urlParts.length !== 2) return false;

    const path = urlParts[1];

    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        console.error('Delete error:', error);
        return false;
    }

    return true;
}


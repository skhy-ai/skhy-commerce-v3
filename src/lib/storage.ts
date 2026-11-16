import { supabase } from './supabase';

export interface UploadOptions {
    bucket: 'product-images' | 'product-documents' | 'company-logos' | 'business-docs';
    folder?: string;
    maxSizeMB?: number;
    allowedTypes?: string[];
}

export interface UploadResult {
    url: string;
    path: string;
    error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
    file: File,
    options: UploadOptions
): Promise<UploadResult> => {
    const { bucket, folder = '', maxSizeMB = 10, allowedTypes } = options;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            url: '',
            path: '',
            error: `File size exceeds ${maxSizeMB}MB limit`
        };
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.some(type => file.type.match(type))) {
        return {
            url: '',
            path: '',
            error: `File type not allowed. Accepted: ${allowedTypes.join(', ')}`
        };
    }

    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}_${randomStr}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            url: data.publicUrl,
            path: filePath
        };
    } catch (error: any) {
        return {
            url: '',
            path: '',
            error: error.message || 'Upload failed'
        };
    }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (
    bucket: string,
    path: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Delete failed'
        };
    }
};

/**
 * Get signed URL for private files
 */
export const getSignedUrl = async (
    bucket: string,
    path: string,
    expiresIn: number = 3600
): Promise<{ url: string; error?: string }> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) throw error;

        return { url: data.signedUrl };
    } catch (error: any) {
        return {
            url: '',
            error: error.message || 'Failed to get signed URL'
        };
    }
};

/**
 * List files in a bucket folder
 */
export const listFiles = async (
    bucket: string,
    folder: string = ''
): Promise<{ files: any[]; error?: string }> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder);

        if (error) throw error;

        return { files: data || [] };
    } catch (error: any) {
        return {
            files: [],
            error: error.message || 'Failed to list files'
        };
    }
};

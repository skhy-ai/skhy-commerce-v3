import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { uploadFile, deleteFile, type UploadOptions } from '../lib/storage';

interface ImageUploaderProps {
  bucket: 'product-images' | 'company-logos' | 'business-docs';
  folder?: string;
  currentImage?: string;
  currentPath?: string; // Storage path for deletion of pre-existing files
  onUploadComplete: (url: string, path: string) => void;
  onDelete?: (path: string) => void;
  maxSizeMB?: number;
  label?: string;
  acceptedTypes?: string; // e.g. 'image/*' or 'image/*,application/pdf'
  allowedMimeTypes?: string[]; // e.g. ['image/*'] or ['image/*', 'application/pdf']
}

const isImageUrl = (url: string) => {
  return /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(url);
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  folder,
  currentImage,
  currentPath,
  onUploadComplete,
  onDelete,
  maxSizeMB = 5,
  label = 'Upload File',
  acceptedTypes = 'image/*',
  allowedMimeTypes,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isImagePreview, setIsImagePreview] = useState<boolean>(
    currentImage ? isImageUrl(currentImage) : true
  );
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  // uploadedPath tracks the storage path for deletion.
  // Initialized from currentPath prop (for existing files) or set after upload.
  const [uploadedPath, setUploadedPath] = useState<string>(currentPath || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
    setIsImagePreview(currentImage ? isImageUrl(currentImage) : true);
    setUploadedPath(currentPath || '');
  }, [currentImage, currentPath]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const isPdf = file.type === 'application/pdf';
    setIsImagePreview(!isPdf);
    setPreviewFileName(file.name);

    // Show preview for images only
    if (!isPdf) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('pdf'); // Use sentinel value for PDF
    }

    // Determine allowed MIME types in the upload options
    const mimeTypes = allowedMimeTypes || (
      acceptedTypes.includes('application/pdf')
        ? ['image/*', 'application/pdf']
        : ['image/*']
    );

    const options: UploadOptions = {
      bucket,
      folder,
      maxSizeMB,
      allowedTypes: mimeTypes,
    };

    const result = await uploadFile(file, options);

    if (result.error) {
      setError(result.error);
      setPreview(currentImage || null);
      setIsImagePreview(currentImage ? isImageUrl(currentImage) : true);
      setUploading(false);
      return;
    }

    setUploadedPath(result.path);
    onUploadComplete(result.url, result.path);
    setUploading(false);
  };

  const handleDelete = async () => {
    // If we have a path (from upload or passed via currentPath), delete from storage
    if (uploadedPath) {
      const result = await deleteFile(bucket, uploadedPath);
      if (!result.success) {
        setError(result.error || 'Failed to delete file');
        return;
      }
      if (onDelete) onDelete(uploadedPath);
    }

    // Clear local state regardless (even if no path — just clear the preview)
    setPreview(null);
    setUploadedPath('');
    setPreviewFileName('');
    setIsImagePreview(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent of deletion by calling onUploadComplete with empty strings
    // This allows parent to clear the URL from its state
    onUploadComplete('', '');
  };

  const showFile = preview && !uploading;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {showFile ? (
        <div className="relative inline-block w-full max-w-sm">
          {isImagePreview && preview !== 'pdf' ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-sm h-48 object-cover rounded-lg border-2 border-gray-700"
            />
          ) : (
            <div className="w-full max-w-sm h-48 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-gray-700 bg-gray-800/50">
              <FileText className="w-12 h-12 text-blue-400" />
              <p className="text-gray-300 text-sm font-medium truncate max-w-[180px]">
                {previewFileName || 'Document uploaded'}
              </p>
              <p className="text-gray-500 text-xs">PDF / Document</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-md"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${uploading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:border-blue-500'} transition bg-gray-900/30 border-gray-600`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {acceptedTypes.includes('application/pdf') ? (
                <Upload className="w-12 h-12 text-gray-500" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-500" />
              )}
              <div>
                <p className="text-gray-300 font-medium">Click to upload</p>
                <p className="text-gray-500 text-sm">
                  {acceptedTypes.includes('application/pdf')
                    ? `Images or PDF up to ${maxSizeMB}MB`
                    : `PNG, JPG, GIF up to ${maxSizeMB}MB`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

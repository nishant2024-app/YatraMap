"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/supabase/upload";

interface ImageUploadProps {
    bucket: string;
    images: string[];
    onImagesChange: (images: string[]) => void;
    multiple?: boolean;
    maxImages?: number;
    path?: string;
}

export default function ImageUpload({
    bucket,
    images,
    onImagesChange,
    multiple = true,
    maxImages = 10,
    path,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        const newImages: string[] = [...images];

        for (const file of Array.from(files)) {
            if (!multiple && newImages.length >= 1) break;
            if (newImages.length >= maxImages) break;

            const result = await uploadImage(bucket, file, path);
            if (result.success && result.url) {
                newImages.push(result.url);
            } else {
                setError(result.error || "Upload failed");
            }
        }

        onImagesChange(newImages);
        setUploading(false);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = async (url: string) => {
        await deleteImage(bucket, url);
        onImagesChange(images.filter((img) => img !== url));
    };

    return (
        <div className="space-y-3">
            {/* Upload Button */}
            <div className="flex items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            {multiple ? "Add Images" : "Upload Image"}
                        </>
                    )}
                </label>
                {multiple && (
                    <span className="text-sm text-gray-500">
                        {images.length}/{maxImages} images
                    </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((url) => (
                        <div key={url} className="relative aspect-square group">
                            <img
                                src={url}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23374151" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="12">Error</text></svg>';
                                }}
                            />
                            <button
                                onClick={() => handleRemoveImage(url)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

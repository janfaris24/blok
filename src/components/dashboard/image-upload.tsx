'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ onImagesChange, maxImages = 5, disabled = false }: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Check if adding files would exceed max
    if (images.length + files.length > maxImages) {
      toast.error('Límite excedido', {
        description: `Máximo ${maxImages} imágenes permitidas`,
      });
      return;
    }

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Tipo de archivo inválido', {
          description: `${file.name} no es una imagen`,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Archivo muy grande', {
          description: `${file.name} excede 5MB`,
        });
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      const updatedImages = [...images, ...validFiles];
      const updatedPreviews = [...previews, ...newPreviews];

      setImages(updatedImages);
      setPreviews(updatedPreviews);
      onImagesChange(updatedImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Arrastra imágenes aquí o haz click para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF hasta 5MB • Máximo {maxImages} imágenes
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                disabled={disabled}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {images[index].name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} de {maxImages} imágenes seleccionadas
        </p>
      )}
    </div>
  );
}

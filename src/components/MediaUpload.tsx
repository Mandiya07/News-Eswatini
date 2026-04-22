import React, { useState, useRef } from 'react';
import { Upload, X, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MediaUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  label?: string;
  accept?: 'image' | 'video' | 'both';
  maxSizeMB?: number;
  className?: string;
}

export default function MediaUpload({ 
  onUploadComplete, 
  label = 'Upload Media', 
  accept = 'both',
  maxSizeMB = 50,
  className
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Validate type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (accept === 'image' && !isImage) {
      toast.error('Please upload an image file');
      return;
    }
    if (accept === 'video' && !isVideo) {
      toast.error('Please upload a video file');
      return;
    }
    if (accept === 'both' && !isImage && !isVideo) {
      toast.error('Please upload an image or video file');
      return;
    }

    const type = isImage ? 'image' : 'video';
    setFileType(type);
    
    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Start upload
    setUploading(true);
    setProgress(0);

    try {
      const url = await storageService.uploadFile(
        file, 
        type === 'image' ? 'images' : 'videos',
        (p) => setProgress(p)
      );
      onUploadComplete(url, type);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      setPreview(null);
      setFileType(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">{label}</label>
      
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-2xl transition-all overflow-hidden min-h-[160px] flex flex-col items-center justify-center p-6 text-center",
          preview 
            ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20" 
            : "border-zinc-200 dark:border-zinc-800 hover:border-rose-600/50 bg-zinc-50 dark:bg-zinc-900/50"
        )}
      >
        {!preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="text-zinc-400 group-hover:text-rose-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white">Click to upload media</p>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">
                {accept === 'both' ? 'Images or Videos' : accept === 'image' ? 'Images only' : 'Videos only'} (Max {maxSizeMB}MB)
              </p>
            </div>
          </button>
        ) : (
          <div className="w-full h-full animate-in fade-in duration-500">
            {fileType === 'image' ? (
              <img src={preview} alt="Preview" className="max-h-[300px] rounded-xl object-cover mx-auto" />
            ) : (
              <div className="relative max-h-[300px] aspect-video mx-auto">
                <video src={preview} className="max-h-[300px] rounded-xl object-contain bg-black w-full" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black uppercase text-white flex items-center gap-1.5">
                  <Film size={10} /> Video Preview
                </div>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
                <Loader2 className="text-rose-600 animate-spin" size={32} />
                <div className="w-full max-w-[200px] bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-rose-600"
                  />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  Uploading {Math.round(progress)}%
                </p>
              </div>
            )}

            {!uploading && (
              <button 
                type="button"
                onClick={clearPreview}
                className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-zinc-500 hover:text-rose-600 hover:scale-110 transition-all z-20"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept === 'both' ? 'image/*,video/*' : accept === 'image' ? 'image/*' : 'video/*'}
          className="hidden"
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  folder: string;
  initialUrl?: string;
  label?: string;
}

export default function ImageUpload({ onUploadComplete, folder, initialUrl, label }: ImageUploadProps) {
  const storage = useStorage();
  const { t, lang } = useTranslation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with initialUrl if it changes from parent (e.g. when switching products)
  useEffect(() => {
    if (initialUrl !== undefined) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    // limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        variant: 'destructive', 
        title: t.errorOccurred, 
        description: lang === 'ar' ? 'حجم الملف كبير جداً (الأقصى 5 ميجابايت)' : 'File size too large (max 5MB)' 
      });
      return;
    }

    setUploading(true);
    // Create a unique filename
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${filename}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setPreview(url);
      onUploadComplete(url);
      toast({ 
        title: lang === 'ar' ? 'تم الرفع' : 'Success', 
        description: lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully' 
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ 
        variant: 'destructive', 
        title: t.errorOccurred, 
        description: lang === 'ar' ? 'فشل رفع الصورة، يرجى المحاولة لاحقاً' : 'Failed to upload image' 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 text-start">
      <label className="text-lg font-bold block text-primary/80">{label || t.imageLabel}</label>
      
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] border-2 border-primary/10 bg-muted/5 hover:bg-muted/10 transition-all">
        <div className="h-32 w-32 rounded-3xl overflow-hidden bg-white border-2 border-primary/5 flex-shrink-0 flex items-center justify-center relative shadow-inner">
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <button 
                type="button"
                onClick={() => {
                  setPreview('');
                  onUploadComplete('');
                }}
                className="absolute top-2 right-2 h-7 w-7 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <ImageIcon className="h-10 w-10 text-primary/20" />
          )}
        </div>

        <div className="flex-1 w-full space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !storage}
              className="rounded-full border-2 border-[#D4AF37] bg-white text-primary hover:bg-[#D4AF37]/5 h-12 px-8 font-bold flex gap-2 items-center transition-all shadow-md group"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
              ) : (
                <Upload className="h-5 w-5 text-[#D4AF37] group-hover:-translate-y-1 transition-transform" />
              )}
              <span>{lang === 'ar' ? 'ارفع صورة' : 'Upload Image'}</span>
            </Button>
            
            {preview && (
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                {lang === 'ar' ? 'الصورة جاهزة' : 'Image Ready'}
              </p>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground font-medium">
            {lang === 'ar' 
              ? 'صيغ مدعومة: JPG, PNG, WEBP. الحد الأقصى 5 ميجابايت.' 
              : 'Formats: JPG, PNG, WEBP. Max 5MB.'}
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/src/lib/supabase/client";
import { validateImageFile } from "@/src/lib/utils";

interface PhotoUploadProps {
  userId: string;
  existingPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({
  userId,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 5,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    if (!validateImageFile(file)) {
      toast.error("Lỗi", {
        description: "File phải là ảnh (JPG, PNG, WEBP) và có kích thước dưới 5MB",
      });
      return;
    }

    if (photos.length >= maxPhotos) {
      toast.error("Lỗi", {
        description: `Bạn chỉ được tải lên tối đa ${maxPhotos} ảnh`,
      });
      return;
    }

    try {
      setUploading(true);

      // Upload file lên Supabase Storage
      const filePath = `users/${userId}/photos/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("user_photos")
        .upload(filePath, file);

      if (error) throw error;

      // Lấy URL công khai của file
      const { data: publicUrlData } = supabase.storage
        .from("user_photos")
        .getPublicUrl(filePath);

      const newPhotos = [...photos, publicUrlData.publicUrl];
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);

      toast.success("Tải lên thành công", {
        description: "Ảnh của bạn đã được tải lên",
      });
    } catch (error: unknown) {
      console.error("Lỗi khi tải lên ảnh:", error);
      toast.error("Lỗi", {
        description: "Không thể tải lên ảnh. Vui lòng thử lại sau.",
      });
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input file
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    try {
      // Xóa file khỏi Supabase Storage
      const pathRegex = /\/user_photos\/(.+)/;
      const match = photoUrl.match(pathRegex);
      
      if (match && match[1]) {
        const filePath = match[1];
        await supabase.storage.from("user_photos").remove([filePath]);
      }

      // Cập nhật state
      const newPhotos = photos.filter((p) => p !== photoUrl);
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);

      toast.success("Xóa ảnh thành công");
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      toast.error("Lỗi", {
        description: "Không thể xóa ảnh. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-md overflow-hidden bg-muted"
          >
            <Image
              src={photo}
              alt={`Ảnh ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white"
              onClick={() => handleRemovePhoto(photo)}
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <div className="aspect-square rounded-md overflow-hidden border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
            <label htmlFor="photo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                  <span className="text-xs text-center text-muted-foreground">
                    Tải lên ảnh
                  </span>
                </>
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Tối đa {maxPhotos} ảnh (JPG, PNG, WEBP), mỗi ảnh tối đa 5MB.
      </div>
    </div>
  );
} 
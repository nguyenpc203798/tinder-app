// Profile service following Single Responsibility and Dependency Inversion Principles
import { createClientForServer } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/serverService";
import type {
  UserProfile,
  ProfileFormData,
  ProfileUpdateRequest,
  PhotoUploadResult,
} from "@/types/profile";
import {
  ProfileValidator,
  formatProfileData,
} from "@/untils/profileValidation";

export interface IProfileService {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(
    userId: string,
    data: ProfileFormData
  ): Promise<{ success: boolean; error?: string }>;
  uploadPhotos(userId: string, files: FileList): Promise<PhotoUploadResult>;
  deletePhoto(
    userId: string,
    photoUrl: string
  ): Promise<{ success: boolean; error?: string }>;
}

export class ProfileService implements IProfileService {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await createClientForServer();
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      console.error("Error in getProfile:", error);
      return null;
    }
  }

  async updateProfile(
    userId: string,
    data: ProfileFormData
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClientForServer();
    try {
      // Validate data
      const validation = ProfileValidator.validateProfile(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: Object.values(validation.errors).join(", "),
        };
      }

      // Format data
      const formattedData = formatProfileData(data);

      // Prepare update request
      const updateRequest: ProfileUpdateRequest = {
        id: userId,
        ...formattedData,
        is_verified: true,
      };

      const { error } = await supabase
        .from("user_profile")
        .upsert(updateRequest);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async uploadPhotos(
    userId: string,
    files: FileList
  ): Promise<PhotoUploadResult> {
    const supabase = createServiceClient();
    try {
      // Validate photos
      const validation = ProfileValidator.validatePhotos(files);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", "),
        };
      }

      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("user-photos")
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading photo:", error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("user-photos")
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length === 0) {
        return {
          success: false,
          error: "No photos were uploaded successfully",
        };
      }

      // Update profile with new photos
      const { data: currentProfile } = await supabase
        .from("user_profile")
        .select("photos")
        .eq("id", userId)
        .single();

      const existingPhotos = currentProfile?.photos || [];
      const updatedPhotos = [...existingPhotos, ...uploadedUrls];

      await supabase
        .from("user_profile")
        .update({ photos: updatedPhotos })
        .eq("id", userId);

      return {
        success: true,
        urls: uploadedUrls,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async deletePhoto(
    userId: string,
    photoUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createServiceClient();
    try {
      // Get current photos
      const { data: currentProfile } = await supabase
        .from("user_profile")
        .select("photos")
        .eq("id", userId)
        .single();

      if (!currentProfile) {
        return { success: false, error: "Profile not found" };
      }

      const updatedPhotos = currentProfile.photos.filter(
        (url: string) => url !== photoUrl
      );

      console.log("updatedPhotos", updatedPhotos);

      // Update profile
      const { error } = await supabase
        .from("user_profile")
        .update({ photos: updatedPhotos })
        .eq("id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Delete from storage (extract path from publicUrl)
      // publicUrl: https://xxxx.supabase.co/storage/v1/object/public/user-photos/userid/123456789.jpg
      // filePath cần: userid/123456789.jpg
      const marker = "/object/public/user-photos/";
      const idx = photoUrl.indexOf(marker);
      if (idx === -1) {
        return { success: false, error: "Invalid photo URL format" };
      }
      const filePath = photoUrl.substring(idx + marker.length);
      console.log("filePath", filePath);
      console.log("Chuẩn bị xóa file:", filePath);
      const { data, error: removeError } = await supabase.storage
        .from("user-photos")
        .remove([filePath]);
      console.log("Kết quả xóa:", data, removeError);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Singleton instance
export const profileService = new ProfileService();

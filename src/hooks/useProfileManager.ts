// Custom hook for profile management following Single Responsibility Principle
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, ProfileFormData } from '@/types/profile';

interface UseProfileManagerReturn {
  profile: UserProfile | null;
  loadingNormal: boolean;
  loadingButton: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<boolean>;
  uploadPhotos: (files: FileList) => Promise<boolean>;
  deletePhoto: (photoUrl: string) => Promise<boolean>;
  setProfile: (profile: UserProfile | null) => void;
}

export const useProfileManager = (): UseProfileManagerReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingNormal, setLoadingNormal] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    setLoadingNormal(true);
    setError(null);
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      setProfile(data.profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingNormal(false);
    }
  }, [toast]);

  const updateProfile = useCallback(async (data: ProfileFormData): Promise<boolean> => {
    setLoadingButton(true);
    setError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoadingButton(false);
    }
  }, [toast]);

  const uploadPhotos = useCallback(async (files: FileList): Promise<boolean> => {
    setLoadingNormal(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/profile/photos', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload photos');
      }

      // Update local profile state with new photos
      setProfile(prev => {
        if (!prev) return null;
        const prevPhotos = Array.isArray(prev.photos) ? prev.photos : [];
        return {
          ...prev,
          photos: [...prevPhotos, ...(result.urls || [])]
        };
      });

      toast({
        title: 'Success',
        description: `${result.urls?.length || 0} photo(s) uploaded successfully`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoadingNormal(false);
    }
  }, [toast]);

  const deletePhoto = useCallback(async (photoUrl: string): Promise<boolean> => {
    setLoadingNormal(true);
    setError(null);

    try {
      const response = await fetch(`/api/profile/photos?url=${encodeURIComponent(photoUrl)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete photo');
      }

      // Update local profile state
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          photos: prev.photos.filter(url => url !== photoUrl)
        };
      });

      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoadingNormal(false);
    }
  }, [toast]);

  return {
    profile,
    loadingNormal,
    loadingButton,
    error,
    fetchProfile,
    updateProfile,
    uploadPhotos,
    deletePhoto,
    setProfile,
  };
};

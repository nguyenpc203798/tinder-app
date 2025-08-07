//src/app/(dashboard)/profile/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileEditModal } from "@/components/pages/profile/ProfileEditModal";
import {
  Edit3,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Ruler,
  Dumbbell,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useProfileManager } from "@/hooks/useProfileManager";
import type { ProfileFormData } from "@/types/profile";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const ProfilePage = () => {
  const {
    profile,
    loadingNormal,
    loadingButton,
    error,
    fetchProfile,
    updateProfile,
    uploadPhotos,
    deletePhoto,
  } = useProfileManager();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Thêm state cho xác nhận xóa ảnh
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  // Load profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (formData: ProfileFormData) => {
    if (!formData) return false;
    const success = await updateProfile(formData);
    if (success) {
      setShowEditModal(false);
    }
    return success;
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadPhotos(files);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    setPhotoToDelete(photoUrl);
  };

  // Show loading state while profile is being fetched
  if (loadingNormal) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error state if profile failed to load
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load profile</p>
          <Button onClick={fetchProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Profile
          </h1>
          <Button
            onClick={() => setShowEditModal(true)}
            className="bg-gradient-primary hover:opacity-90"
            disabled={loadingButton}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Photos Grid */}
        <Card className="mb-6 border-border/50 shadow-elegant">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Photos</h2>
            <div className="grid grid-cols-3 gap-4">
              {profile.photos?.map((photo: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-muted relative group"
                >
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-primary/90">
                      Main
                    </Badge>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeletePhoto(photo)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )) || []}

              {/* Add Photo Placeholder */}
              {(profile.photos?.length || 0) < 6 && (
                <>
                  <div
                    className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={handleAddPhotoClick}
                  >
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Add Photo</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AlertDialog xác nhận xóa ảnh */}
        <AlertDialog open={!!photoToDelete} onOpenChange={open => { if (!open) setPhotoToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc muốn xóa ảnh này?</AlertDialogTitle>
              <AlertDialogDescription>
                Ảnh sẽ bị xóa vĩnh viễn khỏi hồ sơ và không thể khôi phục.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (photoToDelete) {
                    await deletePhoto(photoToDelete);
                    setPhotoToDelete(null);
                  }
                }}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Basic Info */}
        <Card className="mb-6 border-border/50 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-primary">
                {profile.name}, {profile.age}
              </h2>
              {profile.is_verified && (
                <Badge className="bg-green-500 text-white ml-2">Verified</Badge>
              )}
            </div>

            <p className="text-foreground/80 mb-4">{profile.bio}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground/70">
                <Briefcase className="w-4 h-4" />
                <span>{profile.job_title}</span>
              </div>

              <div className="flex items-center gap-2 text-foreground/70">
                <GraduationCap className="w-4 h-4" />
                <span>{profile.education}</span>
              </div>

              <div className="flex items-center gap-2 text-foreground/70">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Ruler className="w-4 h-4" />
                <span>{profile.height_cm} cm</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Dumbbell className="w-4 h-4" />
                <span>{profile.weight_kg} kg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="mb-6 border-border/50 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-primary">Interests</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-subtle border border-border/30"
                >
                  {interest}
                </Badge>
              )) || []}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="border-border/50 shadow-elegant">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Age Range</span>
                <span className="text-muted-foreground">
                  {profile.age_range?.[0]} - {profile.age_range?.[1]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span className="text-muted-foreground">
                  {profile.distance} miles
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Show me</span>
                <span className="text-muted-foreground">Everyone</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          loading={loadingButton}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;

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
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import type { UserProfile } from "@/types/user";

const ProfilePage = () => {
  const { profile, setProfile, fetchProfile } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Khi load trang, lấy dữ liệu profile thật từ Supabase
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    const supabase = createClient();
    // Lấy user id hiện tại
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      toast({
        title: "Update profile failed",
        description: "Cannot identify user!",
      });
      return;
    }
    const upsertData = {
      id: userId,
      ...updatedProfile,
      is_verified: true,
    };
    console.log("upsertData", upsertData);

    const { error } = await supabase
      .from("user_profile")
      .upsert(upsertData);
    if (error) {
      toast({
        title: "Update profile failed",
        description: error.message,
      });
      console.log("error", error.message);
    } else {
      toast({
        title: "Update profile successfully",
      });
      setProfile((prev: UserProfile) => ({ ...prev, ...updatedProfile }));
      setShowEditModal(false);
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      toast({ title: "Không xác định được user!" });
      return;
    }

    const newPhotoUrls: string[] = [];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Chỉ cho phép ảnh jpg, jpeg, png, webp" });
        continue;
      }
      if (file.size > maxSize) {
        toast({ title: `Ảnh ${file.name} vượt quá 5MB!` });
        continue;
      }
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("user-photos")
        .upload(filePath, file);
      if (uploadError) {
        console.log("uploadError", uploadError);
        toast({ title: `Upload ảnh ${file.name} thất bại`, description: uploadError.message });
        continue;
      }
      const { data: urlData } = supabase.storage
        .from("user-photos")
        .getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        newPhotoUrls.push(urlData.publicUrl);
      }
    }

    if (newPhotoUrls.length > 0) {
      const newPhotos = [...profile.photos, ...newPhotoUrls].slice(0, 6);
      await handleSaveProfile({ photos: newPhotos });
    }
  };

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
              {profile.photos.map((photo: string, index: number) => (
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
                </div>
              ))}

              {/* Add Photo Placeholder */}
              {profile.photos.length < 6 && (
                <>
                  <div
                    className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={handleAddPhotoClick}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                        +
                      </div>
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
              {profile.interests.map((interest: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-subtle border border-border/30"
                >
                  {interest}
                </Badge>
              ))}
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
                  {profile.age_range[0]} - {profile.age_range[1]}
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
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        setProfile={setProfile}
        fetchProfile={fetchProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;

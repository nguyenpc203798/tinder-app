//src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/user";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    gender: "",
    age: 0,
    bio: "",
    job_title: "",
    education: "",
    location: "",
    photos: [],
    interests: [],
    age_range: [18, 30],
    distance: 0,
    is_verified: false,
    height_cm: 0,
    weight_kg: 0,
  });

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from("user_profile")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile((prev) => ({ ...prev, ...data }));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, setProfile, fetchProfile };
} 
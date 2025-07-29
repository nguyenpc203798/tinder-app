import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import ProfileForm from "@/src/components/pages/profile/ProfileForm";
import { UserProfile } from "@/src/types";
import { Toaster } from "sonner";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Kiểm tra authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  
  const userId = data.claims.sub;
  
  // Lấy thông tin profile người dùng
  const { data: profile } = await supabase
    .from("user_profile")
    .select("*")
    .eq("id", userId)
    .single();
  
  return (
    <>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>
        <p className="text-muted-foreground mb-8">
          Cập nhật thông tin cá nhân của bạn để tìm kiếm đối tượng phù hợp.
        </p>
        
        <ProfileForm 
          initialData={profile as Partial<UserProfile>} 
          userId={userId}
        />
      </div>
      <Toaster />
    </>
  );
} 
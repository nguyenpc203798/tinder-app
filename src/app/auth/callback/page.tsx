"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Xử lý callback từ OAuth provider
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          router.push("/?error=" + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          console.log("Auth callback successful, redirecting to home");
          // Đăng nhập thành công, chuyển hướng về home
          router.push("/home");
        } else {
          console.log("No session found, redirecting to login");
          router.push("/");
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-medium">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

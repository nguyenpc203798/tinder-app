// import Link from "next/link";
"use client";
import TinderButton from "@/components/ui/tinderbutton";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@supabase/supabase-js";
import TinderLogo from "@/components/layout/TinderLogo";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient()
  const handleLoginWithGoogle = async () => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/home`;
    console.log("Redirecting to:", redirectTo); // 👈 Log ra đường dẫn
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google" as Provider,
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) {
      alert("Đăng nhập thất bại: " + error.message);
      setLoading(false);
    }
    // Nếu thành công, Supabase sẽ tự redirect
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 flex flex-col justify-center items-center px-6 py-16 text-white font-sans">
      <>
        {/* Tinder Logo */}
        <TinderLogo></TinderLogo>
        {/* Text info */}
        <p className="mb-10 max-w-md text-center text-base font-medium leading-relaxed">
          Khi nhấn Đăng nhập, bạn đồng ý với{" "}
          <a href="#" className="underline font-semibold">
            Điều khoản
          </a>{" "}
          của chúng tôi. Tìm hiểu về cách chúng tôi xử lý dữ liệu của bạn trong{" "}
          <a href="#" className="underline font-semibold">
            Chính sách Quyền riêng tư
          </a>{" "}
          và{" "}
          <a href="#" className="underline font-semibold">
            Chính sách Cookie
          </a>
          .
        </p>
        {/* Buttons */}
        <div className="w-full max-w-md space-y-5">
          <TinderButton
            variant="google"
            onClick={handleLoginWithGoogle}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Tiếp tục với Google"}
          </TinderButton>
          <TinderButton variant="facebook" href="/">
            Tiếp tục với Facebook
          </TinderButton>
          <TinderButton variant="signup" href="/auth/sign-up">
            ĐĂNG KÝ
          </TinderButton>
        </div>
        {/* Problem text */}
        <p className="mt-12 font-bold text-lg cursor-pointer select-none hover:underline">
          Bạn gặp sự cố khi đăng nhập?
        </p>
      </>
    </main>
  );
}

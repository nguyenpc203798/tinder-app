// import Link from "next/link";
"use client";
import TinderButton from "@/components/ui/tinderbutton";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@supabase/supabase-js";
import TinderLogo from "@/components/layout/TinderLogo";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const handleLoginWithGoogle = async () => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log("Redirecting to auth callback:", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google" as Provider,
      options: {
        redirectTo,
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
          By clicking Log in, you agree to our{" "}
          <a href="#" className="underline font-semibold">
            Terms
          </a>
          . Learn how we process your data in our{" "}
          <a href="#" className="underline font-semibold">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="underline font-semibold">
            Cookie Policy
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
            {loading ? "Logging in..." : "Continue with Google"}
          </TinderButton>
          <TinderButton variant="facebook" href="/">
            Continue with Facebook
          </TinderButton>
          <div className="flex items-center justify-center">
            <TinderButton className="mr-2" variant="base" href="/auth/sign-up">
              Sign up
            </TinderButton>
            <TinderButton variant="base" href="/auth/login">
              Login
            </TinderButton>
          </div>
        </div>
        {/* Problem text */}
        <p className="mt-12 font-bold text-lg cursor-pointer select-none hover:underline">
          Have an issue when logging in?
        </p>
      </>
    </main>
  );
}

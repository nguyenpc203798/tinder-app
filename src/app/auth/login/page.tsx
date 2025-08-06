import { LoginForm } from "@/components/login-form";
import TinderLogo from "@/components/layout/TinderLogo";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 flex flex-col justify-center items-center px-6 py-16 text-white font-sans">
    {/* Tinder Logo */}
    <TinderLogo></TinderLogo>
    {/* Text info */}
    <p className="mb-10 max-w-md text-center text-base font-medium leading-relaxed">
      By clicking Log In, you agree to our{" "}
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
    <LoginForm className="w-full max-w-md" />
  </div>
  );
}

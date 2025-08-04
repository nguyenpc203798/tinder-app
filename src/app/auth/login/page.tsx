import { LoginForm } from "@/src/components/login-form";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 flex flex-col justify-center items-center px-6 py-16 text-white font-sans">
    {/* Tinder Logo */}
    <Link href="/">
      <div className="mb-12 flex justify-center items-center w-full max-w-xs">
        <Image
          src="/images/tinderlogo.png"
          alt="Logo"
          width={50}
          height={50}
        />
        <h1 className="ml-4 text-4xl font-extrabold tracking-tight">
          tinder
        </h1>
      </div>
    </Link>
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

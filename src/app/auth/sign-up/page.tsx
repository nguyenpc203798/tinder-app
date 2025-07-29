import { SignUpForm } from "@/src/components/sign-up-form";
import Image from "next/image";
import Link from "next/link";

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
        Khi nhấn Đăng ký, bạn đồng ý với{" "}
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
      <SignUpForm className="w-full max-w-md" />
    </div>
  );
}

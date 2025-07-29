// import Link from "next/link";
import Image from "next/image";
import TinderButton from "@/src/components/ui/tinderbutton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 flex flex-col justify-center items-center px-6 py-16 text-white font-sans">
      <>
        {/* Tinder Logo */}
        <div className="mb-12 flex justify-center items-center w-full max-w-xs">
          <Image src="/images/tinderlogo.png" alt="Logo" width={50} height={50} />
          <h1 className="ml-4 text-4xl font-extrabold tracking-tight">
            tinder
          </h1>
        </div>
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
          <TinderButton variant="google" href="/">
            Tiếp tục với Google
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

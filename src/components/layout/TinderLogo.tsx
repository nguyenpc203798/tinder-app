import Link from "next/link";
import Image from "next/image";

export default function TinderLogo() {
  return (
    <Link href={"/"}>
      <div className="mb-12 flex justify-center items-center w-full max-w-xs">
        <Image src="/images/tinderlogotrang.png" alt="Logo" width={50} height={50} />
        <h1 className="ml-4 text-4xl font-extrabold tracking-tight">Tinder</h1>
      </div>
    </Link>
  );
}

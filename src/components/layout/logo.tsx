import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href={"/"}>
        <Image src="/images/logo.png" alt="Dating App Logo" width={100} height={100} priority/>
    </Link>
  );
}
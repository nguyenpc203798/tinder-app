import Link from "next/link";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { cn } from "@/src/lib/utils";

interface TinderButtonProps {
  variant: "google" | "facebook" | "color" | "signup";
  href: string;
  children: React.ReactNode;
}

const TinderButton: React.FC<TinderButtonProps> = ({ variant, href, children }) => {
  const baseClasses = "flex items-center justify-center gap-4 font-semibold rounded-full py-3 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-500 w-full";
  const variantClasses = {
    color: "bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 text-background",
    google: "bg-white text-gray-900",
    facebook: "bg-white text-gray-900",
    signup: "bg-foreground text-white hover:text-foreground hover:bg-background",
  };
  const icon = {
    google: <FaGoogle className="h-full w-full" />,
    facebook: <FaFacebook className="h-full w-full" />,
    color: null,
    signup: null,
  };

  return (
    <Link href={href} className={cn(baseClasses, variantClasses[variant])}>
      {icon[variant] && <div className="w-7 h-7">{icon[variant]}</div>}
      {children}
    </Link>
  );
};

export default TinderButton;

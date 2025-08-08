import Link from "next/link";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface TinderButtonProps {
  variant: "base" | "google" | "facebook" | "color";
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const TinderButton: React.FC<TinderButtonProps> = ({ variant, href, children, onClick, disabled, className }) => {
  const baseClasses = "flex items-center justify-center gap-4 font-semibold rounded-full py-3 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-500 w-full";
  const variantClasses = {
    base: "bg-foreground text-white hover:text-foreground hover:bg-background",
    color: "bg-gradient-to-br from-pink-600 via-pink-500 to-orange-500 text-background",
    google: "bg-white text-gray-900",
    facebook: "bg-white text-gray-900",
  };
  const icon = {
    base: null,
    google: <FaGoogle className="h-full w-full" />,
    facebook: <FaFacebook className="h-full w-full" />,
    color: null,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          disabled ? "opacity-60 cursor-not-allowed" : "",
          className
        )}
      >
        {icon[variant] && <div className="w-7 h-7">{icon[variant]}</div>}
        {children}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className={cn(baseClasses, variantClasses[variant], className)}>
      {icon[variant] && <div className="w-7 h-7">{icon[variant]}</div>}
      {children}
    </Link>
  );
};

export default TinderButton;

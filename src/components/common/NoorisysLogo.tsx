import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  showTagline?: boolean;
  variant?: "header" | "footer" | "standalone";
}

export const NoorisysLogo: React.FC<LogoProps> = ({
  className = "",
  imageClassName = "",
  variant = "header",
}) => {
  const isFooter = variant === "footer";
  const isStandalone = variant === "standalone";

  return (
    <Link
      href="/#hero"
      className={`group inline-flex items-center transition-all duration-200 hover:opacity-95 ${className}`}
      aria-label="Noorisys Technologies Homepage"
    >
      {/* Official Noorisys Healthcare Brandmark */}
      <div className="relative flex items-center group-hover:scale-[1.02] transition-transform duration-200">
        <img
          src="/logos/noorisys-logo.png"
          alt="Noorisys Technologies"
          className={`${
            imageClassName
              ? imageClassName
              : isFooter
              ? "h-12 sm:h-14 md:h-16 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[380px]"
              : isStandalone
              ? "h-11 sm:h-13 md:h-15 w-auto max-w-[260px] sm:max-w-[300px] md:max-w-[340px]"
              : "h-11 sm:h-13 md:h-15 lg:h-16 w-auto max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[380px]"
          } object-contain`}
        />
      </div>
    </Link>
  );
};

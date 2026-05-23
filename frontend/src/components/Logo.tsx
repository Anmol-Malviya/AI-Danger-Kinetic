import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <img 
      src="/ChatGPT Image May 23, 2026, 11_50_56 AM.png" 
      alt="AI Danger Kinetic Logo"
      className={`${className} object-contain`}
      style={{ width: size, height: size }}
    />
  );
};


import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "info" | "citrus" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "success",
  size = "sm",
  className = "",
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";
  
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const variantStyles = {
    success: "bg-[#d8f3dc] text-[#1b4332] border border-[#b7e4c7]",
    warning: "bg-amber-100 text-amber-900 border border-amber-200",
    info: "bg-blue-100 text-blue-900 border border-blue-200",
    citrus: "bg-orange-100 text-orange-900 border border-orange-200",
    neutral: "bg-stone-100 text-stone-800 border border-stone-200",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};


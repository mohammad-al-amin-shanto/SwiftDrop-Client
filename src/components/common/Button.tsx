import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}) => {
  const base =
    "rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition";
  const variants: Record<string, string> = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-300",
    outline:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-200",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-50",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizeMap[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;

import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "solid";
};

export const IconButton: React.FC<Props> = ({
  children,
  className,
  size = "md",
  variant = "ghost",
  ...rest
}) => {
  const sizeCls =
    size === "sm"
      ? "p-1 text-sm"
      : size === "lg"
      ? "p-3 text-lg"
      : "p-2 text-base";
  const variantCls =
    variant === "solid"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "outline"
      ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
      : "bg-transparent hover:bg-slate-100";

  return (
    <button
      className={clsx(
        "rounded inline-flex items-center justify-center",
        sizeCls,
        variantCls,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default IconButton;

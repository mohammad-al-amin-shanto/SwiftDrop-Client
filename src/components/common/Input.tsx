import React from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string | boolean;
  label?: string;
  containerClassName?: string;
};

export const Input: React.FC<Props> = ({
  label,
  error,
  containerClassName,
  className,
  ...rest
}) => {
  return (
    <label className={clsx("block", containerClassName)}>
      {label && <div className="text-sm mb-1">{label}</div>}
      <input
        className={clsx(
          "w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2",
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-slate-200 focus:ring-sky-200",
          className
        )}
        {...rest}
      />
      {error && typeof error === "string" && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </label>
  );
};

export default Input;

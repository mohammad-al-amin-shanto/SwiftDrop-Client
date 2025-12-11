import React from "react";
import clsx from "clsx";

type Props = {
  name?: string;
  src?: string | null;
  size?: number;
  className?: string;
};

export const Avatar: React.FC<Props> = ({
  name,
  src,
  size = 36,
  className,
}) => {
  const initials = name
    ? name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return src ? (
    <img
      src={src}
      alt={name || "avatar"}
      className={clsx("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={clsx(
        "rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-100",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials}
    </div>
  );
};

export default Avatar;

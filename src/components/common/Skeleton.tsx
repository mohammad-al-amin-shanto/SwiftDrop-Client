import React from "react";
import clsx from "clsx";

type Props = {
  className?: string;
  rounded?: boolean;
};

export const Skeleton: React.FC<Props> = ({ className, rounded = true }) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gray-200 dark:bg-slate-700",
        rounded ? "rounded" : "",
        className
      )}
    />
  );
};

export default Skeleton;

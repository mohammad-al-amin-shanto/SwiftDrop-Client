import React from "react";
import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  width?: string;
};

export const Modal: React.FC<Props> = ({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={clsx(
          "relative z-10 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4",
          width
        )}
      >
        <div className="flex items-start justify-between">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

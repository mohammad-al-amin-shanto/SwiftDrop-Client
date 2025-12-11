import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Item = {
  label: React.ReactNode;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

type Props = {
  trigger: React.ReactNode;
  items: Item[];
  align?: "left" | "right";
  className?: string;
};

export const Dropdown: React.FC<Props> = ({
  trigger,
  items,
  align = "right",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className={clsx("relative inline-block", className)} ref={ref}>
      <div onClick={() => setOpen((s) => !s)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          className={clsx(
            "absolute mt-2 min-w-[200px] bg-white dark:bg-slate-800 border rounded shadow z-50 py-1",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((it, idx) => (
            <div
              key={idx}
              role="menuitem"
              onClick={() => {
                if (!it.disabled) {
                  it.onClick?.();
                  setOpen(false);
                }
              }}
              className={clsx(
                "px-3 py-2 cursor-pointer flex items-center gap-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700",
                it.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {it.icon && <span className="w-5 h-5">{it.icon}</span>}
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

import React from "react";
import clsx from "clsx";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
};

export const Toggle: React.FC<Props> = ({ checked, onChange, label }) => {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          "w-11 h-6 flex items-center rounded-full p-1 transition",
          checked ? "bg-sky-600" : "bg-gray-300"
        )}
      >
        <div
          className={clsx(
            "bg-white w-4 h-4 rounded-full shadow transform transition",
            checked ? "translate-x-5" : ""
          )}
        />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};

export default Toggle;

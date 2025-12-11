import React from "react";
import { NavLink } from "react-router-dom";

export const Footer: React.FC = () => {
  const activeClass = "text-sky-600 font-semibold";
  const baseLinkClass = "text-slate-600 dark:text-slate-300";

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-semibold">SwiftDrop</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Reliable parcel delivery — local &amp; nationwide.
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? activeClass : baseLinkClass
            }
          >
            About
          </NavLink>

          <NavLink
            to="/faq"
            className={({ isActive }) =>
              isActive ? activeClass : baseLinkClass
            }
          >
            FAQ
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? activeClass : baseLinkClass
            }
          >
            Contact
          </NavLink>
        </div>

        <div className="text-sm text-gray-500 dark:text-slate-400">
          © {new Date().getFullYear()} SwiftDrop. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

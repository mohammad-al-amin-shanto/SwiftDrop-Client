// src/components/layout/AppShell.tsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

type Props = {
  children?: React.ReactNode;
  hideChrome?: boolean;
};

export const AppShell: React.FC<Props> = ({ children, hideChrome = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* ⭐ Hide Navbar when hideChrome = true */}
      {!hideChrome && <Navbar onOpenSidebar={() => setSidebarOpen(true)} />}

      <div className="flex">
        {/* ⭐ Hide Sidebar for desktop */}
        {!hideChrome && (
          <div className="hidden md:block">
            <Sidebar open />
          </div>
        )}

        {/* ⭐ Mobile Sidebar Drawer */}
        {!hideChrome && sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="w-64 bg-white dark:bg-slate-900 p-4">
              <Sidebar open onClose={() => setSidebarOpen(false)} />
            </div>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

type Props = {
  children?: React.ReactNode;
  hideChrome?: boolean;
};

const AppShell: React.FC<Props> = ({ children, hideChrome = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    if (children !== undefined && children !== null) return <>{children}</>;
    return <Outlet />;
  };

  // hideChrome → no navbar, no sidebar, BUT footer still shown
  if (hideChrome) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
        <main className="flex-1 p-4">{renderContent()}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar open />
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="w-64 bg-white dark:bg-slate-900 p-4">
              <Sidebar open onClose={() => setSidebarOpen(false)} />
            </div>
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4">{renderContent()}</main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

// export both named + default
export { AppShell };
export default AppShell;

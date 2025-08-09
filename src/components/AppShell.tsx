"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const noNavRoutes = ["/login", "/signup"];
  const hideNav = noNavRoutes.includes(pathname);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (hideNav) {
    // No navbar/sidebar for login/signup
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar open={isSidebarOpen} onClose={closeSidebar} />
      <main className="pt-16">{children}</main>
    </>
  );
}

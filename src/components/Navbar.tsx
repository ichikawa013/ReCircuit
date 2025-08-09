"use client";

import { Menu, X, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ toggleSidebar, isSidebarOpen }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between bg-[#0f172a] px-4 py-3 shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded hover:bg-gray-800 transition"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Company Name */}
      <h1 className="text-2xl font-bold text-white tracking-wide mx-auto md:mx-0">
        <span className="text-amber-400">Re</span>
        Circuit
      </h1>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#1E293B] text-white p-1">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#1f2937] text-white border-none shadow-lg">
          <DropdownMenuItem className="hover:bg-gray-700">Profile</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-700">Settings</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-700">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

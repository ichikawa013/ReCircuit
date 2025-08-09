"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const baseLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/sell", label: "Sell Items" },
    { href: "/donate", label: "Donate Items" },
    { href: "/my-listings", label: "My Listings" },
    { href: "/transaction", label: "Transactions" },
  ];

  const roleLinks =
    user?.role === "individual" || user?.role === "organization"
      ? [
          baseLinks[0],
          baseLinks[1],
          { href: "/donate", label: "Donate Items" },
          ...baseLinks.slice(2),
        ]
      : baseLinks;

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out z-40 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 text-lg font-bold border-b border-gray-700 flex justify-between items-center">
        ReCircuit
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>
      <ul className="space-y-1 p-4">
        {roleLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded px-3 py-2 hover:bg-gray-800 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

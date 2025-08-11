"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { LayoutDashboard, List, Receipt, X, ChevronRight, Package, Heart } from "lucide-react"

export interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) return null

  const baseLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-listings", label: "My Listings", icon: List },
    { href: "/tasks", label: "Tasks", icon: Receipt },
  ]

  const roleLinks = baseLinks

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-md text-white transition-all duration-500 ease-out z-40 border-r border-slate-700/50 shadow-2xl ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">RC</span>
            </div>
            <h2 className="text-xl font-bold">
              <span className="text-amber-400">Re</span>Circuit
            </h2>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group">
            <X className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {roleLinks.map((link, index) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-lg"
                    : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                  }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={`relative ${isActive ? "text-amber-400" : "text-slate-400 group-hover:text-white"
                    } transition-colors duration-200`}
                >
                  <Icon className="h-5 w-5" />
                  {isActive && <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-pulse" />}
                </div>

                {/* Label */}
                <span className="font-medium flex-1">{link.label}</span>

                {/* Active indicator & hover arrow */}
                <div className="flex items-center">
                  {isActive && <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
                  <ChevronRight
                    className={`h-4 w-4 transition-all duration-200 ${isActive
                        ? "text-amber-400 translate-x-1"
                        : "text-transparent group-hover:text-slate-400 group-hover:translate-x-1"
                      }`}
                  />
                </div>

                {/* Hover underline effect */}
                <div
                  className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ${isActive ? "w-full opacity-100" : "w-0 group-hover:w-full opacity-0 group-hover:opacity-100"
                    }`}
                />
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions Section */}
<div className="px-4 pb-4">
  <div className="border-t border-slate-700/50 pt-4">
    <p className="text-xs uppercase tracking-wide text-slate-400 mb-3 px-2">Quick Actions</p>
    <div className="flex gap-2">
      {/* If role is NGO → only Raise Request */}
      {user?.role === "ngo" ? (
        <Link
          href="/raise-request"
          onClick={onClose}
          className="group flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-slate-800/30 hover:bg-pink-500/10 border border-slate-700/50 hover:border-pink-500/30 text-slate-400 hover:text-pink-400 transition-all duration-300 transform hover:scale-105"
        >
          <Heart className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Raise a Request</span>
        </Link>
      ) : (
        <>
          {/* Sell Button */}
          <Link
            href="/sell"
            onClick={onClose}
            className="group flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-slate-800/30 hover:bg-green-500/10 border border-slate-700/50 hover:border-green-500/30 text-slate-400 hover:text-green-400 transition-all duration-300 transform hover:scale-105"
          >
            <Package className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Sell</span>
          </Link>

          {/* Donate Button */}
          <Link
            href="/donate"
            onClick={onClose}
            className="group flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-slate-800/30 hover:bg-pink-500/10 border border-slate-700/50 hover:border-pink-500/30 text-slate-400 hover:text-pink-400 transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Donate</span>
          </Link>
        </>
      )}
    </div>
  </div>
</div>



        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-slate-400">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || "Member"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

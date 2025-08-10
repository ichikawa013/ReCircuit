"use client"

import { useState } from "react"
import { User, LogOut, Settings, UserCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"

export interface NavbarProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function Navbar({ toggleSidebar, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  // Check if we're on landing page or auth pages
  const isLandingPage = pathname === "/" || pathname === "/landing"
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  const showHamburger = !isLandingPage && !isAuthPage && user

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/landing")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleLogoClick = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/landing")
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Hamburger Menu - Only show when logged in and not on landing/auth pages */}
        {showHamburger && (
          <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <button
              onClick={toggleSidebar}
              className="group relative p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105"
              aria-label="Toggle Sidebar"
            >
              <div className="relative w-6 h-6">
                {/* Animated hamburger to X */}
                <span
                  className={`absolute top-1 left-0 w-6 h-0.5 bg-white transition-all duration-300 transform origin-center ${
                    isSidebarOpen ? "rotate-45 translate-y-2" : "rotate-0"
                  }`}
                />
                <span
                  className={`absolute top-3 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${
                    isSidebarOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute top-5 left-0 w-6 h-0.5 bg-white transition-all duration-300 transform origin-center ${
                    isSidebarOpen ? "-rotate-45 -translate-y-2" : "rotate-0"
                  }`}
                />
              </div>

              {/* Hover tooltip */}
              <div
                className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap transition-all duration-200 ${
                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                }`}
              >
                {isSidebarOpen ? "Close Menu" : "Open Menu"}
              </div>
            </button>
          </div>
        )}

        {/* Spacer for when hamburger is hidden */}
        {!showHamburger && <div className="w-10"></div>}

        {/* Company Logo - Positioned based on context */}
        <div className={`${isLandingPage || isAuthPage ? "ml-auto" : "absolute left-1/2 transform -translate-x-1/2"}`}>
          <h1 className="text-2xl font-bold text-white tracking-wide group cursor-pointer" onClick={handleLogoClick}>
            <span className="text-amber-400 drop-shadow-lg group-hover:text-amber-300 transition-colors duration-300">
              Re
            </span>
            <span className="group-hover:text-slate-200 transition-colors duration-300">Circuit</span>
            <div className="h-0.5 bg-gradient-to-r from-amber-400 to-transparent w-0 group-hover:w-full transition-all duration-500 mt-1" />
          </h1>
        </div>

        {/* Right side - Profile or Auth buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            /* Logged in user - Show profile dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group relative">
                  <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-amber-400/50 transition-all duration-300">
                    <AvatarFallback className="bg-slate-800 text-white group-hover:bg-slate-700 transition-colors duration-300">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-800/95 backdrop-blur-md border-slate-700 shadow-xl"
              >
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>

                <DropdownMenuItem className="text-slate-200 hover:bg-slate-700/50 focus:bg-slate-700/50 cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem className="text-slate-200 hover:bg-slate-700/50 focus:bg-slate-700/50 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-700" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Not logged in - Show login/signup buttons */
            <div className="flex items-center space-x-3">
              <Button
                asChild
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

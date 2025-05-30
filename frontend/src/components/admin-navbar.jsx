"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, LogOut, User, Menu, X, Bell } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminNavbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Define navigation items based on user role
  const employerNavItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Companies", href: "/admin/companies" },
    { label: "Post A Job", href: "/admin/jobs/new" },
    { label: "Jobs", href: "/admin/jobs", badge: true },
  ]

  const userNavItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Post A Job", href: "/post-job" },
    { label: "Jobs", href: "/jobs", badge: true },
  ]

  // Select the appropriate nav items based on user role
  const navItems = session?.user?.role === "employer" ? employerNavItems : userNavItems

  // Get user's initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={session?.user?.role === "employer" ? "/admin" : "/"} className="text-2xl font-bold">
            HireX
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative ${pathname === item.href ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                {item.label}
                {item.badge && <span className="absolute -right-3 -top-1 w-2 h-2 bg-red-500 rounded-full" />}
              </Link>
            ))}
          </div>

          {/* Right side - User menu, notifications, etc. */}
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full h-10 w-10">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-gray-100 rounded-full h-10 w-10 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || session.user.profile?.profilePhoto}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-gray-500">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="bg-white text-gray-800 px-6 py-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/signin"
                className="bg-white text-gray-800 px-6 py-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 text-base font-medium relative ${
                    pathname === item.href ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                  {item.badge && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              ))}
              {status === "authenticated" && (
                <>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-blue-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" })
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}


"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Function to prevent default navigation
  const handleLinkClick = (e) => {
    e.preventDefault()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-default">
            <span className="font-bold text-xl">
              Hire<span className="text-primary">X</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
              How It Works
            </span>
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
              For Job Seekers
            </span>
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
              For Employers
            </span>
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
              Success Stories
            </span>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href='/signin'>
            <Button variant="ghost">
              Sign In
            </Button>
            </Link>
            <Link href='/signup'>
            <Button className="cursor-default">
              Get Started
            </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-background border-b"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              <span
                className="text-muted-foreground hover:text-foreground transition-colors py-2 cursor-default"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-colors py-2 cursor-default"
                onClick={() => setIsMenuOpen(false)}
              >
                For Job Seekers
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-colors py-2 cursor-default"
                onClick={() => setIsMenuOpen(false)}
              >
                For Employers
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-colors py-2 cursor-default"
                onClick={() => setIsMenuOpen(false)}
              >
                Success Stories
              </span>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" className="w-full justify-center cursor-default" onClick={handleLinkClick}>
                  Sign In
                </Button>
                <Button className="w-full justify-center cursor-default" onClick={handleLinkClick}>
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  )
}


import Link from "next/link"
import { BrainCircuit, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-muted pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl">
                Hire<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Revolutionizing job search with AI-powered matching technology that connects talent with opportunity.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>contact@hirex.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>123 AI Street, San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  For Job Seekers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  For Employers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Upload Your CV
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Profile Analysis
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Job Recommendations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Career Resources
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Skill Development
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Interview Preparation
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Candidate Matching
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Talent Sourcing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Employer Branding
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Recruitment Solutions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t pt-8 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4">
              <Link
                href="#"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="bg-secondary p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>

            <div className="flex items-center">
              <Input type="email" placeholder="Enter your email" className="rounded-l-md rounded-r-none border-r-0" />
              <Button className="rounded-l-none">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-muted-foreground text-sm pt-6 border-t">
          <p>© {new Date().getFullYear()} HireX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


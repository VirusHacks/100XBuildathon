"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Github, Mail, Lock, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use useSession to check authentication status
  const { data: session, status } = useSession()

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.")
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Session data:", session)
      console.log("User role:", session.user.role)

      // Redirect based on role - directly handle the redirection here
      if (session.user.role === "employer") {
        console.log("Redirecting to admin")
        window.location.href = "/admin" // Force a full page navigation
      } else {
        console.log("Redirecting to dashboard")
        window.location.href = "/jobs" // Force a full page navigation
      }
    }
  }, [session, status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // First, try to authenticate with credentials
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      // If successful, manually check the database for the user's role
      try {
        const response = await fetch("/api/custom-signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Custom signin response:", data)

          // Redirect based on role from direct database check
          if (data.user?.role === "employer") {
            window.location.href = "/admin" // Force a full page navigation
          } else {
            window.location.href = "/dashboard" // Force a full page navigation
          }
        } else {
          // If custom check fails, wait for session-based redirect
          console.log("Custom signin check failed, waiting for session update")
        }
      } catch (error) {
        console.error("Custom signin error:", error)
        // Continue with session-based redirect if this fails
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-theme-2 animate-spin" />
          <div className="mt-4 text-theme-1 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-theme-1">
              Employ<span className="text-theme-2">.</span>
            </h1>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-theme-2 via-theme-3 to-theme-8"></div>
            <CardHeader className="space-y-1 pt-6">
              <CardTitle className="text-2xl font-bold text-center text-theme-1">Welcome back</CardTitle>
              <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="text-sm bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-xs text-theme-2 hover:text-theme-3 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                <Checkbox
  id="rememberMe"
  checked={rememberMe}
  onCheckedChange={setRememberMe}
  className="data-[state=checked]:bg-theme-2 data-[state=checked]:border-theme-2 
             data-[state=checked]:text-black"
 />

                  <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-theme-2 to-theme-3 hover:from-theme-3 hover:to-theme-2 text-white bg-gray-900 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLoading(true)
                    signIn("github")
                  }}
                  disabled={isLoading}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLoading(true)
                    signIn("google")
                  }}
                  disabled={isLoading}
                  className="bg-white border border-gray-300 hover:bg-gray-50"
                >
                  <Image
                    src="/placeholder.svg?height=16&width=16"
                    alt="Google"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-theme-2 hover:text-theme-3 font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-theme-3 opacity-20"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-theme-5 opacity-20"
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-theme-9 opacity-10"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
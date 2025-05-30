"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, User, Mail, Lock, Phone, Github, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "user",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Call our custom signup API endpoint
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setSuccess("Account created successfully! Redirecting to sign in...")

      // Redirect to signin page after successful signup
      setTimeout(() => {
        router.push("/signin")
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignup = (provider) => {
    setLoading(true)
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-theme-2 via-theme-3 to-theme-8"></div>
            <CardHeader className="space-y-1 pt-6">
              <CardTitle className="text-2xl font-bold text-center text-theme-1">Create your account</CardTitle>
              <CardDescription className="text-center">Join our community and find your dream job</CardDescription>
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
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="1234567890"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={loading}
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <RadioGroup
                    defaultValue="user"
                    value={formData.role}
                    onValueChange={handleRoleChange}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-100 transition-colors">
                      <RadioGroupItem value="user" id="user" />
                      <Label htmlFor="user" className="cursor-pointer">
                        Job Seeker
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-100 transition-colors">
                      <RadioGroupItem value="employer" id="employer" />
                      <Label htmlFor="employer" className="cursor-pointer">
                        Employer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="pl-10 focus-visible:ring-theme-2"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-theme-2 to-theme-3 hover:from-theme-3 hover:to-theme-2 text-white group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
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
                  onClick={() => handleSocialSignup("github")}
                  disabled={loading}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup("google")}
                  disabled={loading}
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
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/signin" className="text-theme-2 hover:text-theme-3 font-medium">
                  Sign in
                </Link>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-theme-2">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-theme-2">
                  Privacy Policy
                </Link>
                .
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-40 right-20 w-16 h-16 rounded-full bg-theme-9 opacity-20"
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
        className="absolute bottom-40 left-20 w-24 h-24 rounded-full bg-theme-8 opacity-20"
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
        className="absolute top-1/4 left-1/3 w-12 h-12 rounded-full bg-theme-5 opacity-10"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
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


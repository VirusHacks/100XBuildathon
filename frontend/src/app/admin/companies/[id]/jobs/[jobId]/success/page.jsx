"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { use } from "react"
import { CheckCircle, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function JobPostSuccess({ params }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params)
  const { id: companyId, jobId } = unwrappedParams

  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-none shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-theme-2 via-theme-3 to-theme-8"></div>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Job Posted Successfully!</CardTitle>
            <CardDescription>
              Your job listing has been published and is now visible to potential candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pb-8">
            <p className="text-gray-600">
              Share your job posting on social media or with your network to reach more qualified candidates.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/companies/${companyId}/jobs/${jobId}`)}
                className="group"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Job Post
              </Button>
              <Button
                onClick={() => router.push(`/admin/companies/${companyId}`)}
                className="bg-theme-2 hover:bg-theme-3 text-white group"
              >
                Back to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-4">
            <p className="text-sm text-gray-500 text-center w-full">
              Need to make changes? You can edit your job posting at any time from your dashboard.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}


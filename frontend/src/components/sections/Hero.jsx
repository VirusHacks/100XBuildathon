"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowDown, Sparkles, CheckCircle, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-muted rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="gap-1 px-4 py-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Job Matching</span>
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Find Your Perfect Job Match With AI
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our advanced AI analyzes your skills, experience, and preferences to find jobs that truly match your
              profile. Get personalized recommendations and increase your chances of landing your dream job.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" className="rounded-full px-8">
                Upload Your CV
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Explore Jobs
              </Button>
            </motion.div>

            <motion.div
              className="mt-12 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>93% match accuracy with our AI algorithm</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>5x faster job matching than traditional methods</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Personalized career insights and recommendations</span>
              </div>
            </motion.div>

            <motion.div
              className="mt-12 flex items-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <ArrowDown className="animate-bounce mr-2" />
              <span>Discover how it works</span>
            </motion.div>
          </div>

          {/* Right Content - Image and Floating Cards */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-[600px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lXYlZ4oLm5hkRJCcF9p9qnxHRLi2Vn.png"
                alt="Professional with AI job matching"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* AI Matching Score Card */}
            <motion.div
              className="absolute top-20 -left-10 bg-card p-4 rounded-xl shadow-md border"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                  <BrainCircuit className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">AI Match Score</p>
                    <Badge variant="secondary" className="text-xs">
                      98%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Senior Developer Position</p>
                </div>
              </div>
            </motion.div>

            {/* Job Recommendation Card */}
            <motion.div
              className="absolute bottom-40 -right-10 bg-card p-4 rounded-xl shadow-md border max-w-xs"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="bg-secondary p-2 rounded-lg mt-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Perfect Match Found!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your skills and experience match this Senior UX Designer position at Google.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      UX Design
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Remote
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills Match Card */}
            <motion.div
              className="absolute top-1/2 right-0 bg-card p-3 rounded-xl shadow-md border"
              animate={{
                x: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 2,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-secondary p-1.5 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Skills Match</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      React
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Node.js
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      +3
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


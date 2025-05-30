"use client"

import { motion } from "framer-motion"
import { CheckCircle, Star, Award, Cpu, BarChart3 } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SmartProfile() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Interactive Profile */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full h-[600px] mx-auto">
              {/* Background Circle */}
              <div className="absolute inset-0 bg-muted/50 rounded-full" />

              {/* AI Analysis Card */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-8 rounded-xl shadow-md border w-[400px]"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-6 mb-6">
                  {/* AI Icon */}
                  <div className="bg-primary p-3 rounded-xl">
                    <Cpu className="h-6 w-6 text-primary-foreground" />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/placeholder.svg?height=48&width=48"
                          alt="Sarah Johnson"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-[15px]">Sarah Johnson</h3>
                          <p className="text-sm text-muted-foreground">Senior UX Designer</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Profile Strength: 92%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="mb-6 space-y-3">
                  <h4 className="text-sm font-medium mb-2">AI Skills Analysis</h4>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">UX Design</span>
                      <span className="text-xs font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">UI Prototyping</span>
                      <span className="text-xs font-medium">88%</span>
                    </div>
                    <Progress value={88} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">User Research</span>
                      <span className="text-xs font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-1.5" />
                  </div>
                </div>

                {/* Match Insights */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">AI Match Insights</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your profile is highly matched with 28 UX Designer positions at top tech companies.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Match Score Card */}
              <motion.div
                className="absolute top-20 right-20 bg-card p-4 rounded-xl shadow-md border"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        strokeDasharray={`${94 * 2.83} ${100 * 2.83}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">94%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Match Score</p>
                    <p className="text-xs text-muted-foreground">Google UX Lead</p>
                  </div>
                </div>
              </motion.div>

              {/* Skills Badge */}
              <motion.div
                className="absolute bottom-32 left-20 bg-card p-3 rounded-xl shadow-md border"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Top 5% in UX Skills</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Figma
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Sketch
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-lg"
          >
            <Badge variant="outline" className="mb-6 gap-1 px-4 py-1.5">
              <Star className="h-3.5 w-3.5" />
              <span>AI-Enhanced Profile</span>
            </Badge>

            <h2 className="text-4xl font-bold leading-tight mb-6">Your CV, supercharged by artificial intelligence</h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Our AI doesn't just read your CV—it understands it. By analyzing your skills, experience, and
              achievements, we create a smart profile that highlights your strengths and matches you with the perfect
              opportunities.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="bg-secondary p-2 rounded-lg h-min mt-1">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Skills Analysis</h3>
                  <p className="text-muted-foreground">
                    Our AI identifies and categorizes your skills, matching them with in-demand requirements.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-secondary p-2 rounded-lg h-min mt-1">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Experience Evaluation</h3>
                  <p className="text-muted-foreground">
                    We analyze your work history to highlight relevant experience for each job opportunity.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-secondary p-2 rounded-lg h-min mt-1">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Personalized Insights</h3>
                  <p className="text-muted-foreground">
                    Get AI-powered recommendations to improve your profile and increase match rates.
                  </p>
                </div>
              </div>
            </div>

            <Button className="rounded-full px-8">Create Your AI Profile</Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


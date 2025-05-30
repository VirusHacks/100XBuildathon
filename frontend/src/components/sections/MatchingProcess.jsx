"use client"

import { motion } from "framer-motion"
import { FileUp, Cpu, CheckCircle, BriefcaseIcon, MessageSquare } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function MatchingProcess() {
  const steps = [
    {
      icon: <FileUp className="h-6 w-6" />,
      title: "Upload Your CV",
      description: "Upload your resume or CV to our platform in any format.",
      color: "bg-primary",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "AI Analysis",
      description: "Our AI analyzes your skills, experience, and preferences.",
      color: "bg-primary",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Smart Matching",
      description: "Get matched with jobs that align with your profile.",
      color: "bg-primary",
    },
    {
      icon: <BriefcaseIcon className="h-6 w-6" />,
      title: "Apply with Confidence",
      description: "Apply to jobs knowing you're a strong candidate.",
      color: "bg-primary",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-lg"
          >
            <Badge variant="outline" className="mb-6 gap-1 px-4 py-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span>AI-Powered Process</span>
            </Badge>

            <h2 className="text-4xl font-bold mb-6">How our AI matching technology works</h2>

            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Our advanced AI technology transforms the job search process, making it smarter, faster, and more
              accurate. Here's how we connect you with opportunities that truly match your profile.
            </p>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`${step.color} text-primary-foreground p-3 rounded-xl h-min`}>{step.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Interactive Elements */}
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

              {/* CV Upload Card */}
              <motion.div
                className="absolute top-24 left-1/2 -translate-x-1/2 bg-card p-5 rounded-xl shadow-md border w-[350px]"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Profile"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Uploading your CV</p>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[80%]"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">80% completed</p>
                  </div>
                </div>
              </motion.div>

              {/* AI Analysis Card */}
              <motion.div
                className="absolute top-1/2 right-20 bg-card p-5 rounded-xl shadow-md border w-[350px]"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-2 rounded-lg mt-1">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">AI Analysis Complete</p>
                    <p className="text-sm text-muted-foreground mt-1">We've identified your top skills:</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        JavaScript
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        React
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Node.js
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        UI/UX
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Job Match Card */}
              <motion.div
                className="absolute bottom-32 left-32 bg-card p-5 rounded-xl shadow-md border"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-2 rounded-lg mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Perfect Match Found!</p>
                    <p className="text-sm text-muted-foreground mt-1">Senior Developer at Microsoft</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-xs font-medium">Match Score:</div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-primary">94%</span>
                        <div className="w-20 h-1.5 bg-muted rounded-full ml-2">
                          <div className="bg-primary h-1.5 rounded-full w-[94%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Interview Request Card */}
              <motion.div
                className="absolute bottom-10 right-10 bg-card p-4 rounded-xl shadow-md border"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-secondary p-2 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Interview Request</p>
                    <p className="text-xs text-muted-foreground">Google wants to talk to you!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


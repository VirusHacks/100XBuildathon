"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SuccessStories() {
  const testimonials = [
    {
      name: "David Chen",
      role: "Software Engineer at Google",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The AI matching technology is incredible. I was matched with a job that perfectly aligned with my skills and career goals. Within two weeks, I had an offer from Google!",
      matchScore: 96,
    },
    {
      name: "Sarah Williams",
      role: "UX Designer at Adobe",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "I was skeptical about AI-powered job matching, but this platform proved me wrong. The matches were spot-on, and the insights about my profile helped me improve my resume.",
      matchScore: 94,
    },
    {
      name: "Michael Johnson",
      role: "Data Scientist at Amazon",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "As a data scientist, I appreciate the sophisticated algorithm behind this platform. It understood my specialized skills and found opportunities I wouldn't have discovered otherwise.",
      matchScore: 98,
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-6 gap-1 px-4 py-1.5">
            <Star className="h-3.5 w-3.5" />
            <span>Success Stories</span>
          </Badge>

          <h2 className="text-4xl font-bold mb-6">Real people, real matches, real success</h2>

          <p className="text-muted-foreground text-lg">
            Thousands of professionals have found their perfect job match using our AI-powered platform. Here are some
            of their stories.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="mb-6 relative">
                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-muted" />
                    <p className="text-muted-foreground relative z-10 pl-4">{testimonial.quote}</p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">AI Match Score:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{testimonial.matchScore}%</span>
                      <div className="w-16 h-2 bg-secondary rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${testimonial.matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-6">
            Join thousands of professionals who found their perfect job match
          </p>
          <Button className="rounded-full px-8">Start Your AI Job Search</Button>
        </motion.div>
      </div>
    </section>
  )
}


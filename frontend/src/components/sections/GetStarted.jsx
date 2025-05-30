"use client"

import { motion } from "framer-motion"
import { Cpu, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function GetStarted() {
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge
            variant="secondary"
            className="mb-6 gap-1 px-4 py-1.5 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>AI-Powered Job Matching</span>
          </Badge>

          <h2 className="text-4xl font-bold mb-6">Ready to find your perfect job match?</h2>

          <p className="text-primary-foreground/80 text-lg mb-8">
            Upload your CV today and let our AI technology find the perfect job opportunities that match your skills,
            experience, and career aspirations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-8"
            >
              Upload Your CV
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-black hover:bg-primary-foreground rounded-full px-8"
            >
              <span>Explore How It Works</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-foreground/10 p-6 rounded-xl border border-primary-foreground/20">
              <div className="text-3xl font-bold mb-2">10+</div>
              <p className="text-primary-foreground/80">Job seekers matched</p>
            </div>

            <div className="bg-primary-foreground/10 p-6 rounded-xl border border-primary-foreground/20">
              <div className="text-3xl font-bold mb-2">88%</div>
              <p className="text-primary-foreground/80">Match accuracy</p>
            </div>

            <div className="bg-primary-foreground/10 p-6 rounded-xl border border-primary-foreground/20">
              <div className="text-3xl font-bold mb-2">2+</div>
              <p className="text-primary-foreground/80">Partner companies</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Zap, Target, LineChart, Sparkles, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AiFeatures() {
  const features = [
    {
      icon: <BrainCircuit className="h-6 w-6" />,
      name: "AI-Powered Matching",
      description: "Our advanced algorithm analyzes your CV and matches it with the perfect job opportunities.",
      color: "bg-primary",
    },
    {
      icon: <Target className="h-6 w-6" />,
      name: "Precision Targeting",
      description: "Get job recommendations that precisely match your skills, experience, and career goals.",
      color: "bg-primary",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      name: "Instant Analysis",
      description: "Receive immediate feedback on how well your profile matches with job requirements.",
      color: "bg-primary",
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      name: "Skills Gap Analysis",
      description: "Identify skills you need to develop to qualify for your dream positions.",
      color: "bg-primary",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      name: "Smart Recommendations",
      description: "Get personalized job suggestions based on your unique professional profile.",
      color: "bg-primary",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      name: "Career Insights",
      description: "Gain valuable insights about industry trends and in-demand skills for your field.",
      color: "bg-primary",
    },
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Powered by Advanced AI Technology</h2>
          <p className="text-muted-foreground text-lg">
            Our intelligent matching system uses machine learning to understand your unique skills and career
            aspirations, connecting you with opportunities that truly fit your profile.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full overflow-hidden group">
                <CardContent className="p-6">
                  <div className="relative">
                    <div
                      className={`absolute -top-10 -left-10 w-24 h-24 ${feature.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}
                    ></div>
                    <div className={`${feature.color} text-primary-foreground rounded-lg p-3 mb-4 relative`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


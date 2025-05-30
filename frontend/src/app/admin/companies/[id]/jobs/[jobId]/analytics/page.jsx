"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts"
import { ResponsiveContainer } from "recharts"

// Sample application data based on the provided schema
const sampleApplications = [
  {
    _id: "app1",
    fullName: "John Doe",
    email: "john.doe@example.com",
    status: "shortlisted",
    aiAnalysis: {
      cumulative_ranking_score: 84.4,
      section_scores: {
        experience_projects: 84.4,
        skills: 100,
        education_certifications: 82.5,
        achievements: 95,
        social_validation: 85,
      },
      grouped_summary:
        "John Doe is a well-rounded candidate for the Software Engineer position, showcasing strong technical skills, relevant experience, and noteworthy achievements.",
      key_observations: [
        "Strengths include exceptional coding capabilities, proven project experience in development and AI, a strong educational background, and high competitive achievement.",
        "Some gaps exist in collaborative experience, which would complement technical competencies and expand adaptability in team settings.",
        "Unique aspects include an impressive feature set in competitive programming and strong engagement in projects showcasing innovation.",
      ],
    },
  },
  {
    _id: "app2",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    status: "reviewing",
    aiAnalysis: {
      cumulative_ranking_score: 91.2,
      section_scores: {
        experience_projects: 92.0,
        skills: 95.5,
        education_certifications: 88.0,
        achievements: 90.0,
        social_validation: 90.5,
      },
      grouped_summary:
        "Jane Smith is an exceptional candidate with extensive experience in software development and a strong educational background.",
      key_observations: [
        "Outstanding technical skills with expertise in multiple programming languages and frameworks.",
        "Proven track record of successful project delivery and team leadership.",
        "Strong academic credentials with relevant certifications in the field.",
      ],
    },
  },
  {
    _id: "app3",
    fullName: "Michael Johnson",
    email: "michael.j@example.com",
    status: "pending",
    aiAnalysis: {
      cumulative_ranking_score: 78.6,
      section_scores: {
        experience_projects: 75.0,
        skills: 85.0,
        education_certifications: 80.0,
        achievements: 70.0,
        social_validation: 83.0,
      },
      grouped_summary:
        "Michael Johnson shows promise with good technical skills but has less experience compared to other candidates.",
      key_observations: [
        "Strong foundational knowledge in relevant technologies.",
        "Limited professional experience but good academic background.",
        "Shows potential for growth with the right mentorship.",
      ],
    },
  },
  {
    _id: "app4",
    fullName: "Emily Davis",
    email: "emily.d@example.com",
    status: "hired",
    aiAnalysis: {
      cumulative_ranking_score: 95.8,
      section_scores: {
        experience_projects: 98.0,
        skills: 97.0,
        education_certifications: 94.0,
        achievements: 96.0,
        social_validation: 94.0,
      },
      grouped_summary:
        "Emily Davis is an outstanding candidate with exceptional skills and experience across all evaluated areas.",
      key_observations: [
        "Extensive experience in similar roles with proven success.",
        "Comprehensive skill set perfectly aligned with job requirements.",
        "Impressive achievements and strong recommendations from previous employers.",
      ],
    },
  },
  {
    _id: "app5",
    fullName: "Robert Wilson",
    email: "robert.w@example.com",
    status: "rejected",
    aiAnalysis: {
      cumulative_ranking_score: 65.3,
      section_scores: {
        experience_projects: 60.0,
        skills: 75.0,
        education_certifications: 70.0,
        achievements: 55.0,
        social_validation: 66.5,
      },
      grouped_summary: "Robert Wilson lacks the necessary experience and skills required for this position.",
      key_observations: [
        "Limited relevant experience in the required technologies.",
        "Skills gap in key areas needed for the role.",
        "Educational background is not closely aligned with job requirements.",
      ],
    },
  },
]

export default function ApplicationAnalyticsPage({ params }) {
  const [selectedApplication, setSelectedApplication] = useState(sampleApplications[0]._id)

  // Get the selected application data
  const applicationData = sampleApplications.find((app) => app._id === selectedApplication)

  // Prepare data for the cumulative score chart
  const cumulativeScoreData = sampleApplications
    .map((app) => ({
      name: app.fullName,
      score: app.aiAnalysis.cumulative_ranking_score,
      status: app.status,
    }))
    .sort((a, b) => b.score - a.score)

  // Prepare data for the radar chart
  const radarData = applicationData
    ? [
        {
          subject: "Experience & Projects",
          score: applicationData.aiAnalysis.section_scores.experience_projects,
          fullMark: 100,
        },
        {
          subject: "Skills",
          score: applicationData.aiAnalysis.section_scores.skills,
          fullMark: 100,
        },
        {
          subject: "Education & Certifications",
          score: applicationData.aiAnalysis.section_scores.education_certifications,
          fullMark: 100,
        },
        {
          subject: "Achievements",
          score: applicationData.aiAnalysis.section_scores.achievements,
          fullMark: 100,
        },
        {
          subject: "Social Validation",
          score: applicationData.aiAnalysis.section_scores.social_validation,
          fullMark: 100,
        },
      ]
    : []

  // Status color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#9CA3AF", // gray
      reviewing: "#60A5FA", // blue
      shortlisted: "#34D399", // green
      rejected: "#F87171", // red
      hired: "#8B5CF6", // purple
    }
    return statusColors[status] || "#9CA3AF"
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/admin/companies/${params.id}/jobs/${params.jobId}/applications`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Application Analytics</h1>
            <p className="text-muted-foreground">AI-powered insights for {sampleApplications.length} applications</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applicant Ranking by AI Score</CardTitle>
            <CardDescription>Cumulative ranking scores for all applicants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cumulativeScoreData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis domain={[0, 100]} label={{ value: "Score", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(1)}`, "Score"]}
                    labelFormatter={(label) => `Applicant: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="AI Score"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 6, fill: "hsl(var(--chart-1))" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Applicant Skill Breakdown</CardTitle>
              <CardDescription>Detailed analysis of candidate strengths across key areas</CardDescription>
            </div>
            <Select value={selectedApplication} onValueChange={setSelectedApplication}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select applicant" />
              </SelectTrigger>
              <SelectContent>
                {sampleApplications.map((app) => (
                  <SelectItem key={app._id} value={app._id}>
                    {app.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {applicationData && (
              <>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Skills Score"
                        dataKey="score"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}`, "Score"]} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium text-lg">{applicationData.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{applicationData.aiAnalysis.grouped_summary}</p>
                  <div className="mt-2">
                    <h4 className="font-medium">Key Observations:</h4>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      {applicationData.aiAnalysis.key_observations.map((observation, index) => (
                        <li key={index} className="text-muted-foreground">
                          {observation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


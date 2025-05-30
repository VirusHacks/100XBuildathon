"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft, Calendar, Mail, Phone, FileText, User, CheckCircle, XCircle, AlertCircle, BarChart3, Award, Clock, Briefcase, GraduationCap, Trophy, Users, Star, Download, ExternalLink, MessageSquare } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState("overview")
  const [note, setNote] = useState("")

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/applications/${params.applicationId}`)
        setApplication(data)
      } catch (err) {
        console.error("Error fetching application:", err)
        setError(err.response?.data?.error || "Failed to load application")
      } finally {
        setLoading(false)
      }
    }

    if (params.applicationId) {
      fetchApplication()
    }
  }, [params.applicationId])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
          <div>
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="h-[200px] bg-muted rounded animate-pulse mb-6"></div>
            <div className="h-[300px] bg-muted rounded animate-pulse"></div>
          </div>
          <div className="md:col-span-2">
            <div className="h-[150px] bg-muted rounded animate-pulse mb-6"></div>
            <div className="h-[400px] bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 max-w-7xl mx-auto">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Application</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!application) return null

  // Prepare data for the radar chart
  const radarData = [
    {
      subject: "Experience & Projects",
      A: Math.round(application.aiAnalysis.section_scores.experience_projects || 0),
      fullMark: 100,
    },
    {
      subject: "Skills",
      A: Math.round(application.aiAnalysis.section_scores.skills || 0),
      fullMark: 100,
    },
    {
      subject: "Education",
      A: Math.round(application.aiAnalysis.section_scores.education_certifications || 0),
      fullMark: 100,
    },
    {
      subject: "Achievements",
      A: Math.round(application.aiAnalysis.section_scores.achievements || 0),
      fullMark: 100,
    },
    {
      subject: "Social Validation",
      A: Math.round(application.aiAnalysis.section_scores.social_validation || 0),
      fullMark: 100,
    },
  ]

  // Prepare data for the bar chart
  const barData = [
    { name: "Technical", value: application.aiAnalysis.section_scores.skills || 0, fill: "hsl(var(--primary))" },
    {
      name: "Experience",
      value: application.aiAnalysis.section_scores.experience_projects || 0,
      fill: "hsl(215, 90%, 60%)",
    },
    {
      name: "Education",
      value: application.aiAnalysis.section_scores.education_certifications || 0,
      fill: "hsl(150, 60%, 50%)",
    },
    { name: "Achievements", value: application.aiAnalysis.section_scores.achievements || 0, fill: "hsl(45, 90%, 60%)" },
    { name: "Social", value: application.aiAnalysis.section_scores.social_validation || 0, fill: "hsl(280, 60%, 60%)" },
  ]

  // Prepare data for the line chart
  const lineData = [
    { date: "Initial", score: 65 },
    { date: "Resume Scan", score: 72 },
    { date: "Skills Match", score: 78 },
    { date: "Experience", score: 85 },
    { date: "Final", score: application.aiAnalysis.cumulative_ranking_score },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600"
      case "reviewing":
        return "bg-blue-500/10 text-blue-600"
      case "shortlisted":
        return "bg-green-500/10 text-green-600"
      case "rejected":
        return "bg-red-500/10 text-red-600"
      case "hired":
        return "bg-purple-500/10 text-purple-600"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "shortlisted":
      case "hired":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "rejected":
        return <XCircle className="h-4 w-4 mr-1" />
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />
      case "reviewing":
        return <User className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  const getInitials = (name) => {
    if (!name) return "NA"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Mock data for the resume tab
  const resumeData = {
    skills: [
      { name: "JavaScript", level: 90 },
      { name: "React", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "TypeScript", level: 75 },
      { name: "GraphQL", level: 70 },
    ],
    experience: [
      {
        company: "Tech Solutions Inc.",
        position: "Senior Developer",
        duration: "2020 - Present",
        description: "Led development of enterprise applications using React and Node.js.",
      },
      {
        company: "Digital Innovations",
        position: "Frontend Developer",
        duration: "2018 - 2020",
        description: "Developed responsive web applications and improved performance by 40%.",
      },
      {
        company: "WebTech Startup",
        position: "Junior Developer",
        duration: "2016 - 2018",
        description: "Assisted in building and maintaining client websites and applications.",
      },
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Master of Computer Science",
        year: "2016",
      },
      {
        institution: "State College",
        degree: "Bachelor of Science in Software Engineering",
        year: "2014",
      },
    ],
  }

  // Mock data for notes
  const mockNotes = [
    {
      author: "Sarah Johnson",
      date: "2023-11-15T10:30:00Z",
      content:
        "Candidate has excellent technical skills and relevant experience. Recommend moving forward with the interview process.",
    },
    {
      author: "Michael Chen",
      date: "2023-11-14T14:45:00Z",
      content: "Had a brief phone screening. Communication skills are good, and they seem enthusiastic about the role.",
    },
  ]

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-background">
          <Link href={`/admin/companies/${params.id}/jobs/${params.jobId}/applications`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Avatar className="h-14 w-14 mr-4 border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(application.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{application.fullName}</h1>
              <div className="flex flex-wrap items-center text-muted-foreground text-sm mt-1">
                <Mail className="h-4 w-4 mr-1" />
                <span className="mr-4">{application.email}</span>
                <Phone className="h-4 w-4 mr-1 ml-1" />
                <span>{application.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={`${getStatusColor(application.status)} capitalize px-3 py-1.5 text-sm font-medium flex items-center`}
            >
              {getStatusIcon(application.status)}
              {application.status}
            </Badge>
            <Button variant="outline" size="sm">
              Change Status
            </Button>
            <Button size="sm">Schedule Interview</Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveSection("overview")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeSection === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSection("analysis")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeSection === "analysis"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI Analysis
        </button>
        <button
          onClick={() => setActiveSection("resume")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeSection === "resume"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Resume
        </button>
        <button
          onClick={() => setActiveSection("notes")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeSection === "notes"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Notes
        </button>
      </div>

      {/* Overview Tab */}
      {activeSection === "overview" && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="overflow-hidden border-t-4 border-t-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">AI Score</div>
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{application.aiAnalysis.cumulative_ranking_score.toFixed(1)}</div>
                <Progress value={application.aiAnalysis.cumulative_ranking_score} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Out of 100 possible points</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">Match Score</div>
                  <div className="bg-blue-500/10 text-blue-600 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{((application.cosine || 0) * 100).toFixed(0)}%</div>
                <Progress value={(application.cosine || 0) * 100} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Job requirements match</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">Experience</div>
                  <div className="bg-amber-500/10 text-amber-600 p-2 rounded-full">
                    <Award className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {(application.aiAnalysis.section_scores.experience_projects || 0).toFixed(0)}
                </div>
                <Progress value={application.aiAnalysis.section_scores.experience_projects || 0} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Experience & projects score</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-t-4 border-t-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">Applied</div>
                  <div className="bg-green-500/10 text-green-600 p-2 rounded-full">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-lg font-medium">{formatDate(application.createdAt)}</div>
                <div className="flex items-center mt-2">
                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                  {application.resume && (
                    <a
                      href={application.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Resume
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact & Key Observations */}
            <div className="space-y-6">
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="flex items-center text-base">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Applied {formatDate(application.createdAt)}</span>
                  </div>
                  {application.resume && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={application.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="flex items-center text-base">
                    <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                    Key Observations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <ul className="space-y-3">
                    {application.aiAnalysis.key_observations.map((observation, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{observation}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="flex items-center text-base">
                    <Star className="h-4 w-4 mr-2 text-primary" />
                    Candidate Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Overall</span>
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(application.aiAnalysis.cumulative_ranking_score / 20)
                                ? "text-amber-500 fill-amber-500"
                                : i < Math.ceil(application.aiAnalysis.cumulative_ranking_score / 20)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted stroke-muted-foreground",
                            )}
                          />
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Technical Skills</span>
                      <div className="flex">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < Math.floor((application.aiAnalysis.section_scores.skills || 0) / 20)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted stroke-muted-foreground",
                              )}
                            />
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Experience</span>
                      <div className="flex">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < Math.floor((application.aiAnalysis.section_scores.experience_projects || 0) / 20)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted stroke-muted-foreground",
                              )}
                            />
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Education</span>
                      <div className="flex">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < Math.floor((application.aiAnalysis.section_scores.education_certifications || 0) / 20)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted stroke-muted-foreground",
                              )}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Charts & Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Skill Breakdown
                  </CardTitle>
                  <CardDescription>Detailed analysis of candidate strengths</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{
                            fill: "hsl(var(--foreground))",
                            fontSize: 12,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{
                            fill: "hsl(var(--foreground))",
                            fontSize: 10,
                          }}
                        />
                        <Radar
                          name="Skills Score"
                          dataKey="A"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.4}
                        />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Score"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
                          itemStyle={{
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    AI Analysis Summary
                  </CardTitle>
                  <CardDescription>Comprehensive evaluation of the candidate</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {application.aiAnalysis.grouped_summary}
                  </p>
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-5 py-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3 mr-2" />
                    This analysis is generated by AI and should be used as a supporting tool, not as the sole decision
                    factor.
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* AI Analysis Tab */}
      {activeSection === "analysis" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-base">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Score Breakdown
                </CardTitle>
                <CardDescription>Detailed analysis by category</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Score"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-base">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  Score Progression
                </CardTitle>
                <CardDescription>How the score was calculated</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center text-base">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Detailed Analysis
              </CardTitle>
              <CardDescription>Comprehensive AI evaluation</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                    Experience & Projects
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The candidate demonstrates{" "}
                    {application.aiAnalysis.section_scores.experience_projects > 80
                      ? "exceptional"
                      : application.aiAnalysis.section_scores.experience_projects > 60
                        ? "strong"
                        : "adequate"}{" "}
                    experience in relevant fields. Their project history shows a pattern of successful delivery and
                    technical growth. The depth of experience aligns well with the requirements for this position.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="text-xs font-medium mr-2">Score:</div>
                    <Progress
                      value={application.aiAnalysis.section_scores.experience_projects || 0}
                      className="h-1.5 w-24"
                    />
                    <div className="text-xs ml-2">{application.aiAnalysis.section_scores.experience_projects || 0}/100</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-green-500" />
                    Skills Assessment
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The candidate possesses{" "}
                    {application.aiAnalysis.section_scores.skills > 80
                      ? "exceptional"
                      : application.aiAnalysis.section_scores.skills > 60
                        ? "strong"
                        : "adequate"}{" "}
                    technical skills that match the job requirements. Their proficiency in key technologies indicates
                    they would be able to contribute effectively with minimal ramp-up time.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="text-xs font-medium mr-2">Score:</div>
                    <Progress value={application.aiAnalysis.section_scores.skills || 0} className="h-1.5 w-24" />
                    <div className="text-xs ml-2">{application.aiAnalysis.section_scores.skills || 0}/100</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-purple-500" />
                    Education & Certifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The candidate has{" "}
                    {application.aiAnalysis.section_scores.education_certifications > 80
                      ? "exceptional"
                      : application.aiAnalysis.section_scores.education_certifications > 60
                        ? "strong"
                        : "adequate"}{" "}
                    educational background and relevant certifications. Their academic achievements demonstrate a solid
                    foundation in the core principles needed for this role.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="text-xs font-medium mr-2">Score:</div>
                    <Progress
                      value={application.aiAnalysis.section_scores.education_certifications || 0}
                      className="h-1.5 w-24"
                    />
                    <div className="text-xs ml-2">
                      {application.aiAnalysis.section_scores.education_certifications || 0}/100
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    Achievements
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The candidate has{" "}
                    {application.aiAnalysis.section_scores.achievements > 80
                      ? "exceptional"
                      : application.aiAnalysis.section_scores.achievements > 60
                        ? "strong"
                        : "adequate"}{" "}
                    achievements that demonstrate their capability and drive. Their accomplishments show a pattern of
                    excellence and initiative that would be valuable to our team.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="text-xs font-medium mr-2">Score:</div>
                    <Progress value={application.aiAnalysis.section_scores.achievements || 0} className="h-1.5 w-24" />
                    <div className="text-xs ml-2">{application.aiAnalysis.section_scores.achievements || 0}/100</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-indigo-500" />
                    Social Validation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The candidate has{" "}
                    {(application.aiAnalysis.section_scores.social_validation || 0) > 80
                      ? "exceptional"
                      : (application.aiAnalysis.section_scores.social_validation || 0) > 60
                        ? "strong"
                        : "adequate"}{" "}
                    social validation through recommendations and professional networks. Their reputation among peers
                    suggests they are well-regarded in their field.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="text-xs font-medium mr-2">Score:</div>
                    <Progress
                      value={application.aiAnalysis.section_scores.social_validation || 0}
                      className="h-1.5 w-24"
                    />
                    <div className="text-xs ml-2">
                      {application.aiAnalysis.section_scores.social_validation || 0}/100
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-5 py-3">
              <div className="flex items-center text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-2" />
                This detailed analysis is based on AI evaluation of the candidate's resume and application materials.
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Resume Tab */}
      {activeSection === "resume" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Resume Overview</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {application.resume && (
                <Button size="sm" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Original
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4 py-1">
                        <h3 className="text-sm font-semibold">{edu.degree}</h3>
                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground mt-1">Graduated: {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-none shadow-md h-full">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <Briefcase className="h-4 w-4 mr-2 text-primary" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="relative pl-6 pb-6">
                        <div className="absolute top-0 left-0 h-full w-0.5 bg-primary/20"></div>
                        <div className="absolute top-1 left-[-4px] w-2 h-2 rounded-full bg-primary"></div>
                        <h3 className="text-sm font-semibold">{exp.position}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-xs font-medium">{exp.company}</span>
                          <span className="mx-2 text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{exp.duration}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeSection === "notes" && (
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center text-base">
                <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                Add Note
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <Textarea
                placeholder="Add your notes about this candidate..."
                className="min-h-[100px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button>Save Note</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Previous Notes</h3>
            {mockNotes.map((note, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(note.author)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{note.author}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(note.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
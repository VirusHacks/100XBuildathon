"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search, Users, BarChart3, PieChart, Filter, ArrowUpDown, CheckCircle, Clock, XCircle, User, Download, ChevronRight, SlidersHorizontal, Briefcase, Bot } from 'lucide-react'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { AIExplainabilityAgent } from "@/components/agent"

export default function ApplicationsPage() {
  const router = useRouter()
  const params = useParams()
  const [applications, setApplications] = useState([])
  const [jobData, setJobData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("score")
  const [showAIAgent, setShowAIAgent] = useState(false)

  // Fetch applications data
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs/${params.jobId}/applications`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }
        
        const data = await response.json()
        
        // Extract applications array from the response
        const applicationsArray = data.applications || []
        setApplications(applicationsArray)
        
        // Store job data if needed
        if (data.job) {
          setJobData(data.job)
        }
        
        // Set the first application as selected if available
        if (applicationsArray.length > 0) {
          setSelectedApplication(applicationsArray[0]._id)
        }
      } catch (err) {
        console.error("Error fetching applications:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.jobId) {
      fetchApplications()
    }
  }, [params.jobId])

  // Get the selected application data
  const applicationData = applications.find((app) => app?._id === selectedApplication)

  // Sort applications based on selected criteria
  const getSortedApplications = () => {
    if (!applications.length) return []
    
    return [...applications].sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.aiAnalysis?.cumulative_ranking_score || 0) - (a.aiAnalysis?.cumulative_ranking_score || 0)
        case "match":
          return (b.cosine || 0) - (a.cosine || 0)
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "name":
          return a.fullName?.localeCompare(b.fullName)
        default:
          return (b.aiAnalysis?.cumulative_ranking_score || 0) - (a.aiAnalysis?.cumulative_ranking_score || 0)
      }
    })
  }

  const sortedApplications = getSortedApplications()

  // Prepare data for the line chart
  const lineChartData = sortedApplications.map((app) => ({
    name: app.fullName?.split(" ")[0] || "Unknown",
    score: app.aiAnalysis?.cumulative_ranking_score || 0,
  }))

  // Prepare data for the bar chart (cosine only)
  const barChartData = sortedApplications.map((app) => ({
    name: app.fullName?.split(" ")[0] || "Unknown",
    Match: (app.cosine || 0) * 100, // Convert to percentage
  }))

  // Prepare data for the pie chart (status distribution)
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status || "pending"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Prepare data for the radar chart (average scores by category)
  const getAverageScores = () => {
    if (!applications.length) return []
    
    const totalApps = applications.length
    const totals = applications.reduce(
      (acc, app) => {
        if (app.aiAnalysis?.section_scores) {
          acc.experience += app.aiAnalysis.section_scores.experience_projects || 0
          acc.skills += app.aiAnalysis.section_scores.skills || 0
          acc.education += app.aiAnalysis.section_scores.education_certifications || 0
          acc.achievements += app.aiAnalysis.section_scores.achievements || 0
          acc.social += app.aiAnalysis.section_scores.social_validation || 0
        }
        return acc
      },
      { experience: 0, skills: 0, education: 0, achievements: 0, social: 0 },
    )

    return [
      { subject: "Experience", A: totals.experience / totalApps },
      { subject: "Skills", A: totals.skills / totalApps },
      { subject: "Education", A: totals.education / totalApps },
      { subject: "Achievements", A: totals.achievements / totalApps },
      { subject: "Social", A: totals.social / totalApps },
    ]
  }

  const radarData = getAverageScores()

  // Filter applications based on search and status
  const filteredApplications = sortedApplications.filter((app) => {
    const matchesSearch = app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: applications.length,
    avgScore:
      applications.length > 0
        ? applications.reduce((sum, app) => sum + (app.aiAnalysis?.cumulative_ranking_score || 0), 0) /
          applications.length
        : 0,
    avgMatch:
      applications.length > 0
        ? (applications.reduce((sum, app) => sum + (app.cosine || 0), 0) / applications.length) * 100
        : 0,
    highestScore: applications.length > 0
      ? Math.max(...applications.map((app) => app.aiAnalysis?.cumulative_ranking_score || 0))
      : 0,
    highestMatch: applications.length > 0
      ? Math.max(...applications.map((app) => app.cosine || 0)) * 100
      : 0,
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

  const getInitials = (name) => {
    if (!name) return "NA"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 max-w-7xl mx-auto">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Error Loading Applications</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="container py-8 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Applications Found</h2>
              <p className="text-muted-foreground mb-4">There are no applications for this job yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage and analyze job applications</p>
        </div>

        <div className="flex items-center gap-2">
        <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setShowAIAgent(!showAIAgent)}
          >
            <Bot className="h-4 w-4 mr-2" />
            {showAIAgent ? "Hide AI Assistant" : "AI Assistant"}
          </Button>

          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="flex items-center">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

            {/* AI Explainability Agent */}
            {showAIAgent && (
        <div className="mb-6">
          <AIExplainabilityAgent jobId={params.jobId} applicationId={selectedApplication} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="overflow-hidden border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Total Applications</div>
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">From all sources</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Average AI Score</div>
              <div className="bg-blue-500/10 text-blue-600 p-2 rounded-full">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold">{stats.avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-2">Out of 100 possible points</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Average Match</div>
              <div className="bg-amber-500/10 text-amber-600 p-2 rounded-full">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold">{stats.avgMatch.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-2">Job requirements match</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Top Candidate</div>
              <div className="bg-green-500/10 text-green-600 p-2 rounded-full">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold">{stats.highestScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-2">Highest AI score</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeTab === "analytics"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("candidates")}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
            activeTab === "candidates"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Candidates
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Analytics */}
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-base">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Applicant Ranking by AI Score
                </CardTitle>
                <CardDescription>Cumulative ranking scores for all applicants</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fill: "hsl(var(--foreground))" }}
                        stroke="hsl(var(--foreground))"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--foreground))" }}
                        stroke="hsl(var(--foreground))"
                        label={{
                          value: "Score",
                          angle: -90,
                          position: "insideLeft",
                          fill: "hsl(var(--foreground))",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        connectNulls={true}
                        dot={{
                          r: 6,
                          fill: "hsl(var(--primary))",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 8,
                          fill: "hsl(var(--primary))",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <PieChart className="h-4 w-4 mr-2 text-primary" />
                    Application Status
                  </CardTitle>
                  <CardDescription>Distribution by current status</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center text-base">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Average Candidate Profile
                  </CardTitle>
                  <CardDescription>Strengths across all applications</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Average" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Applications List */}
          <div>
            <Card className="overflow-hidden border-none shadow-md h-full">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-base">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Applications
                </CardTitle>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => setSortBy(sortBy === "score" ? "match" : "score")}>
                      <ArrowUpDown className="h-3 w-3 mr-1" />
                      Sort by {sortBy === "score" ? "AI Score" : "Match"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredApplications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No applications found matching your criteria
                    </div>
                  ) : (
                    filteredApplications.map((application) => (
                      <Link
                        key={application._id}
                        href={`/admin/companies/${params.id}/jobs/${params.jobId}/applications/${application._id}`}
                        className="block border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-4 flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(application.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium truncate">{application.fullName}</div>
                              <Badge
                                className={`${getStatusColor(application.status)} capitalize text-xs flex items-center ml-2`}
                              >
                                {getStatusIcon(application.status)}
                                {application.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="truncate">{application.email}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(application.createdAt)}</span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-sm font-medium">
                              {(application.aiAnalysis?.cumulative_ranking_score || 0).toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">AI Score</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 px-4 py-3 justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing {filteredApplications.length} of {applications.length} applications
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center text-base">
                <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                Cosine Similarity Comparison
              </CardTitle>
              <CardDescription>Visualizing match percentage with job requirements</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sortedApplications.map((app) => ({
                      name: app.fullName?.split(" ")[0] || "Unknown",
                      similarity: (app.cosine || 0) * 100,
                    }))}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fill: "hsl(var(--foreground))" }}
                      stroke="hsl(var(--foreground))"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--foreground))" }}
                      stroke="hsl(var(--foreground))"
                      label={{
                        value: "Similarity %",
                        angle: -90,
                        position: "insideLeft",
                        fill: "hsl(var(--foreground))",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value.toFixed(1)}%`, "Cosine Similarity"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="similarity"
                      stroke="hsl(215, 90%, 60%)"
                      strokeWidth={2}
                      connectNulls={true}
                      dot={{
                        r: 6,
                        fill: "hsl(215, 90%, 60%)",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 8,
                        fill: "hsl(215, 90%, 60%)",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-base">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Cosine Similarity Scores
                </CardTitle>
                <CardDescription>Match percentage with job requirements</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fill: "hsl(var(--foreground))" }}
                        stroke="hsl(var(--foreground))"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--foreground))" }}
                        stroke="hsl(var(--foreground))"
                        label={{
                          value: "Match %",
                          angle: -90,
                          position: "insideLeft",
                          fill: "hsl(var(--foreground))",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(1)}%`, "Match"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="Match" fill="hsl(215, 90%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center text-base">
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  Score Distribution
                </CardTitle>
                <CardDescription>AI scores across all candidates</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {sortedApplications.map((app) => (
                    <div key={app._id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(app.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{app.fullName}</span>
                        </div>
                        <span className="text-sm">{(app.aiAnalysis?.cumulative_ranking_score || 0).toFixed(1)}</span>
                      </div>
                      <Progress value={app.aiAnalysis?.cumulative_ranking_score || 0} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center text-base">
                <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                Skill Breakdown Comparison
              </CardTitle>
              <CardDescription>Top candidates by category</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Technical Skills</h3>
                  <div className="space-y-3">
                    {sortedApplications
                      .sort((a, b) => (b.aiAnalysis?.section_scores?.skills || 0) - (a.aiAnalysis?.section_scores?.skills || 0))
                      .slice(0, 3)
                      .map((app) => (
                        <div key={app._id} className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(app.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm truncate">{app.fullName}</span>
                              <span className="text-sm font-medium ml-2">
                                {(app.aiAnalysis?.section_scores?.skills || 0).toFixed(1)}
                              </span>
                            </div>
                            <Progress value={app.aiAnalysis?.section_scores?.skills || 0} className="h-1.5 mt-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Experience & Projects</h3>
                  <div className="space-y-3">
                    {sortedApplications
                      .sort(
                        (a, b) =>
                          (b.aiAnalysis?.section_scores?.experience_projects || 0) -
                          (a.aiAnalysis?.section_scores?.experience_projects || 0)
                      )
                      .slice(0, 3)
                      .map((app) => (
                        <div key={app._id} className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(app.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm truncate">{app.fullName}</span>
                              <span className="text-sm font-medium ml-2">
                                {(app.aiAnalysis?.section_scores?.experience_projects || 0).toFixed(1)}
                              </span>
                            </div>
                            <Progress
                              value={app.aiAnalysis?.section_scores?.experience_projects || 0}
                              className="h-1.5 mt-1"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Education & Certifications</h3>
                  <div className="space-y-3">
                    {sortedApplications
                      .sort(
                        (a, b) =>
                          (b.aiAnalysis?.section_scores?.education_certifications || 0) -
                          (a.aiAnalysis?.section_scores?.education_certifications || 0)
                      )
                      .slice(0, 3)
                      .map((app) => (
                        <div key={app._id} className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(app.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm truncate">{app.fullName}</span>
                              <span className="text-sm font-medium ml-2">
                                {(app.aiAnalysis?.section_scores?.education_certifications || 0).toFixed(1)}
                              </span>
                            </div>
                            <Progress
                              value={app.aiAnalysis?.section_scores?.education_certifications || 0}
                              className="h-1.5 mt-1"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">AI Score</SelectItem>
                  <SelectItem value="match">Match %</SelectItem>
                  <SelectItem value="date">Date Applied</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button>Bulk Actions</Button>
          </div>

          <Card className="overflow-hidden border-none shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Candidate</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">AI Score</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Match %</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Applied</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(app.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{app.fullName}</div>
                              <div className="text-xs text-muted-foreground">{app.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(app.status)} capitalize text-xs flex items-center`}>
                            {getStatusIcon(app.status)}
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">
                              {(app.aiAnalysis?.cumulative_ranking_score || 0).toFixed(1)}
                            </span>
                            <Progress value={app.aiAnalysis?.cumulative_ranking_score || 0} className="h-1.5 w-16" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{((app.cosine || 0) * 100).toFixed(0)}%</span>
                            <Progress value={(app.cosine || 0) * 100} className="h-1.5 w-16" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(app.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/companies/${params.id}/jobs/${params.jobId}/applications/${app._id}`}
                            className="text-primary hover:underline text-sm"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-4 py-3 justify-between">
              <div className="text-xs text-muted-foreground">
                Showing {filteredApplications.length} of {applications.length} candidates
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
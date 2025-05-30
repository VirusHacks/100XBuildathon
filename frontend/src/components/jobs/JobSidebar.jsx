"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { Search } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export default function JobSidebar({ onFiltersChange = () => {} }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState({
    jobTypes: [],
    skills: [],
    educationLevels: [],
    organizations: [],
    salaryRanges: { minSalary: 0, maxSalary: 0 },
    sortOptions: [],
  })

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "relevance",
    jobTypes: new Set(searchParams.get("jobTypes")?.split(",").filter(Boolean) || []),
    organizations: new Set(searchParams.get("organizations")?.split(",").filter(Boolean) || []),
    skills: new Set(searchParams.get("skills")?.split(",").filter(Boolean) || []),
    education: new Set(searchParams.get("education")?.split(",").filter(Boolean) || []),
  })

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const handleApplyFilters = () => {
    // Update URL with filters
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.sort) params.set("sort", filters.sort)
    if (filters.jobTypes.size) params.set("jobTypes", Array.from(filters.jobTypes).join(","))
    if (filters.organizations.size) params.set("organizations", Array.from(filters.organizations).join(","))
    if (filters.skills.size) params.set("skills", Array.from(filters.skills).join(","))
    if (filters.education.size) params.set("education", Array.from(filters.education).join(","))

    // Update URL without triggering navigation
    window.history.pushState({}, "", `/jobs?${params.toString()}`)

    // Notify parent component
    onFiltersChange(filters)
  }

  const fetchFilterOptions = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get("/api/jobs/filter")
      setFilterOptions(data)
    } catch (error) {
      console.error("Error fetching filter options:", error)
      // Set default filter options in case of error
      setFilterOptions({
        jobTypes: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
        skills: ["JavaScript", "React", "Node.js", "Python", "Java"],
        educationLevels: ["High School", "Bachelor's", "Master's", "PhD"],
        organizations: [],
        sortOptions: [
          { id: "relevance", label: "Relevance" },
          { id: "recent", label: "Most Recent" },
          { id: "salary-high-low", label: "Salary (High to Low)" },
          { id: "salary-low-high", label: "Salary (Low to High)" },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }))
  }

  const handleCheckboxChange = (type, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[type])
      if (newSet.has(value)) {
        newSet.delete(value)
      } else {
        newSet.add(value)
      }
      return { ...prev, [type]: newSet }
    })
  }

  const handleReset = () => {
    setFilters({
      search: "",
      sort: "relevance",
      jobTypes: new Set(),
      organizations: new Set(),
      skills: new Set(),
      education: new Set(),
    })
  }

  if (loading) {
    return (
      <div className="w-full max-w-xs space-y-4 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Filters</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={filters.search} onChange={handleSearchChange} className="pl-9" />
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <h3 className="font-semibold">Sort By</h3>
          <RadioGroup value={filters.sort} onValueChange={handleSortChange}>
            {filterOptions.sortOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <h3 className="font-semibold">Job Type</h3>
          <ScrollArea className="h-[120px]">
            {filterOptions.jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.jobTypes.has(type)}
                  onCheckedChange={() => handleCheckboxChange("jobTypes", type)}
                />
                <Label htmlFor={`type-${type}`}>{type}</Label>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Organizations */}
        <div className="space-y-2">
          <h3 className="font-semibold">Organizations</h3>
          <ScrollArea className="h-[120px]">
            {filterOptions.organizations.map((org) => (
              <div key={org.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`org-${org.id}`}
                  checked={filters.organizations.has(org.id)}
                  onCheckedChange={() => handleCheckboxChange("organizations", org.id)}
                />
                <Label htmlFor={`org-${org.id}`}>{org.name}</Label>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h3 className="font-semibold">Skills</h3>
          <ScrollArea className="h-[120px]">
            {filterOptions.skills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={filters.skills.has(skill)}
                  onCheckedChange={() => handleCheckboxChange("skills", skill)}
                />
                <Label htmlFor={`skill-${skill}`}>{skill}</Label>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <h3 className="font-semibold">Education</h3>
          <ScrollArea className="h-[120px]">
            {filterOptions.educationLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`edu-${level}`}
                  checked={filters.education.has(level)}
                  onCheckedChange={() => handleCheckboxChange("education", level)}
                />
                <Label htmlFor={`edu-${level}`}>{level}</Label>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}


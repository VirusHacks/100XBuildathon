"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin, DollarSign, Clock, Share2, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function JobCard({ job, onApplyClick }) {
  const [isSaved, setIsSaved] = useState(false)

  const formatSalary = (min, max) => {
    if (!min && !max) return "Not specified"
    if (!min) return `Up to $${max.toLocaleString()}`
    if (!max) return `From $${min.toLocaleString()}`
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const formatPostedTime = (date) => {
    if (!date) return "Recently"
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const toggleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.companyId?.name || "Company"}`,
        text: `Check out this job: ${job.title} at ${job.companyId?.name || "Company"}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Could not copy link: ", err))
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start">
          {/* Company Logo */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 bg-background rounded-md overflow-hidden flex items-center justify-center border">
              {job.companyId?.logo ? (
                <Image
                  src={job.companyId.logo.url || "/placeholder.svg"}
                  alt={`${job.companyId.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  {job.companyId?.name?.charAt(0) || "C"}
                </div>
              )}
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold hover:text-primary">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.companyId?.name || "Company"}</p>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare} aria-label="Share job">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleSave}
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Job Details */}
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-y-2">
                {job.location && (
                  <div className="flex items-center text-sm text-muted-foreground mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                )}

                {(job.salary?.min || job.salary?.max) && (
                  <div className="flex items-center text-sm text-muted-foreground mr-4">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{formatSalary(job.salary.min, job.salary.max)}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Posted {formatPostedTime(job.createdAt)}</span>
                </div>
              </div>

              {/* Skills/Tags */}
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mt-2">
                <p className="text-sm line-clamp-2">{job.description || "No description provided."}</p>
                <div className="mt-1">
                  <Button variant="link" className="h-auto p-0 text-sm" asChild>
                    <Link href={`/jobs/${job._id}`}>Show more</Link>
                  </Button>
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-4">
                <Button onClick={() => onApplyClick(job)}>Learn More & Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


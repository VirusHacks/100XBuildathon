"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import {
  BookmarkIcon,
  ShareIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline"
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid"

export default function JobListing({ job, onLearnMore, onShare, onSave }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Format salary range
  const formatSalary = (min, max, currency = "$") => {
    if (!min && !max) return "Salary not specified"
    if (min && !max) return `${currency}${min.toLocaleString()}+`
    if (!min && max) return `Up to ${currency}${max.toLocaleString()}`
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start">
          {/* Company logo */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              {job.company?.logo ? (
                <Image
                  src={job.company.logo.url || "/placeholder.svg"}
                  alt={`${job.company.name} logo`}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              ) : (
                <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>

          {/* Job details */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <p className="text-gray-600 mt-1">{job.company?.name}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onShare()
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  aria-label="Share job"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSave()
                  }}
                  className={`p-2 rounded-full hover:bg-gray-100 ${
                    job.saved ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  aria-label={job.saved ? "Remove from saved jobs" : "Save job"}
                >
                  {job.saved ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Job metadata */}
            <div className="mt-3 flex flex-wrap gap-y-2">
              {job.location && (
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.jobType && (
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  <span>{job.jobType}</span>
                </div>
              )}
              {job.salaryMin || job.salaryMax ? (
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
              ) : null}
              {job.createdAt && (
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>Posted {formatDistanceToNow(new Date(job.createdAt))} ago</span>
                </div>
              )}
            </div>

            {/* Skills/tags */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Education requirements */}
            {job.education && (
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <AcademicCapIcon className="w-4 h-4 mr-1" />
                <span>{job.education}</span>
              </div>
            )}

            {/* Job description */}
            <div className="mt-4">
              <div
                className={`text-gray-600 text-sm ${isExpanded ? "" : "line-clamp-3"}`}
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              <button onClick={toggleExpand} className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800">
                {isExpanded ? "Show less" : "Show more"}
              </button>
            </div>

            {/* Apply button */}
            <div className="mt-4">
              <button
                onClick={onLearnMore}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Learn More & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


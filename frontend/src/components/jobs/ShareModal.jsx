"use client"

import { useState, useRef, useEffect } from "react"
import { XMarkIcon, LinkIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share"
import { toast } from "react-hot-toast"

export default function ShareModal({ job, onClose }) {
  const [copied, setCopied] = useState(false)
  const modalRef = useRef(null)
  const jobUrl = typeof window !== "undefined" ? `${window.location.origin}/jobs/${job._id}` : ""

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(jobUrl).then(() => {
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Job Opportunity: ${job.title} at ${job.company?.name}`)
    const body = encodeURIComponent(
      `Check out this job opportunity I found:\n\n` + `${job.title} at ${job.company?.name}\n\n` + `${jobUrl}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareTitle = `Job Opportunity: ${job.title} at ${job.company?.name}`
  const shareDescription = `Check out this job opportunity: ${job.title} at ${job.company?.name}. ${job.location ? `Location: ${job.location}` : ""}`

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Share This Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500" aria-label="Close">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
            <p className="text-gray-600">
              {job.company?.name} • {job.location}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Share via social media</h4>
              <div className="flex space-x-4 justify-center">
                <FacebookShareButton url={jobUrl} quote={shareTitle}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>

                <TwitterShareButton url={jobUrl} title={shareTitle}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>

                <LinkedinShareButton url={jobUrl} title={shareTitle} summary={shareDescription} source="Job Portal">
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>

                <WhatsappShareButton url={jobUrl} title={shareTitle}>
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Or share via</h4>

              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LinkIcon className="mr-2 h-5 w-5 text-gray-400" />
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                <button
                  onClick={handleEmailShare}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EnvelopeIcon className="mr-2 h-5 w-5 text-gray-400" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


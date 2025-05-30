
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return "Unknown date"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date"

  // Get time difference in milliseconds
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  // Format based on time difference
  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`

  // For older dates, use standard format
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatSalary(min, max, currency = "$") {
  if (!min && !max) return "Not specified"

  const formatNumber = (num) => {
    if (!num) return ""

    // Format based on size
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K"
    }

    return num.toString()
  }

  if (min && max) {
    return `${currency}${formatNumber(min)} - ${currency}${formatNumber(max)}`
  } else if (min) {
    return `${currency}${formatNumber(min)}+`
  } else if (max) {
    return `Up to ${currency}${formatNumber(max)}`
  }
}

export function truncateText(text, maxLength = 100) {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}


"use client"

import { useState, useRef } from "react"
import { toast } from "react-hot-toast"
import axios from "axios"

export default function ApplicationModal({ job, userProfile, onClose }) {
  const [formData, setFormData] = useState({
    name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "",
    email: userProfile?.email || "",
    phone: userProfile?.phoneNumber || "",
    resume: null,
    coverLetter: "",
    portfolio: userProfile?.socialLinks?.portfolio || "",
    linkedin: userProfile?.socialLinks?.linkedin || "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [useExistingResume, setUseExistingResume] = useState(userProfile?.resume?.url ? true : false)

  const resumeFileRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUseExistingResume(false)

      // Clear error when user uploads file
      if (errors.resume) {
        setErrors((prev) => ({ ...prev, resume: null }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

    // Check resume
    if (!useExistingResume && !resumeFileRef.current?.files[0]) {
      newErrors.resume = "Resume is required"
    }

    // Validate URLs if provided
    if (formData.portfolio && !isValidURL(formData.portfolio)) {
      newErrors.portfolio = "Please enter a valid portfolio URL"
    }

    if (formData.linkedin && !isValidURL(formData.linkedin)) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      // Create FormData object for file uploads
      const formDataToSend = new FormData()

      // Add form fields
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("coverLetter", formData.coverLetter)
      formDataToSend.append("portfolio", formData.portfolio)
      formDataToSend.append("linkedin", formData.linkedin)
      formDataToSend.append("useExistingResume", useExistingResume)

      // Add resume if not using existing one
      if (!useExistingResume && resumeFileRef.current?.files[0]) {
        formDataToSend.append("resume", resumeFileRef.current.files[0])
      }

      // Submit application
      await axios.post(`/api/jobs/${job._id}/apply`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setIsSubmitted(true)
      toast.success("Application submitted successfully")
    } catch (error) {
      console.error("Error submitting application:", error)
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.error || "Failed to submit application. Please try again.",
      }))
      // Show error message in a more prominent way
      window.scrollTo(0, 0) // Scroll to top to show error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add URL validation helper function
  const isValidURL = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {isSubmitted ? (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Application Submitted!</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Your application for {job.title} at {job.company} has been successfully submitted.
                    </p>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        You can view the status of your application in your profile under "Your Applications".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Apply for {job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.company} • {job.locations[0]}
                    </p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className={`mt-1 block w-full border ${errors.name ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          value={formData.name}
                          onChange={handleChange}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className={`mt-1 block w-full border ${errors.email ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                          Resume/CV *
                        </label>

                        {userProfile?.resume?.url && (
                          <div className="mt-2 mb-4">
                            <div className="flex items-center">
                              <input
                                id="use-existing-resume"
                                name="use-existing-resume"
                                type="checkbox"
                                checked={useExistingResume}
                                onChange={(e) => setUseExistingResume(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="use-existing-resume" className="ml-2 block text-sm text-gray-700">
                                Use my existing resume
                              </label>
                            </div>

                            {useExistingResume && (
                              <div className="mt-2 flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <svg
                                  className="w-6 h-6 text-blue-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  ></path>
                                </svg>
                                <span className="text-sm text-blue-700 font-medium">
                                  {userProfile.resume.filename || "Your uploaded resume"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {!useExistingResume && (
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    ref={resumeFileRef}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                            </div>
                          </div>
                        )}

                        {!useExistingResume && resumeFileRef.current?.files[0] && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected file: {resumeFileRef.current.files[0].name}
                          </p>
                        )}

                        {errors.resume && <p className="mt-1 text-sm text-red-600">{errors.resume}</p>}
                      </div>

                      <div>
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                          Cover Letter
                        </label>
                        <textarea
                          id="coverLetter"
                          name="coverLetter"
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Why are you interested in this position?"
                          value={formData.coverLetter}
                          onChange={handleChange}
                        ></textarea>
                      </div>

                      <div>
                        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          name="portfolio"
                          id="portfolio"
                          className={`mt-1 block w-full border ${
                            errors.portfolio ? "border-red-300" : "border-gray-300"
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="https://yourportfolio.com"
                          value={formData.portfolio}
                          onChange={handleChange}
                        />
                        {errors.portfolio && <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>}
                      </div>

                      <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          id="linkedin"
                          className={`mt-1 block w-full border ${
                            errors.linkedin ? "border-red-300" : "border-gray-300"
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedin}
                          onChange={handleChange}
                        />
                        {errors.linkedin && <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


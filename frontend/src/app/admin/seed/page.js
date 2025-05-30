"use client"

import { useState } from "react"
import { triggerSeedDatabase } from "../../actions/seedDatabase"

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState(null)

  const handleSeed = async () => {
    if (window.confirm("Are you sure you want to seed the database? This will delete all existing data.")) {
      setIsSeeding(true)
      setResult(null)

      try {
        const result = await triggerSeedDatabase()
        setResult(result)
      } catch (error) {
        setResult({ success: false, message: error.message })
      } finally {
        setIsSeeding(false)
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Database Seeder</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          <strong>Warning:</strong> This will delete all existing data and replace it with sample data. Only use this in
          development environments.
        </p>
      </div>

      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSeeding ? "Seeding..." : "Seed Database"}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {result.message}
        </div>
      )}
    </div>
  )
}


"use server"

import { seedDatabase } from "../../scripts/seed"

export async function triggerSeedDatabase() {
  if (process.env.NODE_ENV !== "production") {
    try {
      await seedDatabase()
      return { success: true, message: "Database seeded successfully" }
    } catch (error) {
      console.error("Error seeding database:", error)
      return { success: false, message: "Error seeding database" }
    }
  } else {
    return { success: false, message: "Seeding is not allowed in production" }
  }
}


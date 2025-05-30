import Navbar from "@/components/Navbar"
import Hero from "@/components/sections/Hero"
import AiFeatures from "@/components/sections/AiFeatures"
import SmartProfile from "@/components/sections/SmartProfile"
import MatchingProcess from "@/components/sections/MatchingProcess"
import SuccessStories from "@/components/sections/SuccessStories"
import GetStarted from "@/components/sections/GetStarted"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <AiFeatures />
        <SmartProfile />
        <MatchingProcess />
        <SuccessStories />
        <GetStarted />
        <Footer />
      </div>
    </main>
  )
}


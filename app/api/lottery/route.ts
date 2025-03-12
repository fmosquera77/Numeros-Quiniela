import { NextResponse } from "next/server"
import { fetchLotteryNumbers } from "@/lib/scraper"
import { fetchLotteryNumbers as fetchImproved, getMockLotteryData } from "@/lib/scraper-improved"

export async function GET() {
  try {
    // Try the original scraper first
    try {
      const data = await fetchLotteryNumbers()
      if (data && data.length > 0) {
        return NextResponse.json(data)
      }
    } catch (originalError) {
      console.error("Original scraper failed:", originalError)
    }

    // If the original scraper fails, try the improved version
    try {
      const improvedData = await fetchImproved()
      if (improvedData && improvedData.length > 0) {
        return NextResponse.json(improvedData)
      }
    } catch (improvedError) {
      console.error("Improved scraper failed:", improvedError)
    }

    // If both scrapers fail, return mock data as a fallback
    console.log("Both scrapers failed, returning mock data")
    const mockData = getMockLotteryData()
    return NextResponse.json(mockData)
  } catch (error) {
    console.error("API error:", error)
    // Even if everything fails, still return mock data
    const mockData = getMockLotteryData()
    return NextResponse.json(mockData)
  }
}


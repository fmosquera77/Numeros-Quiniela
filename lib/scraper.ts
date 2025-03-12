import { load } from "cheerio"

interface LotteryResult {
  city: string
  number: string
  lastTwoDigits: string
}

export async function fetchLotteryNumbers(): Promise<LotteryResult[]> {
  try {
    // Fetch the HTML content from the website
    const response = await fetch("https://vivitusuerte.com/cabezas", {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://www.google.com/",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Load the HTML into cheerio
    const $ = load(html)

    const results: LotteryResult[] = []

    // Find the table rows with the lottery results
    // This selector might need adjustment based on the actual HTML structure
    $('tr, .row, [class*="row"]').each((_, element) => {
      // Extract the city name from the first column
      const city = $(element).find("td:nth-child(1)").text().trim()

      // Extract the number from the column with the 4-digit number
      // Looking at the screenshot, it appears to be in a dark background cell
      const numberText = $(element).find("td:nth-child(3)").text().trim()

      // Extract any 4-digit number using regex
      const numberMatch = numberText.match(/\d{4}/)

      if (city && numberMatch) {
        const number = numberMatch[0]
        const lastTwoDigits = number.slice(-2)

        results.push({
          city,
          number,
          lastTwoDigits,
        })
      }
    })

    return results
  } catch (error) {
    console.error("Error scraping lottery numbers:", error)
    // Add more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    throw error
  }
}


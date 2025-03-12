import { load } from "cheerio"

interface LotteryResult {
  city: string
  number: string
  lastTwoDigits: string
}

export async function fetchLotteryNumbers(): Promise<LotteryResult[]> {
  try {
    // Use relative URL instead of localhost
    const response = await fetch("/api/proxy", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch from proxy: ${response.status}`)
    }

    const html = await response.text()

    // Load the HTML into cheerio
    const $ = load(html)

    const results: LotteryResult[] = []

    // Based on the screenshot, target the rows with the lottery numbers
    $('.row, tr, [class*="row"]').each((_, element) => {
      // Look for elements that contain both a city name and a 4-digit number
      const rowText = $(element).text()
      const numberMatch = rowText.match(/\d{4}/)

      if (numberMatch) {
        const number = numberMatch[0]
        const lastTwoDigits = number.slice(-2)

        // Try to extract the city name
        // This is a best effort based on the screenshot
        let city = ""
        $(element)
          .find("td, div, span")
          .each((_, cell) => {
            const cellText = $(cell).text().trim()
            // Skip cells that contain the number or are empty
            if (cellText && !cellText.includes(number) && cellText.length > 2) {
              city = cellText
              return false // break the loop
            }
          })

        if (city) {
          results.push({
            city,
            number,
            lastTwoDigits,
          })
        }
      }
    })

    // If we couldn't find any results with the above method, try a more aggressive approach
    if (results.length === 0) {
      // Look for any 4-digit numbers on the page
      const pageText = $("body").text()
      const allNumbers = pageText.match(/\d{4}/g) || []

      allNumbers.forEach((number) => {
        results.push({
          city: "Desconocido", // We couldn't determine the city
          number,
          lastTwoDigits: number.slice(-2),
        })
      })
    }

    return results
  } catch (error) {
    console.error("Error scraping lottery numbers:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
    throw error
  }
}

// Fallback function that returns mock data based on the screenshot
export function getMockLotteryData(): LotteryResult[] {
  return [
    { city: "Ciudad", number: "3331", lastTwoDigits: "31" },
    { city: "Provincia", number: "6317", lastTwoDigits: "17" },
    { city: "Córdoba", number: "4528", lastTwoDigits: "28" },
    { city: "Santa Fe", number: "9661", lastTwoDigits: "61" },
    { city: "Entre Ríos", number: "3334", lastTwoDigits: "34" },
    { city: "Montevideo", number: "0000", lastTwoDigits: "00" }, // Placeholder
    { city: "Mendoza", number: "9092", lastTwoDigits: "92" },
    { city: "Corrientes", number: "8292", lastTwoDigits: "92" },
    { city: "Chaco", number: "7982", lastTwoDigits: "82" },
    { city: "Santiago", number: "1385", lastTwoDigits: "85" },
    { city: "Neuquén", number: "8873", lastTwoDigits: "73" },
    { city: "San Luis", number: "1378", lastTwoDigits: "78" },
  ]
}


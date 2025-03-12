import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch("https://vivitusuerte.com/cabezas", {
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
      signal: controller.signal,
      next: { revalidate: 60 }, // Revalidate every minute
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    // Return a specific error code for timeout
    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse(JSON.stringify({ error: "La solicitud ha excedido el tiempo de espera" }), {
        status: 408,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    return new NextResponse(JSON.stringify({ error: "Error al obtener los datos" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}


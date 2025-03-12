"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LotteryResult {
  city: string
  number: string
  lastTwoDigits: string
}

export default function LotterySearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<LotteryResult[]>([])
  const [filteredResults, setFilteredResults] = useState<LotteryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/lottery")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Check if this is mock data (simple heuristic)
      // If all cities from mock data are present, it's likely mock data
      const mockCities = ["Ciudad", "Provincia", "Córdoba", "Santa Fe", "Entre Ríos"]
      const matchCount = mockCities.filter((city) => data.some((item: LotteryResult) => item.city === city)).length

      setIsMockData(matchCount >= 4) // If 4 or more mock cities are present

      setResults(data)
      setFilteredResults(data)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Error al cargar los datos. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = results.filter((result) => result.lastTwoDigits.includes(searchTerm))
      setFilteredResults(filtered)
    } else {
      setFilteredResults(results)
    }
  }, [searchTerm, results])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  return (
    <div className="space-y-6">
      {isMockData && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <AlertTitle>Datos de ejemplo</AlertTitle>
          <AlertDescription>
            No se pudo conectar con el sitio web original. Mostrando datos de ejemplo basados en la captura de pantalla.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Buscar por últimas dos cifras</CardTitle>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing || loading}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Actualizar datos</span>
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ingresa las cifras a buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados {searchTerm && `para "${searchTerm}"`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando resultados...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Número Completo</TableHead>
                  <TableHead>Últimas dos cifras</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.city}</TableCell>
                      <TableCell>{result.number}</TableCell>
                      <TableCell className="font-bold">{result.lastTwoDigits}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No se encontraron resultados para "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


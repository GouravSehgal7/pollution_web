"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"
import { NavigationBar } from "@/components/navigation-bar"
import { PollutionIndex } from "@/components/pollution-index"
import { fetchDelhiAQIData } from "@/lib/aqi-service"
import { getAQIHealthRecommendations, getAQIProtectionMeasures } from "@/lib/aqi-service"

export default function AQIDetailsPage() {
  const [aqiData, setAqiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAQIData = async () => {
      try {
        setLoading(true)
        const data = await fetchDelhiAQIData()
        setAqiData(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching AQI data:", err)
        setError("Failed to load air quality data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadAQIData()
  }, [])

  // Get health recommendations and protection measures
  const healthRecommendations = aqiData ? getAQIHealthRecommendations(aqiData.aqi) : []
  const protectionMeasures = aqiData ? getAQIProtectionMeasures(aqiData.aqi) : []

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <NavigationBar />

      <div className="container relative mx-auto py-6 pt-20 space-y-6 z-10">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="bg-white/10 text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">AQI Details</h1>
        </div>

        {loading ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Error</CardTitle>
              <CardDescription className="text-white/70">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : aqiData ? (
          <>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Current Air Quality</CardTitle>
                <CardDescription className="text-white/70">Real-time AQI data for {aqiData.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <PollutionIndex value={aqiData.aqi} size="lg" />
                    <p className="mt-2 text-sm text-white/70">Updated: {new Date().toLocaleTimeString()}</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: aqiData.color }}></div>
                      <span className="text-xl font-bold text-white">{aqiData.category}</span>
                    </div>

                    <div className="text-white/70 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Primary pollutant: {aqiData.primaryPollutant.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-md bg-red-500/20 mt-2">
                      <p className="text-sm text-white">
                        This AQI level is <span className="font-bold">{aqiData.category.toLowerCase()}</span> and may
                        cause serious health effects.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Health Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {healthRecommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                        <p className="text-sm text-white/90">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Protection Measures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {protectionMeasures.map((measure, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                        <p className="text-sm text-white/90">{measure}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Pollutant Details</CardTitle>
                <CardDescription className="text-white/70">Current levels of major air pollutants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(aqiData.pollutants)
                    .slice(0, 8)
                    .map(([key, data]: [string, any]) => (
                      <div key={key} className="p-3 rounded-md bg-white/10">
                        <div className="text-sm font-medium text-white mb-1">{key.toUpperCase()}</div>
                        <div className="flex items-end gap-1">
                          <span className="text-xl font-bold text-white">{data.value}</span>
                          <span className="text-sm text-white/70">{data.unit}</span>
                        </div>
                        <div className="mt-1 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (data.value / data.max) * 100)}%`,
                              backgroundColor: key === aqiData.primaryPollutant ? aqiData.color : undefined,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Link href="/notification-settings">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Manage Notification Settings</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}


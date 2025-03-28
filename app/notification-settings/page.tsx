"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"
import { NotificationPreferencesForm } from "@/components/notification-preferences-form"
import { NotificationHistoryList } from "@/components/notification-history-list"
import { NavigationBar } from "@/components/navigation-bar"
import { initMessaging } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize Firebase messaging
    const messaging = initMessaging()

    // Get or create user ID from local storage
    const storedUserId = localStorage.getItem("userId")
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      // Generate a random user ID if none exists
      const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem("userId", newUserId)
      setUserId(newUserId)
    }

    setIsLoading(false)

    // Check if service worker is registered
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const hasServiceWorker = registrations.some((registration) =>
          registration.active?.scriptURL.includes("firebase-messaging-sw.js"),
        )

        if (!hasServiceWorker) {
          console.log("Service worker not found, registering...")
          // Register service worker with Firebase config
          navigator.serviceWorker
            .register("/firebase-messaging-sw.js")
            .then((registration) => {
              console.log("Service Worker registered with scope:", registration.scope)

              // Pass Firebase config to service worker
              if (registration.active) {
                registration.active.postMessage({
                  type: "FIREBASE_CONFIG",
                  config: {
                    FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                    FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                    FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                    FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                    FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
                  },
                })
              }
            })
            .catch((error) => {
              console.error("Service Worker registration failed:", error)
              toast({
                title: "Service Worker Error",
                description: "Failed to register notification service. Some features may not work properly.",
                variant: "destructive",
              })
            })
        }
      })
    }
  }, [toast])

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
          <h1 className="text-3xl font-bold tracking-tight text-white">Notification Settings</h1>
        </div>

        {isLoading ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </CardContent>
          </Card>
        ) : userId ? (
          <Tabs defaultValue="preferences">
            <TabsList className="bg-white/10 text-white">
              <TabsTrigger value="preferences" className="data-[state=active]:bg-white/20">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white/20">
                Notification History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preferences" className="mt-4">
              <NotificationPreferencesForm userId={userId} />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <NotificationHistoryList userId={userId} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Error</CardTitle>
              <CardDescription className="text-white/70">
                Unable to load user information. Please refresh the page and try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


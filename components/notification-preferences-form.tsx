"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Bell, BellOff, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { requestNotificationPermission } from "@/lib/firebase"
import { getAQICategory } from "@/lib/aqi-service"

interface NotificationPreferencesFormProps {
  userId: string
}

export function NotificationPreferencesForm({ userId }: NotificationPreferencesFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "default">("default")
  const [fcmToken, setFcmToken] = useState<string | null>(null)

  // Notification preferences
  const [preferences, setPreferences] = useState({
    enabled: true,
    soundEnabled: true,
    threshold: 150,
    notificationTime: "08:00",
    notifyOnThresholdCrossed: true,
    notifyOnImprovement: true,
    notifyOnWorsening: true,
    dailySummary: true,
  })

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (!userId) return

        const response = await fetch(`/api/notifications/preferences?userId=${userId}`)

        if (response.ok) {
          const data = await response.json()
          setPreferences((prev) => ({
            ...prev,
            ...data,
          }))

          if (data.fcmToken) {
            setFcmToken(data.fcmToken)
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    }

    loadPreferences()
  }, [userId])

  // Check notification permission status
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  // Handle toggle changes
  const handleToggle = (setting: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  // Handle threshold change
  const handleThresholdChange = (value: number[]) => {
    setPreferences((prev) => ({
      ...prev,
      threshold: value[0],
    }))
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences((prev) => ({
      ...prev,
      notificationTime: e.target.value,
    }))
  }

  // Request notification permission
  // const requestPermission = async () => {
  //   setLoading(true)
  //   try {
  //     const token = await requestNotificationPermission()
  //     setFcmToken(token)
  //     setPermissionStatus("granted")

  //     toast({
  //       title: "Notifications enabled",
  //       description: "You will now receive AQI alerts at your specified time.",
  //     })
  //   } catch (error) {
  //     console.error("Error requesting permission:", error)
  //     toast({
  //       title: "Permission denied",
  //       description: "Please enable notifications in your browser settings to receive AQI alerts.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  async function requestPermission() {
    try {
      const permissionGranted = await requestNotificationPermission()
  
      if (!permissionGranted) {
        console.warn("Notifications are blocked. Please enable them in settings.")
        return
      }
  
      console.log("Fetching FCM token...")
      const token = await messaging.getToken()
      console.log("FCM Token:", token)
    } catch (error) {
      console.error("Error requesting permission:", error)
    }
  }
  

  // Save preferences
  const savePreferences = async () => {
    setLoading(true)
    try {
      if (!userId) {
        throw new Error("User ID is required")
      }

      const prefsToSave = {
        ...preferences,
        fcmToken,
      }

      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...prefsToSave,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save preferences")
      }

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error saving preferences",
        description: "An error occurred while saving your preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get AQI category for preview
  const { category, color } = getAQICategory(preferences.threshold)

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="h-5 w-5 text-blue-400" />
          AQI Notification Preferences
        </CardTitle>
        <CardDescription className="text-white/70">
          Customize when and how you receive air quality alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionStatus !== "granted" && (
          <div className="p-4 rounded-md bg-amber-500/20 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="font-medium text-white">Notification Permission Required</h3>
            </div>
            <p className="text-sm text-white/80 mb-3">
              To receive AQI alerts, you need to grant notification permission to this website.
            </p>
            <Button
              onClick={requestPermission}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? "Requesting..." : "Enable Notifications"}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {preferences.enabled ? (
              <Bell className="h-5 w-5 text-blue-400" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <Label htmlFor="notifications-enabled" className="text-white font-medium">
              AQI Notifications
            </Label>
          </div>
          <Switch
            id="notifications-enabled"
            checked={preferences.enabled}
            onCheckedChange={() => handleToggle("enabled")}
            disabled={permissionStatus !== "granted"}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className="text-white">
              Sound Alerts
            </Label>
            <Switch
              id="sound-enabled"
              checked={preferences.soundEnabled}
              onCheckedChange={() => handleToggle("soundEnabled")}
              disabled={!preferences.enabled || permissionStatus !== "granted"}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="aqi-threshold" className="text-white">
                AQI Alert Threshold
              </Label>
              <span className="text-sm font-medium text-white">{preferences.threshold}</span>
            </div>
            <Slider
              id="aqi-threshold"
              value={[preferences.threshold]}
              min={50}
              max={300}
              step={10}
              onValueChange={handleThresholdChange}
              disabled={!preferences.enabled || permissionStatus !== "granted"}
              className="[&_[role=slider]]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-white/70">
              <span>Good (50)</span>
              <span>Moderate (100)</span>
              <span>Unhealthy (150)</span>
              <span>Severe (300)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-time" className="text-white">
              Notification Time
            </Label>
            <Input
              id="notification-time"
              type="time"
              value={preferences.notificationTime}
              onChange={handleTimeChange}
              disabled={!preferences.enabled || permissionStatus !== "granted"}
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-xs text-white/70">
              You will receive one notification per day at this time if conditions meet your preferences
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-white">Alert Types</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="threshold-crossed" className="text-sm text-white/80">
                When AQI exceeds threshold
              </Label>
              <Switch
                id="threshold-crossed"
                checked={preferences.notifyOnThresholdCrossed}
                onCheckedChange={() => handleToggle("notifyOnThresholdCrossed")}
                disabled={!preferences.enabled || permissionStatus !== "granted"}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="aqi-improvement" className="text-sm text-white/80">
                When AQI improves significantly
              </Label>
              <Switch
                id="aqi-improvement"
                checked={preferences.notifyOnImprovement}
                onCheckedChange={() => handleToggle("notifyOnImprovement")}
                disabled={!preferences.enabled || permissionStatus !== "granted"}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="aqi-worsening" className="text-sm text-white/80">
                When AQI worsens significantly
              </Label>
              <Switch
                id="aqi-worsening"
                checked={preferences.notifyOnWorsening}
                onCheckedChange={() => handleToggle("notifyOnWorsening")}
                disabled={!preferences.enabled || permissionStatus !== "granted"}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="daily-summary" className="text-sm text-white/80">
                Daily AQI summary
              </Label>
              <Switch
                id="daily-summary"
                checked={preferences.dailySummary}
                onCheckedChange={() => handleToggle("dailySummary")}
                disabled={!preferences.enabled || permissionStatus !== "granted"}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md bg-blue-500/20 p-3">
          <div className="flex items-center gap-2 text-blue-100">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">Notification Preview</span>
          </div>
          <div className="mt-2 p-2 bg-black/30 rounded border border-white/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-white">AQI has reached {preferences.threshold} in your area</span>
            </div>
            <p className="mt-1 text-xs text-white/70">
              Current status: <span style={{ color }}>{category}</span>. Consider wearing a mask and limiting outdoor
              activities.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={savePreferences}
          disabled={loading || permissionStatus !== "granted"}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface NotificationTestButtonProps {
  userId: string
}

export function NotificationTestButton({ userId }: NotificationTestButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const sendTestNotification = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Test notification sent",
          description: "You should receive a notification shortly.",
        })
      } else {
        throw new Error(data.error || "Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send test notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={sendTestNotification}
      disabled={loading}
      variant="outline"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
    >
      <Bell className="mr-2 h-4 w-4" />
      {loading ? "Sending..." : "Send Test Notification"}
    </Button>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AlertTriangle, Bell, CheckCircle, Info } from "lucide-react"

interface NotificationHistoryProps {
  userId: string
  limit?: number
}

interface Notification {
  id: string
  title: string
  body: string
  sentAt: Date
  aqi: number
  category: string
  read: boolean
}

export function NotificationHistory({ userId, limit: limitCount = 10 }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)

        const notificationsRef = collection(db, "users", userId, "notifications")
        const q = query(notificationsRef, orderBy("sentAt", "desc"), limit(limitCount))

        const querySnapshot = await getDocs(q)

        const notificationsList: Notification[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          notificationsList.push({
            id: doc.id,
            title: data.title,
            body: data.body,
            sentAt: data.sentAt.toDate(),
            aqi: data.aqi,
            category: data.category,
            read: data.read || false,
          })
        })

        setNotifications(notificationsList)
        setError(null)
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError("Failed to load notification history")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchNotifications()
    }
  }, [userId, limitCount])

  // Get icon based on notification category
  const getNotificationIcon = (category: string) => {
    if (category === "alert") {
      return <AlertTriangle className="h-5 w-5 text-red-400" />
    } else if (category === "improvement") {
      return <CheckCircle className="h-5 w-5 text-green-400" />
    } else if (category === "worsening") {
      return <AlertTriangle className="h-5 w-5 text-amber-400" />
    } else {
      return <Bell className="h-5 w-5 text-blue-400" />
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Notification History</CardTitle>
        <CardDescription className="text-white/70">Your recent AQI notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-white/70">
            <Info className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-white/70">
            <Bell className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p>No notifications yet</p>
            <p className="text-sm mt-1">You'll see your AQI alerts here once you receive them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-md border ${notification.read ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.category)}</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                    <p className="text-xs text-white/70 mt-1">{notification.body}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-white/50">{notification.sentAt.toLocaleString()}</span>
                      <span className="text-xs font-medium text-white/80">AQI: {notification.aqi}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


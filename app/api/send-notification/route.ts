import { NextResponse } from "next/server"
import { getAllNotificationPreferences, createNotificationHistory } from "@/lib/notification-model"
import { getAQICategory, getAQIHealthRecommendations } from "@/lib/aqi-service"
import { fetchDelhiAQIData } from "@/lib/aqi-service"

// Helper function to check if it's time to send a notification
function shouldSendNotification(preference: any): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Parse the notification time
  const [hours, minutes] = preference.notificationTime.split(":").map(Number)

  // Check if current time is within 5 minutes of scheduled time
  const hourMatches = hours === currentHour
  const minuteDiff = Math.abs(minutes - currentMinute)

  return hourMatches && minuteDiff <= 5
}

// Helper function to create notification content
async function createNotificationContent(preference: any) {
  try {
    // Fetch current AQI data
    const aqiData = await fetchDelhiAQIData()

    // Get AQI category and recommendations
    const { category, color } = getAQICategory(aqiData.aqi)
    const recommendations = getAQIHealthRecommendations(aqiData.aqi)

    // Check if AQI exceeds user's threshold
    const exceedsThreshold = aqiData.aqi >= preference.threshold

    // Create notification content
    let title = `Current AQI: ${aqiData.aqi} (${category})`
    let body = recommendations[0] // First recommendation
    let notificationType: "alert" | "improvement" | "worsening" | "summary" = "summary"

    if (exceedsThreshold && preference.notifyOnThresholdCrossed) {
      title = `⚠️ AQI Alert: ${aqiData.aqi} exceeds your threshold!`
      body = `Current air quality is ${category}. ${recommendations[0]}`
      notificationType = "alert"
    } else if (preference.dailySummary) {
      title = `Daily AQI Summary: ${aqiData.aqi}`
      body = `Air quality is currently ${category}. ${recommendations[0]}`
      notificationType = "summary"
    }

    return {
      title,
      body,
      aqi: aqiData.aqi,
      category: notificationType,
      icon: "/icons/aqi-icon-192x192.png",
      data: {
        aqi: aqiData.aqi,
        category,
        color,
        url: "/aqi-details",
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error creating notification content:", error)
    throw error
  }
}

// Send notification to FCM
async function sendFCMNotification(token: string, notification: any) {
  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
        },
        data: notification.data,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`FCM error: ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending FCM notification:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Get all user preferences
    const preferences = await getAllNotificationPreferences()

    const notificationsSent = []
    const errors = []

    // Process each user's preferences
    for (const preference of preferences) {
      try {
        // Skip if no FCM token
        if (!preference.fcmToken) continue

        // Check if it's time to send a notification
        if (shouldSendNotification(preference)) {
          // Create notification content
          const notificationContent = await createNotificationContent(preference)

          // Send notification
          await sendFCMNotification(preference.fcmToken, notificationContent)

          // Record notification in history
          await createNotificationHistory({
            userId: preference.userId,
            title: notificationContent.title,
            body: notificationContent.body,
            aqi: notificationContent.aqi,
            category: notificationContent.category,
            read: false,
            sentAt: new Date(),
          })

          notificationsSent.push({
            userId: preference.userId.toString(),
            notification: notificationContent,
          })
        }
      } catch (error) {
        console.error(`Error processing user ${preference.userId}:`, error)
        errors.push({
          userId: preference.userId.toString(),
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors,
    })
  } catch (error) {
    console.error("Error in send-notification API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}


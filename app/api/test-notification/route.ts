import { NextResponse } from "next/server"
import { getNotificationPreferenceByUserId, createNotificationHistory } from "@/lib/notification-model"
import { getAQICategory, getAQIHealthRecommendations } from "@/lib/aqi-service"
import { fetchDelhiAQIData } from "@/lib/aqi-service"

// Helper function to create notification content
async function createNotificationContent(preference: any) {
  try {
    // Fetch current AQI data
    const aqiData = await fetchDelhiAQIData()

    // Get AQI category and recommendations
    const { category, color } = getAQICategory(aqiData.aqi)
    const recommendations = getAQIHealthRecommendations(aqiData.aqi)

    // Create test notification content
    const title = `Test Notification: AQI ${aqiData.aqi}`
    const body = `This is a test notification. Current air quality is ${category}. ${recommendations[0]}`

    return {
      title,
      body,
      aqi: aqiData.aqi,
      category: "summary" as const,
      icon: "/icons/aqi-icon-192x192.png",
      data: {
        aqi: aqiData.aqi,
        category,
        color,
        url: "/aqi-details",
        timestamp: new Date().toISOString(),
        isTest: true,
      },
    }
  } catch (error) {
    console.error("Error creating test notification content:", error)
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
    console.error("Error sending FCM test notification:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Get user preferences
    const preferences = await getNotificationPreferenceByUserId(userId)

    if (!preferences) {
      return NextResponse.json({ success: false, error: "User preferences not found" }, { status: 404 })
    }

    // Check if FCM token exists
    if (!preferences.fcmToken) {
      return NextResponse.json(
        { success: false, error: "FCM token not found. Please enable notifications first." },
        { status: 400 },
      )
    }

    // Create notification content
    const notificationContent = await createNotificationContent(preferences)

    // Send notification
    const result = await sendFCMNotification(preferences.fcmToken, notificationContent)

    // Record test notification in history
    await createNotificationHistory({
      userId: preferences.userId,
      title: notificationContent.title,
      body: notificationContent.body,
      aqi: notificationContent.aqi,
      category: notificationContent.category,
      read: false,
      sentAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
      result,
    })
  } catch (error) {
    console.error("Error in test-notification API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}


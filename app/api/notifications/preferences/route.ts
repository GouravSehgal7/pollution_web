import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import {
  createNotificationPreference,
  getNotificationPreferenceByUserId,
  updateNotificationPreference,
} from "@/lib/notification-model"

// GET /api/notifications/preferences?userId=123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const preferences = await getNotificationPreferenceByUserId(userId)

    if (!preferences) {
      return NextResponse.json({ error: "Notification preferences not found" }, { status: 404 })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ error: "Failed to fetch notification preferences" }, { status: 500 })
  }
}

// POST /api/notifications/preferences
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, ...prefData } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const userIdQuery = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    // Check if preferences already exist
    const existingPrefs = await getNotificationPreferenceByUserId(userId)

    if (existingPrefs) {
      // Update existing preferences
      
      const updatedPrefs = await updateNotificationPreference(userId, prefData)
      return NextResponse.json(updatedPrefs)
    } else {
      // Create new preferences
      const newPrefs = await createNotificationPreference({
        userId: userIdQuery,
        enabled: prefData.enabled ?? true,
        fcmToken: prefData.fcmToken,
        notificationTime: prefData.notificationTime ?? "08:00",
        threshold: prefData.threshold ?? 150,
        soundEnabled: prefData.soundEnabled ?? true,
        notifyOnThresholdCrossed: prefData.notifyOnThresholdCrossed ?? true,
        notifyOnImprovement: prefData.notifyOnImprovement ?? true,
        notifyOnWorsening: prefData.notifyOnWorsening ?? true,
        dailySummary: prefData.dailySummary ?? true,
      })
      return NextResponse.json(newPrefs)
    }
  } catch (error) {
    console.error("Error saving notification preferences:", error)
    return NextResponse.json({ error: "Failed to save notification preferences" }, { status: 500 })
  }
}

// PUT /api/notifications/preferences?userId=123
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const body = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updatedPrefs = await updateNotificationPreference(userId, body)

    if (!updatedPrefs) {
      return NextResponse.json({ error: "Notification preferences not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPrefs)
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ error: "Failed to update notification preferences" }, { status: 500 })
  }
}


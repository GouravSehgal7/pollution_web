import { NextResponse } from "next/server"
import { getNotificationHistoryByUserId, markNotificationAsRead } from "@/lib/notification-model"

// GET /api/notifications/history?userId=123&limit=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 10

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const history = await getNotificationHistoryByUserId(userId, limit)

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching notification history:", error)
    return NextResponse.json({ error: "Failed to fetch notification history" }, { status: 500 })
  }
}

// PATCH /api/notifications/history?id=123
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const success = await markNotificationAsRead(notificationId)

    if (!success) {
      return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}


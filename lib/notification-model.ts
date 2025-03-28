import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"

// Define the NotificationPreference interface
export interface NotificationPreference {
  _id?: ObjectId
  userId: ObjectId
  enabled: boolean
  fcmToken?: string
  notificationTime: string // Single time in "HH:MM" format
  threshold: number // AQI threshold
  soundEnabled: boolean
  notifyOnThresholdCrossed: boolean
  notifyOnImprovement: boolean
  notifyOnWorsening: boolean
  dailySummary: boolean
  createdAt: Date
  updatedAt: Date
}

// Define the NotificationHistory interface
export interface NotificationHistory {
  _id?: ObjectId
  userId: ObjectId
  title: string
  body: string
  aqi: number
  category: "alert" | "improvement" | "worsening" | "summary"
  read: boolean
  sentAt: Date
  createdAt: Date
}

// Database and collection names
const DB_NAME = "pollution_monitoring"
const PREF_COLLECTION = "notification_preferences"
const HISTORY_COLLECTION = "notification_history"

// Notification preference operations
export async function createNotificationPreference(
  prefData: Omit<NotificationPreference, "_id" | "createdAt" | "updatedAt">,
): Promise<NotificationPreference> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationPreference>(PREF_COLLECTION)

    const now = new Date()
    const newPref: NotificationPreference = {
      ...prefData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newPref)

    return {
      ...newPref,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Error creating notification preference:", error)
    throw new Error("Failed to create notification preference")
  }
}

export async function getNotificationPreferenceByUserId(userId: string): Promise<NotificationPreference | null> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationPreference>(PREF_COLLECTION)

    return await collection.findOne({ userId: new ObjectId(userId) })
  } catch (error) {
    console.error("Error fetching notification preference:", error)
    throw new Error("Failed to fetch notification preference")
  }
}

export async function updateNotificationPreference(
  userId: string,
  prefData: Partial<NotificationPreference>,
): Promise<NotificationPreference | null> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationPreference>(PREF_COLLECTION)

    const result = await collection.findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $set: {
          ...prefData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result
  } catch (error) {
    console.error("Error updating notification preference:", error)
    throw new Error("Failed to update notification preference")
  }
}

// Get all notification preferences for scheduled notifications
export async function getAllNotificationPreferences(): Promise<NotificationPreference[]> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationPreference>(PREF_COLLECTION)

    return await collection.find({ enabled: true }).toArray()
  } catch (error) {
    console.error("Error fetching all notification preferences:", error)
    throw new Error("Failed to fetch notification preferences")
  }
}

// Notification history operations
export async function createNotificationHistory(
  historyData: Omit<NotificationHistory, "_id" | "createdAt">,
): Promise<NotificationHistory> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationHistory>(HISTORY_COLLECTION)

    const now = new Date()
    const newHistory: NotificationHistory = {
      ...historyData,
      createdAt: now,
    }

    const result = await collection.insertOne(newHistory)

    return {
      ...newHistory,
      _id: result.insertedId,
    }
  } catch (error) {
    console.error("Error creating notification history:", error)
    throw new Error("Failed to create notification history")
  }
}

export async function getNotificationHistoryByUserId(userId: string, limit = 10): Promise<NotificationHistory[]> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationHistory>(HISTORY_COLLECTION)

    return await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray()
  } catch (error) {
    console.error("Error fetching notification history:", error)
    throw new Error("Failed to fetch notification history")
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection<NotificationHistory>(HISTORY_COLLECTION)

    const result = await collection.updateOne({ _id: new ObjectId(notificationId) }, { $set: { read: true } })

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw new Error("Failed to mark notification as read")
  }
}


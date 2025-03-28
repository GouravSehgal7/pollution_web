import { NextResponse } from "next/server"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { fetchDelhiAQIData } from "@/lib/aqi-service"

// Initialize Firebase Admin
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig, "server-scheduler")
const db = getFirestore(app)

// This endpoint is meant to be called by a CRON job every 5 minutes
export async function GET(request: Request) {
  try {
    // Get current AQI data
    const aqiData = await fetchDelhiAQIData()

    // Get all user preferences
    const prefsSnapshot = await getDocs(collection(db, "userPreferences"))

    // Count of users that will receive notifications
    let scheduledCount = 0

    // Current time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Process each user's preferences
    for (const doc of prefsSnapshot.docs) {
      const preferences = doc.data()

      // Skip if notifications are disabled
      if (!preferences.enabled) continue

      // Check if any notification time matches current time (within 5 minute window)
      const shouldNotify = preferences.notificationTimes.some((timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number)

        // Check if current time is within 5 minutes of scheduled time
        const hourMatches = hours === currentHour
        const minuteDiff = Math.abs(minutes - currentMinute)
        return hourMatches && minuteDiff <= 5
      })

      if (shouldNotify) {
        scheduledCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notification schedule checked",
      currentAqi: aqiData.aqi,
      currentTime: now.toISOString(),
      usersToNotify: scheduledCount,
      totalUsers: prefsSnapshot.size,
    })
  } catch (error) {
    console.error("Error in schedule-notifications API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}


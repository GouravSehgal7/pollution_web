// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const functions = getFunctions(app)

// Initialize Firebase Cloud Messaging (only on client-side)
export const initMessaging = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    return getMessaging(app)
  }
  return null
}

// Request permission and get FCM token
// export const requestNotificationPermission = async () => {
//   try {
//     const messaging = initMessaging()
//     if (!messaging) throw new Error("Firebase messaging not initialized")

//     if (Notification.permission !== "granted") {
//       const permission = await Notification.requestPermission()
//       if (permission !== "granted") {
//         throw new Error("Notification permission denied")
//       }
//     }

//     const currentToken = await getToken(messaging, {
//       vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
//     })

//     if (!currentToken) throw new Error("No registration token available")

//     console.log("FCM token:", currentToken)
//     return currentToken
//   } catch (error) {
//     console.error("Error getting notification permission:", error)
//     throw error
//   }
// }

export async function requestNotificationPermission() {
  console.log("Requesting notification permission...")

  const permission = await Notification.requestPermission()

  if (permission === "granted") {
    console.log("Notification permission granted ✅")
    return true
  } else if (permission === "denied") {
    console.error("User denied the notification permission ❌")
    alert("Notifications are blocked! Please allow them in browser settings.")
    return false
  } else {
    console.warn("Notification permission dismissed ⚠️")
    return false
  }
}



// Handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = initMessaging()
  if (!messaging) return () => {}

  return onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload)
    callback(payload)
  })
}

export default app

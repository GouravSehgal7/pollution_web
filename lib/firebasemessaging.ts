"use client"
import { useEffect } from "react"

export function FirebaseMessaging() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)

          // Send Firebase config **after** service worker is ready
          navigator.serviceWorker.ready.then((registration) => {
            registration.active?.postMessage({
              type: "FIREBASE_CONFIG",
              config: {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
              },
            })
          })
        })
        .catch((error) => console.error("Service Worker registration failed:", error))
    }
  }, [])

  return null
}

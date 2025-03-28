importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

let firebaseConfig = {} // To store config dynamically

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    firebaseConfig = event.data.config

    firebase.initializeApp(firebaseConfig)
    const messaging = firebase.messaging()

    messaging.onBackgroundMessage((payload) => {
      console.log("Received background message:", payload)

      const { title, body, icon, data } = payload.notification

      self.registration.showNotification(title || "Notification", {
        body: body || "You have a new message!",
        icon: icon || "/default-icon.png",
        data: data || {},
        actions: [
          { action: "open", title: "Open App" },
          { action: "dismiss", title: "Dismiss" },
        ],
      })
    })
  }
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === "/" && "focus" in client) return client.focus()
        }
        return clients.openWindow("/")
      }),
  )
})

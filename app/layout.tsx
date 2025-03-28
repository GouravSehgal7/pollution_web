import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"
import { LocationAccess } from "@/components/location-access"
import { AlertNotification } from "@/components/alert-notification"
// import Script from "next/script"
import { FirebaseMessaging } from "@/lib/firebasemessaging"
import { ClientProvider } from "@/hooks/clientprovider"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Pollution Monitoring System",
  description: "Real-time monitoring of air quality, water quality, UV index, and traffic pollution",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head></head>
      <body className={inter.className}>
        <ClientProvider>
          {children}
          <LocationAccess />
          <AlertNotification />
          <FirebaseMessaging />
        </ClientProvider>
      </body>
    </html>
  )
}
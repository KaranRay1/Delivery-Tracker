import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SocketProvider } from "@/components/socket-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeliveryTracker Pro - Real-time Delivery Management",
  description: "Professional multivendor delivery platform with real-time tracking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          {children}
          <Toaster />
        </SocketProvider>
      </body>
    </html>
  )
}

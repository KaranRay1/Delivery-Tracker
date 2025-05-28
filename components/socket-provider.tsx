"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only initialize socket on client side
    if (typeof window === "undefined") return

    const socketInstance = io({
      path: "/api/socket",
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000,
      forceNew: true,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.warn("Socket connection error (using fallback):", error.message)
      setIsConnected(false)
      // Don't throw error, just log it and continue with fallback
    })

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts")
      setIsConnected(true)
    })

    socketInstance.on("reconnect_error", (error) => {
      console.warn("Socket reconnection failed:", error.message)
    })

    setSocket(socketInstance)

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

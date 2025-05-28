"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Truck, MapPin, Home, Wifi, WifiOff } from "lucide-react"
import { useSocket } from "@/components/socket-provider"

export function Navigation() {
  const pathname = usePathname()
  const { isConnected } = useSocket()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/vendor", label: "Vendor Dashboard", icon: Store },
    { href: "/delivery", label: "Delivery Dashboard", icon: Truck },
    { href: "/track", label: "Track Order", icon: MapPin },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DeliveryTracker Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <Badge variant={isConnected ? "default" : "secondary"} className="hidden sm:flex items-center gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Real-time" : "Offline Mode"}
            </Badge>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

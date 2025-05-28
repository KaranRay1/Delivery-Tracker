"use client"

import { Navigation } from "@/components/navigation"
import { useSocket } from "@/components/socket-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import type { Order, Location, DeliveryPartner } from "@/types"
import { MapPin, Play, Square, NavigationIcon, User, Star, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DeliveryDashboard() {
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>("delivery-1")
  const [isAvailable, setIsAvailable] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedPartner])

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("orderAssigned", (data) => {
        if (data.deliveryPartnerId === selectedPartner) {
          setOrders((prev) => {
            const exists = prev.find((o) => o.id === data.orderId)
            if (exists) {
              return prev.map((o) => (o.id === data.orderId ? data.order : o))
            }
            return [data.order, ...prev]
          })
          toast({
            title: "New Order Assigned",
            description: `Order #${data.orderId} has been assigned to you`,
          })
        }
      })

      return () => {
        socket.off("orderAssigned")
      }
    } else {
      // Fallback: Poll for updates every 30 seconds when socket is not available
      const interval = setInterval(() => {
        fetchData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [socket, isConnected, toast, selectedPartner])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersRes, partnersRes] = await Promise.all([
        fetch(`/api/orders/delivery?deliveryPartnerId=${selectedPartner}`),
        fetch("/api/delivery-partners"),
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json()
        setDeliveryPartners(partnersData)
        const currentPartner = partnersData.find((p: DeliveryPartner) => p.id === selectedPartner)
        if (currentPartner) {
          setIsAvailable(currentPartner.isAvailable)
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async (available: boolean) => {
    try {
      const response = await fetch("/api/delivery-partners/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPartnerId: selectedPartner, isAvailable: available }),
      })

      if (response.ok) {
        setIsAvailable(available)
        toast({
          title: available ? "You're now available" : "You're now offline",
          description: available ? "You can receive new orders" : "You won't receive new orders",
        })
      }
    } catch (error) {
      console.error("Failed to update availability:", error)
    }
  }

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: position.coords.accuracy,
            })
          },
          () => {
            // Fallback to simulated location
            const baseLocation = { lat: 40.7589, lng: -73.9851 }
            const randomOffset = () => (Math.random() - 0.5) * 0.01
            resolve({
              latitude: baseLocation.lat + randomOffset(),
              longitude: baseLocation.lng + randomOffset(),
              timestamp: new Date().toISOString(),
              accuracy: 5,
            })
          },
        )
      } else {
        // Simulate location movement
        const baseLocation = { lat: 40.7589, lng: -73.9851 }
        const randomOffset = () => (Math.random() - 0.5) * 0.01
        resolve({
          latitude: baseLocation.lat + randomOffset(),
          longitude: baseLocation.lng + randomOffset(),
          timestamp: new Date().toISOString(),
          accuracy: 5,
        })
      }
    })
  }

  const startTracking = async (orderId: string) => {
    try {
      const location = await getCurrentLocation()
      setCurrentLocation(location)
      setIsTracking(true)
      setActiveOrderId(orderId)

      // Update order status to picked_up
      await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "picked_up" }),
      })

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "picked_up" } : order)))

      // Start location tracking interval
      const interval = setInterval(async () => {
        try {
          const newLocation = await getCurrentLocation()
          setCurrentLocation(newLocation)

          // Send location update
          await fetch("/api/location/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              deliveryPartnerId: selectedPartner,
              location: newLocation,
            }),
          })

          // Emit location update via socket only if connected
          if (socket && isConnected) {
            socket.emit("locationUpdate", {
              orderId,
              deliveryPartnerId: selectedPartner,
              location: newLocation,
              status: "in_transit",
            })
          }
        } catch (error) {
          console.error("Failed to update location:", error)
        }
      }, 3000) // Update every 3 seconds

      setTrackingInterval(interval)

      toast({
        title: "Tracking Started",
        description: `Started tracking for order #${orderId}`,
      })
    } catch (error) {
      console.error("Failed to start tracking:", error)
      toast({
        title: "Tracking Failed",
        description: "Failed to start location tracking",
        variant: "destructive",
      })
    }
  }

  const stopTracking = async (orderId: string) => {
    if (trackingInterval) {
      clearInterval(trackingInterval)
      setTrackingInterval(null)
    }

    setIsTracking(false)
    setActiveOrderId(null)

    // Update order status to delivered
    try {
      await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "delivered" }),
      })

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "delivered" } : order)))

      // Emit status update via socket
      if (socket) {
        socket.emit("orderStatusUpdate", {
          orderId,
          status: "delivered",
        })
      }

      toast({
        title: "Order Delivered",
        description: `Order #${orderId} has been marked as delivered`,
      })
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "picked_up":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "in_transit":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const currentPartner = deliveryPartners.find((p) => p.id === selectedPartner)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentPartner?.name || "Delivery Partner"}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Delivery Partner" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      <div className="flex items-center gap-2">
                        <span>{partner.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          ⭐ {partner.rating}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Partner Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPartner && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{currentPartner.name}</p>
                      <p className="text-sm text-gray-500">{currentPartner.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm capitalize">{currentPartner.vehicleType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{currentPartner.rating} Rating</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NavigationIcon className="h-5 w-5" />
                Availability Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="availability" checked={isAvailable} onCheckedChange={updateAvailability} />
                <Label htmlFor="availability">{isAvailable ? "Available for orders" : "Offline"}</Label>
              </div>
              <div className="text-sm text-gray-600">
                {isAvailable ? "You can receive new delivery assignments" : "You will not receive new orders"}
              </div>
              <Badge variant={isAvailable ? "default" : "secondary"}>{isAvailable ? "Online" : "Offline"}</Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant={isTracking ? "default" : "secondary"}>
                  {isTracking ? "Tracking Active" : "Not Tracking"}
                </Badge>
                {currentLocation ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Lat:</strong> {currentLocation.latitude.toFixed(6)}
                    </p>
                    <p className="text-sm">
                      <strong>Lng:</strong> {currentLocation.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Location not available</p>
                )}
                <p className="text-xs text-gray-600">
                  {isTracking
                    ? "Location updates are being sent every 3 seconds"
                    : "Start a delivery to begin tracking"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Assigned Orders
            </CardTitle>
            <CardDescription>Orders assigned to you for delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders assigned yet</p>
                  <p className="text-sm text-gray-400">Make sure you're available to receive orders</p>
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">
                            Customer: {order.customerName} • {order.customerPhone}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Items:</h4>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-green-700">📍 Pickup Address:</p>
                          <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">📍 Delivery Address:</p>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {order.status === "assigned" && !isTracking && (
                          <Button onClick={() => startTracking(order.id)} className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Start Delivery
                          </Button>
                        )}

                        {(order.status === "picked_up" || order.status === "in_transit") &&
                          isTracking &&
                          activeOrderId === order.id && (
                            <Button
                              onClick={() => stopTracking(order.id)}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Square className="h-4 w-4" />
                              Mark as Delivered
                            </Button>
                          )}

                        {order.status === "delivered" && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Square className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

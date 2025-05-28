"use client"

import { Navigation } from "@/components/navigation"
import { useSocket } from "@/components/socket-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Map } from "@/components/map"
import { useEffect, useState } from "react"
import type { Order, Location } from "@/types"
import { MapPin, Package, Clock, Truck, NavigationIcon, Phone, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TrackingPage() {
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState(false)

  useEffect(() => {
    if (socket && isConnected && tracking && order) {
      socket.on("locationUpdate", (data) => {
        if (data.orderId === order.id) {
          setCurrentLocation(data.location)
        }
      })

      socket.on("orderStatusUpdate", (data) => {
        if (data.orderId === order.id) {
          setOrder((prev) => (prev ? { ...prev, status: data.status } : null))

          toast({
            title: "Order Status Updated",
            description: `Your order is now ${data.status.replace("_", " ")}`,
          })
        }
      })

      return () => {
        socket.off("locationUpdate")
        socket.off("orderStatusUpdate")
      }
    } else if (tracking && order) {
      // Fallback: Poll for updates every 5 seconds when socket is not available
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/orders/${order.id}/track`)
          if (response.ok) {
            const data = await response.json()
            setOrder(data.order)
            if (data.currentLocation) {
              setCurrentLocation(data.currentLocation)
            }
          }
        } catch (error) {
          console.error("Failed to poll for updates:", error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [socket, isConnected, tracking, order, toast])

  const trackOrder = async () => {
    if (!orderId.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/track`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setCurrentLocation(data.currentLocation)
        setTracking(true)

        toast({
          title: "Order Found",
          description: `Tracking order #${orderId}`,
        })
      } else {
        toast({
          title: "Order Not Found",
          description: "Please check the order ID and try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to track order:", error)
      toast({
        title: "Tracking Failed",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "picked_up":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "in_transit":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "assigned":
        return <Truck className="h-4 w-4" />
      case "picked_up":
        return <Package className="h-4 w-4" />
      case "in_transit":
        return <NavigationIcon className="h-4 w-4" />
      case "delivered":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getMapMarkers = () => {
    const markers = []

    // Add pickup location
    if (order) {
      markers.push({
        position: order.pickupCoordinates,
        popup: `Pickup: ${order.pickupAddress}`,
        icon: "pickup" as const,
      })

      // Add delivery location
      markers.push({
        position: order.deliveryCoordinates,
        popup: `Delivery: ${order.deliveryAddress}`,
        icon: "dropoff" as const,
      })
    }

    // Add current delivery partner location
    if (currentLocation) {
      markers.push({
        position: [currentLocation.latitude, currentLocation.longitude] as [number, number],
        popup: "Delivery Partner Location",
        icon: "delivery" as const,
      })
    }

    return markers
  }

  const getMapCenter = (): [number, number] => {
    if (currentLocation) {
      return [currentLocation.latitude, currentLocation.longitude]
    }
    if (order) {
      return order.pickupCoordinates
    }
    return [40.7128, -74.006] // Default to NYC
  }

  const getRoutePoints = (): [number, number][] => {
    const points: [number, number][] = []
    
    if (order) {
      points.push(order.pickupCoordinates)
      
      if (currentLocation) {
        points.push([currentLocation.latitude, currentLocation.longitude])
      }
      
      points.push(order.deliveryCoordinates)
    }
    
    return points
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!tracking ? (
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Track Your Order</CardTitle>
                <CardDescription>Enter your order ID to track your delivery in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="Enter order ID (e.g., order-1)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && trackOrder()}
                  />
                </div>
                <Button onClick={trackOrder} className="w-full" size="lg" disabled={loading || !orderId.trim()}>
                  {loading ? "Tracking..." : "Track Order"}
                </Button>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">Demo Order IDs:</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => setOrderId("order-1")}
                      className="block text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      order-1 (In Transit)
                    </button>
                    <button
                      onClick={() => setOrderId("order-2")}
                      className="block text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      order-2 (Pending)
                    </button>
                    <button
                      onClick={() => setOrderId("order-3")}
                      className="block text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      order-3 (Picked Up)
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Live Tracking Map
                  </CardTitle>
                  <CardDescription>
                    Real-time delivery tracking with pickup, current location, and delivery points
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <Map
                    center={getMapCenter()}
                    markers={getMapMarkers()}
                    zoom={14}
                    showRoute={true}
                    routePoints={getRoutePoints()}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Details Sidebar */}
            <div className="space-y-6">
              {/* Order Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order && (
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-lg">Order #{order.id}</p>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerPhone}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Items Ordered:</p>
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
                              <span>Total Amount:</span>
                              <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-green-700 mb-1">📍 Pickup Address:</p>
                          <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-red-700 mb-1">📍 Delivery Address:</p>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>

                        {order.estimatedDeliveryTime && (
                          <div>
                            <p className="text-sm font-medium mb-1">⏰ Estimated Delivery:</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.estimatedDeliveryTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Progress */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${order?.status === "pending" ? "bg-yellow-500" : "bg-green-500"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-gray-500">Order received and confirmed</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${["assigned", "picked_up", "in_transit", "delivered"].includes(order?.status || "") ? "bg-blue-500" : "bg-gray-300"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivery Partner Assigned</p>
                        <p className="text-xs text-gray-500">Partner is on the way to pickup</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${["picked_up", "in_transit", "delivered"].includes(order?.status || "") ? "bg-purple-500" : "bg-gray-300"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order Picked Up</p>
                        <p className="text-xs text-gray-500">Partner has collected your order</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${["in_transit", "delivered"].includes(order?.status || "") ? "bg-orange-500" : "bg-gray-300"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">In Transit</p>
                        <p className="text-xs text-gray-500">On the way to your location</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${order?.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-gray-500">Order successfully delivered</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Location */}
              {currentLocation && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <NavigationIcon className="h-5 w-5" />
                      Live Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Delivery Partner Location</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Latitude:</strong> {currentLocation.latitude.toFixed(6)}
                        </p>
                        <p className="text-sm">
                          <strong>Longitude:</strong> {currentLocation.longitude.toFixed(6)}
                        </p>
                        {currentLocation.accuracy && (
                          <p className="text-sm">
                            <strong>Accuracy:</strong> ±{currentLocation.accuracy}m
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-800">
                          📍 Location updates automatically every 3 seconds
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setTracking(false)
                    setOrder(null)
                    setCurrentLocation(null)
                    setOrderId("")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Track Another Order
                </Button>
                
                {order && (
                  <Button
                    onClick={() => window.open(`tel:${order.customerPhone}`, "_self")}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call Customer
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )\
}

"use client"

import { Navigation } from "@/components/navigation"
import { useSocket } from "@/components/socket-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import type { Order, DeliveryPartner, Vendor } from "@/types"
import { Package, Clock, CheckCircle, Truck, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VendorDashboard() {
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>("vendor-1")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedVendor])

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("orderStatusUpdate", (data) => {
        setOrders((prev) =>
          prev.map((order) => (order.id === data.orderId ? { ...order, status: data.status } : order)),
        )

        toast({
          title: "Order Status Updated",
          description: `Order #${data.orderId} is now ${data.status.replace("_", " ")}`,
        })
      })

      socket.on("newOrder", (order) => {
        if (order.vendorId === selectedVendor) {
          setOrders((prev) => [order, ...prev])
          toast({
            title: "New Order Received",
            description: `Order #${order.id} from ${order.customerName}`,
          })
        }
      })

      return () => {
        socket.off("orderStatusUpdate")
        socket.off("newOrder")
      }
    } else {
      // Fallback: Poll for updates every 30 seconds when socket is not available
      const interval = setInterval(() => {
        fetchData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [socket, isConnected, toast, selectedVendor])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersRes, partnersRes, vendorsRes] = await Promise.all([
        fetch(`/api/orders/vendor?vendorId=${selectedVendor}`),
        fetch("/api/delivery-partners"),
        fetch("/api/vendors"),
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json()
        setDeliveryPartners(partnersData)
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        setVendors(vendorsData)
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

  const assignDeliveryPartner = async (orderId: string, deliveryPartnerId: string) => {
    try {
      const response = await fetch("/api/orders/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryPartnerId }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)))

        // Emit socket event only if connected
        if (socket && isConnected) {
          socket.emit("orderAssigned", {
            orderId,
            deliveryPartnerId,
            order: updatedOrder,
          })
        }

        toast({
          title: "Delivery Partner Assigned",
          description: `Order #${orderId} has been assigned successfully`,
        })
      }
    } catch (error) {
      console.error("Failed to assign delivery partner:", error)
      toast({
        title: "Assignment Failed",
        description: "Failed to assign delivery partner",
        variant: "destructive",
      })
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
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    inTransitOrders: orders.filter((o) => ["assigned", "picked_up", "in_transit"].includes(o.status)).length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  }

  const currentVendor = vendors.find((v) => v.id === selectedVendor)

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
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentVendor?.businessName || "Vendor"}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inTransitOrders}</div>
              <p className="text-xs text-muted-foreground">Being delivered</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders Management
            </CardTitle>
            <CardDescription>Manage your orders and assign delivery partners</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
                <p className="text-gray-400">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Partner</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {order.items.map((item, index) => (
                              <div key={item.id} className="text-sm">
                                {item.quantity}x {item.name}
                                {index < order.items.length - 1 && ", "}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.replace("_", " ")}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.deliveryPartnerId ? (
                            <div className="text-sm">
                              <p className="font-medium">
                                {deliveryPartners.find((p) => p.id === order.deliveryPartnerId)?.name || "Unknown"}
                              </p>
                              <p className="text-gray-500">
                                {deliveryPartners.find((p) => p.id === order.deliveryPartnerId)?.vehicleType}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.status === "pending" && !order.deliveryPartnerId && (
                            <Select onValueChange={(value) => assignDeliveryPartner(order.id, value)}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Assign Partner" />
                              </SelectTrigger>
                              <SelectContent>
                                {deliveryPartners
                                  .filter((partner) => partner.isAvailable)
                                  .map((partner) => (
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
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export interface User {
  id: string
  email: string
  name: string
  role: "vendor" | "delivery" | "customer"
  createdAt: string
}

export interface Vendor extends User {
  businessName: string
  address: string
  phone: string
}

export interface DeliveryPartner extends User {
  phone: string
  vehicleType: string
  isAvailable: boolean
  currentLocation?: Location
  rating: number
}

export interface Customer extends User {
  phone: string
  address: string
}

export interface Location {
  latitude: number
  longitude: number
  timestamp: string
  accuracy?: number
}

export interface Order {
  id: string
  vendorId: string
  customerId: string
  deliveryPartnerId?: string
  items: OrderItem[]
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled"
  pickupAddress: string
  deliveryAddress: string
  pickupCoordinates: [number, number]
  deliveryCoordinates: [number, number]
  totalAmount: number
  createdAt: string
  updatedAt: string
  estimatedDeliveryTime?: string
  customerName: string
  customerPhone: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  description?: string
}

export interface LocationUpdate {
  orderId: string
  deliveryPartnerId: string
  location: Location
  status: string
}

export interface DeliveryRoute {
  orderId: string
  pickupLocation: [number, number]
  deliveryLocation: [number, number]
  currentLocation?: [number, number]
  estimatedDistance: number
  estimatedTime: number
}

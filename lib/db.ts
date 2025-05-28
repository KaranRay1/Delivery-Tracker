import type { Vendor, DeliveryPartner, Customer, Order, Location } from "@/types"

// Mock database with realistic data
const vendors: Vendor[] = [
  {
    id: "vendor-1",
    email: "quickbites@example.com",
    name: "Quick Bites Restaurant",
    role: "vendor",
    businessName: "Quick Bites",
    address: "123 Food Street, Downtown",
    phone: "+1-555-0101",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vendor-2",
    email: "freshmart@example.com",
    name: "Fresh Mart Grocery",
    role: "vendor",
    businessName: "Fresh Mart",
    address: "456 Market Avenue, Uptown",
    phone: "+1-555-0102",
    createdAt: new Date().toISOString(),
  },
]

const deliveryPartners: DeliveryPartner[] = [
  {
    id: "delivery-1",
    email: "mike.rider@example.com",
    name: "Mike Johnson",
    role: "delivery",
    phone: "+1-555-0201",
    vehicleType: "motorcycle",
    isAvailable: true,
    rating: 4.8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "delivery-2",
    email: "sarah.driver@example.com",
    name: "Sarah Wilson",
    role: "delivery",
    phone: "+1-555-0202",
    vehicleType: "bicycle",
    isAvailable: true,
    rating: 4.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: "delivery-3",
    email: "alex.courier@example.com",
    name: "Alex Chen",
    role: "delivery",
    phone: "+1-555-0203",
    vehicleType: "car",
    isAvailable: false,
    rating: 4.7,
    createdAt: new Date().toISOString(),
  },
]

const customers: Customer[] = [
  {
    id: "customer-1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "customer",
    phone: "+1-555-0301",
    address: "789 Residential Lane, Suburb",
    createdAt: new Date().toISOString(),
  },
]

const orders: Order[] = [
  {
    id: "order-1",
    vendorId: "vendor-1",
    customerId: "customer-1",
    deliveryPartnerId: "delivery-1",
    items: [
      {
        id: "item-1",
        name: "Margherita Pizza",
        quantity: 1,
        price: 18.99,
        description: "Fresh mozzarella, tomato sauce, basil",
      },
      {
        id: "item-2",
        name: "Caesar Salad",
        quantity: 1,
        price: 12.99,
        description: "Romaine lettuce, parmesan, croutons",
      },
    ],
    status: "in_transit",
    pickupAddress: "123 Food Street, Downtown",
    deliveryAddress: "789 Residential Lane, Suburb",
    pickupCoordinates: [40.7589, -73.9851],
    deliveryCoordinates: [40.7505, -73.9934],
    totalAmount: 34.97,
    customerName: "John Doe",
    customerPhone: "+1-555-0301",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  },
  {
    id: "order-2",
    vendorId: "vendor-1",
    customerId: "customer-1",
    items: [
      {
        id: "item-3",
        name: "Chicken Burger",
        quantity: 2,
        price: 15.99,
        description: "Grilled chicken, lettuce, tomato",
      },
      { id: "item-4", name: "French Fries", quantity: 1, price: 6.99, description: "Crispy golden fries" },
    ],
    status: "pending",
    pickupAddress: "123 Food Street, Downtown",
    deliveryAddress: "789 Residential Lane, Suburb",
    pickupCoordinates: [40.7589, -73.9851],
    deliveryCoordinates: [40.7505, -73.9934],
    totalAmount: 38.97,
    customerName: "John Doe",
    customerPhone: "+1-555-0301",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "order-3",
    vendorId: "vendor-2",
    customerId: "customer-1",
    deliveryPartnerId: "delivery-2",
    items: [
      { id: "item-5", name: "Organic Bananas", quantity: 6, price: 4.99, description: "Fresh organic bananas" },
      { id: "item-6", name: "Whole Milk", quantity: 1, price: 3.99, description: "1 gallon whole milk" },
      { id: "item-7", name: "Bread Loaf", quantity: 1, price: 2.99, description: "Whole wheat bread" },
    ],
    status: "picked_up",
    pickupAddress: "456 Market Avenue, Uptown",
    deliveryAddress: "789 Residential Lane, Suburb",
    pickupCoordinates: [40.7614, -73.9776],
    deliveryCoordinates: [40.7505, -73.9934],
    totalAmount: 11.97,
    customerName: "John Doe",
    customerPhone: "+1-555-0301",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  },
]

const locations: (Location & { orderId: string; deliveryPartnerId: string })[] = [
  {
    orderId: "order-1",
    deliveryPartnerId: "delivery-1",
    latitude: 40.758,
    longitude: -73.9855,
    timestamp: new Date().toISOString(),
    accuracy: 5,
  },
]

export const db = {
  vendors: {
    findAll: () => vendors,
    findById: (id: string) => vendors.find((v) => v.id === id),
    create: (vendor: Omit<Vendor, "id" | "createdAt">) => {
      const newVendor = {
        ...vendor,
        id: `vendor-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      vendors.push(newVendor)
      return newVendor
    },
  },
  deliveryPartners: {
    findAll: () => deliveryPartners,
    findById: (id: string) => deliveryPartners.find((d) => d.id === id),
    findAvailable: () => deliveryPartners.filter((d) => d.isAvailable),
    create: (partner: Omit<DeliveryPartner, "id" | "createdAt">) => {
      const newPartner = {
        ...partner,
        id: `delivery-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      deliveryPartners.push(newPartner)
      return newPartner
    },
    update: (id: string, updates: Partial<DeliveryPartner>) => {
      const index = deliveryPartners.findIndex((d) => d.id === id)
      if (index !== -1) {
        deliveryPartners[index] = { ...deliveryPartners[index], ...updates }
        return deliveryPartners[index]
      }
      return null
    },
  },
  orders: {
    findAll: () => orders,
    findById: (id: string) => orders.find((o) => o.id === id),
    findByVendorId: (vendorId: string) => orders.filter((o) => o.vendorId === vendorId),
    findByDeliveryPartnerId: (deliveryPartnerId: string) =>
      orders.filter((o) => o.deliveryPartnerId === deliveryPartnerId),
    create: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
      const newOrder = {
        ...order,
        id: `order-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      orders.push(newOrder)
      return newOrder
    },
    update: (id: string, updates: Partial<Order>) => {
      const index = orders.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() }
        return orders[index]
      }
      return null
    },
  },
  locations: {
    create: (location: Location & { orderId: string; deliveryPartnerId: string }) => {
      locations.push(location)
      return location
    },
    findByOrderId: (orderId: string) =>
      locations
        .filter((l) => l.orderId === orderId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    getLatest: (orderId: string) => {
      const orderLocations = locations.filter((l) => l.orderId === orderId)
      return orderLocations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    },
  },
}

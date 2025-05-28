import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Store, Truck, MapPin, Clock, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Real-Time Delivery
            <span className="text-blue-600 block">Tracking System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional multivendor delivery platform with live location tracking, order management, and seamless
            coordination between vendors, delivery partners, and customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor">
              <Button size="lg" className="w-full sm:w-auto">
                <Store className="mr-2 h-5 w-5" />
                Vendor Dashboard
              </Button>
            </Link>
            <Link href="/delivery">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Truck className="mr-2 h-5 w-5" />
                Delivery Dashboard
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <MapPin className="mr-2 h-5 w-5" />
                Track Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Delivery</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage deliveries efficiently with real-time tracking and seamless coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Live GPS tracking with automatic updates every 2-3 seconds for precise delivery monitoring.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>
                  Complete order management system with delivery partner assignment and status tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Delivery Partners</CardTitle>
                <CardDescription>
                  Dedicated dashboard for delivery partners with route optimization and status updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
                <CardDescription>
                  Instant notifications and status updates using WebSocket technology for all stakeholders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with JWT authentication and encrypted data transmission.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>High Performance</CardTitle>
                <CardDescription>
                  Optimized for speed and scalability with efficient database queries and caching.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Try the Live Demo</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the full functionality with our interactive demo. No signup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Vendor Dashboard</CardTitle>
                <CardDescription>
                  Manage orders, assign delivery partners, and track delivery status in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/vendor">
                  <Button className="w-full" size="lg">
                    Access Vendor Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Delivery Dashboard</CardTitle>
                <CardDescription>
                  Start deliveries, share live location, and update order status on the go.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/delivery">
                  <Button className="w-full" size="lg" variant="outline">
                    Access Delivery Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Order Tracking</CardTitle>
                <CardDescription>
                  Track delivery progress with live map updates and real-time location sharing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/track">
                  <Button className="w-full" size="lg" variant="outline">
                    Track an Order
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">DeliveryTracker Pro</span>
          </div>
          <p className="text-gray-400 mb-4">Professional real-time delivery tracking system for modern businesses.</p>
          <p className="text-sm text-gray-500">Built with Next.js, TypeScript, Socket.IO, and Leaflet.js</p>
        </div>
      </footer>
    </div>
  )
}

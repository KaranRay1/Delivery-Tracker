"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapProps {
  center: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    popup?: string
    icon?: "delivery" | "pickup" | "dropoff"
  }>
  className?: string
  showRoute?: boolean
  routePoints?: [number, number][]
}

export function Map({
  center,
  zoom = 13,
  markers = [],
  className = "",
  showRoute = false,
  routePoints = [],
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const routeRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom)

    // Add tile layer with better styling
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Clear existing route
    if (routeRef.current) {
      mapInstanceRef.current.removeLayer(routeRef.current)
      routeRef.current = null
    }

    // Add route if specified
    if (showRoute && routePoints.length > 1) {
      routeRef.current = L.polyline(routePoints, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
        dashArray: "10, 5",
      }).addTo(mapInstanceRef.current)
    }

    // Add new markers
    markers.forEach(({ position, popup, icon }) => {
      let markerIcon: L.Icon | L.DivIcon

      if (icon === "delivery") {
        markerIcon = L.divIcon({
          html: '<div class="delivery-marker"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: "custom-marker",
        })
      } else if (icon === "pickup") {
        markerIcon = L.divIcon({
          html: '<div class="pickup-marker"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: "custom-marker",
        })
      } else if (icon === "dropoff") {
        markerIcon = L.divIcon({
          html: '<div class="dropoff-marker"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: "custom-marker",
        })
      } else {
        markerIcon = L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      }

      const marker = L.marker(position, { icon: markerIcon }).addTo(mapInstanceRef.current!)

      if (popup) {
        marker.bindPopup(popup)
      }

      markersRef.current.push(marker)
    })

    // Update map view to show all markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      const bounds = group.getBounds()
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds.pad(0.1))
      }
    } else {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [markers, center, zoom, showRoute, routePoints])

  return <div ref={mapRef} className={`h-full w-full ${className}`} />
}

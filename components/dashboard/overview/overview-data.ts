import { Calendar, FileText, Package, ShoppingCart } from "lucide-react"

export const overviewStats = [
  {
    title: "Active Orders",
    value: "3",
    subtext: "2 in transit",
    icon: ShoppingCart,
  },
  {
    title: "Active RFQs",
    value: "2",
    subtext: "8 quotes received",
    icon: FileText,
  },
  {
    title: "Upcoming Bookings",
    value: "1",
    subtext: "Next: Tomorrow 2PM",
    icon: Calendar,
  },
  {
    title: "Saved Parts",
    value: "12",
    subtext: "In watchlist",
    icon: Package,
  },
]

export const primaryVehicle = {
  title: "2019 Toyota Camry",
  vin: "JT2BF22K6X0123456",
}

export const recentOrders = [
  {
    id: "ORD-001",
    part: "Brake Pads - Front",
    vehicle: "2019 Toyota Camry",
    status: "Shipped",
    statusClass:
      "bg-brand-info/10 text-brand-info border-brand-info/20 hover:bg-brand-info/10",
    date: "2024-01-15",
    total: "AED 89.99",
  },
  {
    id: "ORD-002",
    part: "Oil Filter",
    vehicle: "2019 Toyota Camry",
    status: "Delivered",
    statusClass:
      "bg-brand-success/10 text-brand-success border-brand-success/20 hover:bg-brand-success/10",
    date: "2024-01-10",
    total: "AED 24.99",
  },
  {
    id: "ORD-003",
    part: "Air Filter",
    vehicle: "2019 Toyota Camry",
    status: "Processing",
    statusClass:
      "bg-brand-warning/10 text-brand-warning border-brand-warning/20 hover:bg-brand-warning/10",
    date: "2024-01-18",
    total: "AED 19.99",
  },
]

export const activeRfqs = [
  {
    id: "RFQ-001",
    part: "Transmission Fluid",
    vehicle: "2019 Toyota Camry",
    quotes: "3 received",
    status: "Active",
    expires: "2 days",
  },
  {
    id: "RFQ-002",
    part: "Spark Plugs",
    vehicle: "2019 Toyota Camry",
    quotes: "5 received",
    status: "Active",
    expires: "5 days",
  },
]

export const recommendedProducts = Array.from({ length: 3 }).map((_, i) => ({
  id: i + 1,
  title: "Premium Brake Pads",
  subtitle: "Fits your 2019 Toyota Camry",
  price: "AED 89.99",
}))

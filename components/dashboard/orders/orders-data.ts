export const orderStats = [
  {
    title: "Total Orders",
    value: "4",
    valueClass: "text-foreground",
  },
  {
    title: "Processing",
    value: "1",
    valueClass: "text-brand-warning",
  },
  {
    title: "In Transit",
    value: "1",
    valueClass: "text-brand-info",
  },
  {
    title: "Delivered",
    value: "2",
    valueClass: "text-primary",
  },
]

export const orderFilters = [
  { label: "All Orders", active: true },
  { label: "Processing", active: false },
  { label: "Shipped", active: false },
  { label: "Delivered", active: false },
]

export const orders = [
  {
    id: "ORD-001",
    date: "2024-01-20",
    part: "Brake Pads - Front",
    vehicle: "2019 Toyota Camry",
    supplier: "Acme Auto Parts",
    total: "AED 89.99",
    status: "Shipped",
    badgeClass:
      "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10",
  },
  {
    id: "ORD-002",
    date: "2024-01-18",
    part: "Oil Filter",
    vehicle: "2019 Toyota Camry",
    supplier: "Premium Parts Co",
    total: "AED 24.99",
    status: "Delivered",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
  {
    id: "ORD-003",
    date: "2024-01-22",
    part: "Air Filter",
    vehicle: "2021 Honda Accord",
    supplier: "QuickParts Supply",
    total: "AED 19.99",
    status: "Processing",
    badgeClass:
      "border-brand-warning/20 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning/10",
  },
  {
    id: "ORD-004",
    date: "2024-01-15",
    part: "Spark Plugs",
    vehicle: "2018 Ford F-150",
    supplier: "Acme Auto Parts",
    total: "AED 45.50",
    status: "Delivered",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
]

export const rfqStats = [
  {
    title: "Total RFQs",
    value: "4",
    valueClass: "text-foreground",
  },
  {
    title: "Active",
    value: "2",
    valueClass: "text-primary",
  },
  {
    title: "Total Quotes",
    value: "18",
    valueClass: "text-foreground",
  },
  {
    title: "Accepted",
    value: "1",
    valueClass: "text-foreground",
  },
]

export const rfqs = [
  {
    id: "RFQ-001",
    date: "2024-01-22",
    part: "Transmission Fluid",
    vehicle: "2019 Toyota Camry",
    quotes: "3 received",
    bestPrice: "AED 45.99",
    status: "Active",
    expires: "2 days",
    buttonText: "View Quotes",
    buttonClass: "bg-primary text-primary-foreground hover:bg-brand-primary-hover",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
  {
    id: "RFQ-002",
    date: "2024-01-20",
    part: "Spark Plugs",
    vehicle: "2019 Toyota Camry",
    quotes: "5 received",
    bestPrice: "AED 32.50",
    status: "Active",
    expires: "5 days",
    buttonText: "View Quotes",
    buttonClass: "bg-primary text-primary-foreground hover:bg-brand-primary-hover",
    badgeClass:
      "border-brand-success/20 bg-brand-success/10 text-brand-success hover:bg-brand-success/10",
  },
  {
    id: "RFQ-003",
    date: "2024-01-18",
    part: "Brake Rotors",
    vehicle: "2021 Honda Accord",
    quotes: "4 received",
    bestPrice: "AED 120.00",
    status: "Closed",
    expires: "Expired",
    buttonText: "View",
    buttonClass:
      "bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong",
    badgeClass:
      "border-border bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong",
  },
  {
    id: "RFQ-004",
    date: "2024-01-15",
    part: "Battery",
    vehicle: "2018 Ford F-150",
    quotes: "6 received",
    bestPrice: "AED 89.99",
    status: "Accepted",
    expires: "Completed",
    buttonText: "View",
    buttonClass:
      "bg-brand-panel-strong text-brand-muted hover:bg-brand-panel-strong",
    badgeClass:
      "border-brand-info/20 bg-brand-info/10 text-brand-info hover:bg-brand-info/10",
  },
]

export const rfqSteps = [
  {
    title: "1. Submit Request",
    description:
      "Describe the part you need and specify your vehicle details.",
  },
  {
    title: "2. Receive Quotes",
    description:
      "Multiple suppliers compete to offer you the best price and delivery time.",
  },
  {
    title: "3. Accept & Order",
    description:
      "Compare offers and accept the best quote to complete your purchase.",
  },
]

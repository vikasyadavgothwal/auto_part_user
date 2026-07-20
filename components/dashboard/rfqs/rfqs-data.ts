export type UserRfqBid = {
  id: string
  totalAmount: number
  deliveryDays: number
  partType: string
  validUntil: string | null
  notes: string | null
  status: "submitted" | "accepted" | "rejected" | "withdrawn"
  createdAt: string
  items: Array<{
    id: string
    rfqPartId: string
    unitPrice: number
    lineTotal: number
    partType: string
  }>
  supplier: {
    id: string
    companyName: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
  }
}

export type UserRfq = {
  id: string
  publicId: string
  status: "open" | "closed" | "cancelled"
  projectName: string
  description: string | null
  responseDeadline: string
  deliveryRequirement: string
  paymentTerms: string
  companyName: string
  contactName: string
  email: string
  phone: string
  vehicleVin: string | null
  vehicleYear: number | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleTrim: string | null
  attachmentUrl: string | null
  attachmentName: string | null
  createdAt: string
  parts: Array<{
    id: string
    partName: string
    partNumber: string | null
    quantity: number
    targetPrice: number | null
    notes: string | null
  }>
  bids: UserRfqBid[]
  order: {
    id: string
    publicId: string
    bidId: string
    totalAmount: number
    status: string
  } | null
}

export type RfqPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

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
      "Compare offers and accept the best quote to create your order.",
  },
]

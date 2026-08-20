"use client"

import { Calendar } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RequiredMark } from "@/components/ui/required-mark"
import { getVehicleDisplayName, type VehicleRecord } from "@/lib/vehicles"

type VehicleDetails = {
  year: string
  make: string
  model: string
  trim: string
  vin: string
}

type RfqAddressSectionProps = {
  importedVehicleCount: number
  selectedVehicleId: string
  vehicles: VehicleRecord[]
  projectName: string
  deadline: string
  vehicle: VehicleDetails
  companyName: string
  contactName: string
  email: string
  phone: string
  description: string
  fieldErrors: Record<string, string>
  fieldError: (key: string) => ReactNode
  clearError: (key: string) => void
  digitsOnly: (value: string) => string
  selectVehicle: (vehicleId: string) => void
  updateVehicle: (field: keyof VehicleDetails, value: string) => void
  setProjectName: (value: string) => void
  setDeadline: (value: string) => void
  setCompanyName: (value: string) => void
  setContactName: (value: string) => void
  setEmail: (value: string) => void
  setPhone: (value: string) => void
  setDescription: (value: string) => void
}

export function RfqAddressSection({
  importedVehicleCount,
  selectedVehicleId,
  vehicles,
  projectName,
  deadline,
  vehicle,
  companyName,
  contactName,
  email,
  phone,
  description,
  fieldErrors,
  fieldError,
  clearError,
  digitsOnly,
  selectVehicle,
  updateVehicle,
  setProjectName,
  setDeadline,
  setCompanyName,
  setContactName,
  setEmail,
  setPhone,
  setDescription,
}: RfqAddressSectionProps) {
  // FIX: Extracted RFQ details/contact UI while keeping validation in controller.
  return (
    <Card className="rounded-sm border-border bg-brand-panel">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">RFQ details</h2>
          <p className="mt-1 text-sm text-brand-muted">
            {importedVehicleCount > 1
              ? `${importedVehicleCount} vehicles are linked to the requested parts. Complete the request and contact details below.`
              : "Confirm the vehicle, request, and contact details below."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {importedVehicleCount <= 1 ? <label className="space-y-2 md:col-span-2">
            <Label>Saved Vehicle</Label>
            <select
              value={selectedVehicleId}
              onChange={(event) => selectVehicle(event.target.value)}
              className="h-10 w-full rounded-sm border border-border bg-brand-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary"
            >
              <option value="">Enter manually</option>
              {vehicles.map((item) => (
                <option key={item.id} value={item.id}>
                  {getVehicleDisplayName(item)} · {item.vin}
                </option>
              ))}
            </select>
          </label> : null}
          <label className="space-y-2">
            <Label>Project Name<RequiredMark /></Label>
            <Input
              value={projectName}
              maxLength={120}
              required
              placeholder="Parts request"
              aria-invalid={Boolean(fieldErrors.projectName)}
              onChange={(event) => {
                clearError("projectName")
                setProjectName(event.target.value)
              }}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("projectName")}
          </label>
          <label className="space-y-2">
            <Label>Response Deadline<RequiredMark /></Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                type="date"
                value={deadline}
                required
                placeholder="Select response deadline"
                aria-invalid={Boolean(fieldErrors.deadline)}
                onChange={(event) => {
                  clearError("deadline")
                  setDeadline(event.target.value)
                }}
                className="h-10 border-border bg-brand-surface pl-9"
              />
            </div>
            {fieldError("deadline")}
          </label>
          {importedVehicleCount <= 1 ? <><label className="space-y-2">
            <Label>Vehicle Year<RequiredMark /></Label>
            <Input
              inputMode="numeric"
              value={vehicle.year}
              maxLength={4}
              required
              placeholder="2019"
              aria-invalid={Boolean(fieldErrors["vehicle.year"])}
              onChange={(event) =>
                updateVehicle("year", digitsOnly(event.target.value).slice(0, 4))
              }
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("vehicle.year")}
          </label>
          <label className="space-y-2">
            <Label>Make<RequiredMark /></Label>
            <Input
              value={vehicle.make}
              maxLength={80}
              required
              placeholder="Toyota"
              aria-invalid={Boolean(fieldErrors["vehicle.make"])}
              onChange={(event) => updateVehicle("make", event.target.value)}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("vehicle.make")}
          </label>
          <label className="space-y-2">
            <Label>Model<RequiredMark /></Label>
            <Input
              value={vehicle.model}
              maxLength={80}
              required
              placeholder="Camry"
              aria-invalid={Boolean(fieldErrors["vehicle.model"])}
              onChange={(event) => updateVehicle("model", event.target.value)}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("vehicle.model")}
          </label>
          <label className="space-y-2">
            <Label>Trim</Label>
            <Input
              value={vehicle.trim}
              maxLength={80}
              placeholder="LE"
              aria-invalid={Boolean(fieldErrors["vehicle.trim"])}
              onChange={(event) => updateVehicle("trim", event.target.value)}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("vehicle.trim")}
          </label>
          <label className="space-y-2 md:col-span-2">
            <Label>VIN</Label>
            <Input
              value={vehicle.vin}
              maxLength={17}
              placeholder="JT2BF22K6X0123456"
              aria-invalid={Boolean(fieldErrors["vehicle.vin"])}
              onChange={(event) =>
                updateVehicle(
                  "vin",
                  event.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17),
                )
              }
              className="h-10 border-border bg-brand-surface uppercase"
            />
            {fieldError("vehicle.vin")}
          </label></> : null}
          <label className="space-y-2">
            <Label>Customer / Company<RequiredMark /></Label>
            <Input
              value={companyName}
              maxLength={120}
              required
              placeholder="Customer or company name"
              aria-invalid={Boolean(fieldErrors.companyName)}
              onChange={(event) => {
                clearError("companyName")
                setCompanyName(event.target.value)
              }}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("companyName")}
          </label>
          <label className="space-y-2">
            <Label>Contact Name<RequiredMark /></Label>
            <Input
              value={contactName}
              maxLength={120}
              required
              placeholder="Alex Morgan"
              aria-invalid={Boolean(fieldErrors.contactName)}
              onChange={(event) => {
                clearError("contactName")
                setContactName(event.target.value)
              }}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("contactName")}
          </label>
          <label className="space-y-2">
            <Label>Email<RequiredMark /></Label>
            <Input
              type="email"
              value={email}
              maxLength={254}
              required
              placeholder="customer@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(event) => {
                clearError("email")
                setEmail(event.target.value)
              }}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("email")}
          </label>
          <label className="space-y-2">
            <Label>Phone<RequiredMark /></Label>
            <Input
              value={phone}
              maxLength={20}
              type="tel"
              required
              placeholder="+971501234567"
              aria-invalid={Boolean(fieldErrors.phone)}
              onChange={(event) => {
                clearError("phone")
                setPhone(event.target.value.replace(/[^\d+\s()-]/g, ""))
              }}
              className="h-10 border-border bg-brand-surface"
            />
            {fieldError("phone")}
          </label>
          <label className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <textarea
              value={description}
              maxLength={1000}
              aria-invalid={Boolean(fieldErrors.description)}
              onChange={(event) => {
                clearError("description")
                setDescription(event.target.value)
              }}
              rows={4}
              className="w-full resize-none rounded-sm border border-border bg-brand-surface px-3 py-2 text-sm outline-none focus-visible:border-primary"
              placeholder="Any extra fitment, brand, warranty, or delivery details"
            />
            {fieldError("description")}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}

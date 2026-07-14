export type VehicleStatus = "Active" | "In Service" | "Inactive"

export type VehicleRecord = {
  id: string
  year: string
  make: string
  model: string
  vin: string
  mileage: string
  status: VehicleStatus
  primary: boolean
}

export type VehicleFormValues = Omit<VehicleRecord, "id">

const VEHICLE_STORAGE_KEY = "autopartspro.vehicles"

const defaultVehicles: VehicleRecord[] = [
  {
    id: "vehicle-camry",
    year: "2019",
    make: "Toyota",
    model: "Camry",
    vin: "JT2BF22K6X0123456",
    mileage: "45234",
    status: "Active",
    primary: true,
  },
  {
    id: "vehicle-accord",
    year: "2021",
    make: "Honda",
    model: "Accord",
    vin: "1HGCV1F16LA012345",
    mileage: "22150",
    status: "Active",
    primary: false,
  },
  {
    id: "vehicle-f150",
    year: "2018",
    make: "Ford",
    model: "F-150",
    vin: "1FTFW1EF8JFC12345",
    mileage: "67890",
    status: "In Service",
    primary: false,
  },
]

export const emptyVehicleFormValues: VehicleFormValues = {
  year: "",
  make: "",
  model: "",
  vin: "",
  mileage: "",
  status: "Active",
  primary: false,
}

function isVehicleStatus(value: unknown): value is VehicleStatus {
  return (
    value === "Active" || value === "In Service" || value === "Inactive"
  )
}

function sanitizeMileage(value: string) {
  return value.replace(/[^\d]/g, "")
}

function normalizeVehicleFormValues(
  values: VehicleFormValues
): VehicleFormValues {
  return {
    year: values.year.trim(),
    make: values.make.trim(),
    model: values.model.trim(),
    vin: values.vin.trim().toUpperCase(),
    mileage: sanitizeMileage(values.mileage),
    status: isVehicleStatus(values.status) ? values.status : "Active",
    primary: Boolean(values.primary),
  }
}

function ensurePrimaryVehicle(vehicles: VehicleRecord[]) {
  if (!vehicles.length || vehicles.some((vehicle) => vehicle.primary)) {
    return vehicles
  }

  return vehicles.map((vehicle, index) => ({
    ...vehicle,
    primary: index === 0,
  }))
}

function normalizeVehicleRecord(
  vehicle: Partial<VehicleRecord>,
  index: number
): VehicleRecord | null {
  if (
    typeof vehicle.year !== "string" ||
    typeof vehicle.make !== "string" ||
    typeof vehicle.model !== "string" ||
    typeof vehicle.vin !== "string" ||
    typeof vehicle.mileage !== "string"
  ) {
    return null
  }

  return {
    id:
      typeof vehicle.id === "string" && vehicle.id.trim()
        ? vehicle.id
        : `vehicle-${index + 1}`,
    ...normalizeVehicleFormValues({
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      mileage: vehicle.mileage,
      status: isVehicleStatus(vehicle.status) ? vehicle.status : "Active",
      primary: Boolean(vehicle.primary),
    }),
  }
}

export function getDefaultVehicles() {
  return defaultVehicles.map((vehicle) => ({ ...vehicle }))
}

export function readVehiclesFromStorage(
  options: { includeDefaults?: boolean } = {},
) {
  const includeDefaults = options.includeDefaults ?? true
  if (typeof window === "undefined") {
    return includeDefaults ? getDefaultVehicles() : []
  }

  try {
    const storedVehicles = window.localStorage.getItem(VEHICLE_STORAGE_KEY)

    if (!storedVehicles) {
      return includeDefaults ? getDefaultVehicles() : []
    }

    const parsedVehicles = JSON.parse(storedVehicles)

    if (!Array.isArray(parsedVehicles)) {
      return includeDefaults ? getDefaultVehicles() : []
    }

    const normalizedVehicles = parsedVehicles
      .map((vehicle, index) => normalizeVehicleRecord(vehicle, index))
      .filter((vehicle): vehicle is VehicleRecord => Boolean(vehicle))

    return normalizedVehicles.length
      ? ensurePrimaryVehicle(normalizedVehicles)
      : includeDefaults
        ? getDefaultVehicles()
        : []
  } catch {
    return includeDefaults ? getDefaultVehicles() : []
  }
}

export function writeVehiclesToStorage(vehicles: VehicleRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(vehicles))
}

export function createVehicleRecord(values: VehicleFormValues): VehicleRecord {
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `vehicle-${Date.now()}`,
    ...normalizeVehicleFormValues(values),
  }
}

export function upsertVehicle(
  vehicles: VehicleRecord[],
  nextVehicle: VehicleRecord
) {
  const normalizedVehicle = {
    ...nextVehicle,
    ...normalizeVehicleFormValues(nextVehicle),
  }

  const nextVehicles = vehicles.some((vehicle) => vehicle.id === nextVehicle.id)
    ? vehicles.map((vehicle) =>
        vehicle.id === nextVehicle.id ? normalizedVehicle : vehicle
      )
    : [...vehicles, normalizedVehicle]

  return ensurePrimaryVehicle(
    normalizedVehicle.primary
      ? nextVehicles.map((vehicle) => ({
          ...vehicle,
          primary: vehicle.id === normalizedVehicle.id,
        }))
      : nextVehicles
  )
}

export function removeVehicle(vehicles: VehicleRecord[], vehicleId: string) {
  return ensurePrimaryVehicle(
    vehicles.filter((vehicle) => vehicle.id !== vehicleId)
  )
}

export function toVehicleFormValues(
  vehicle?: VehicleRecord
): VehicleFormValues {
  if (!vehicle) {
    return { ...emptyVehicleFormValues }
  }

  return {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    vin: vehicle.vin,
    mileage: vehicle.mileage,
    status: vehicle.status,
    primary: vehicle.primary,
  }
}

export function getVehicleDisplayName(vehicle: VehicleRecord) {
  return [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(" ")
}

export function formatVehicleMileage(mileage: string) {
  const normalizedMileage = sanitizeMileage(mileage)

  if (!normalizedMileage) {
    return "0 miles"
  }

  return `${Number(normalizedMileage).toLocaleString()} miles`
}

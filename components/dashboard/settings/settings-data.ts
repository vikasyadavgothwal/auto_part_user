export const organizationSettings = [
  {
    id: "company-name",
    label: "Company Name",
    defaultValue: "ABC Logistics",
    minLength: 2,
    maxLength: 160,
  },
  {
    id: "ops-email",
    label: "Operations Email",
    type: "email",
    defaultValue: "ops@autopartspro.com",
    maxLength: 254,
  },
  {
    id: "currency",
    label: "Preferred Currency",
    defaultValue: "AED",
    minLength: 3,
    maxLength: 3,
  },
  {
    id: "timezone",
    label: "Timezone",
    defaultValue: "America/Chicago",
    minLength: 3,
    maxLength: 100,
  },
]

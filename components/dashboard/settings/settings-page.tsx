import { OrganizationProfileCard } from "@/components/dashboard/settings/organization-profile-card"
import { organizationSettings } from "@/components/dashboard/settings/settings-data"

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Workspace Settings
        </h1>
        <p className="text-brand-muted">
          Manage the fleet workspace details used across the dashboard.
        </p>
      </div>

      <OrganizationProfileCard settings={organizationSettings} />
    </div>
  )
}

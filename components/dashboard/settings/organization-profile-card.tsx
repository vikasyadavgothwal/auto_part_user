import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RequiredMark } from "@/components/ui/required-mark"

type OrganizationSetting = {
  id: string
  label: string
  type?: string
  defaultValue: string
  minLength?: number
  maxLength: number
}

type OrganizationProfileCardProps = {
  settings: OrganizationSetting[]
}

export function OrganizationProfileCard({
  settings,
}: OrganizationProfileCardProps) {
  return (
    <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
      <CardHeader>
        <CardTitle className="text-foreground">Organization Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-2">
            <Label htmlFor={setting.id}>{setting.label}<RequiredMark /></Label>
            <Input
              id={setting.id}
              type={setting.type}
              defaultValue={setting.defaultValue}
              placeholder={setting.defaultValue}
              minLength={setting.minLength}
              maxLength={setting.maxLength}
              required
              className="border-border bg-brand-surface"
            />
          </div>
        ))}

        <div className="md:col-span-2">
          <Button type="button" className="bg-primary text-primary-foreground hover:bg-brand-primary-hover">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

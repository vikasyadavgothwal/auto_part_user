import { UserSettingsManager } from "@/components/dashboard/settings/user-settings-manager";
import { getUserSettings } from "@/lib/user-settings.server";

export const dynamic = "force-dynamic";

export default async function SettingsRoutePage() {
  const profile = await getUserSettings();
  return <UserSettingsManager profile={profile} />;
}

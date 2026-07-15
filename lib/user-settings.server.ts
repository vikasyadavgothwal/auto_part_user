import { cookies } from "next/headers";

import { requestBackend } from "@/lib/auth/backend";
import { emptyUserProfile, type UserProfileRecord } from "@/lib/user-settings";

type UserSettingsPayload = {
  ok: boolean;
  profile?: UserProfileRecord;
};

export async function getUserSettings() {
  const response = await requestBackend("/api/v1/user/settings", {
    cookieHeader: (await cookies()).toString(),
  });

  if (!response.ok) {
    return emptyUserProfile;
  }

  const payload = (await response.json()) as UserSettingsPayload;
  return payload.profile ?? emptyUserProfile;
}

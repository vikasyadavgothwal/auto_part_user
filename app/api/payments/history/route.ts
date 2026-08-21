import { NextRequest } from "next/server";

import { forwardBackendRequest } from "@/lib/auth/backend";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardBackendRequest(request, "/api/v1/payments/history");
}

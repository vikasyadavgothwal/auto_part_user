import { CreateRfqPage } from "@/components/dashboard/rfqs/create-rfq-page"
import { requireDashboardUser } from "@/lib/auth/server"

export default async function CreateUserRfqPage() {
  return <CreateRfqPage user={await requireDashboardUser("User")} />
}

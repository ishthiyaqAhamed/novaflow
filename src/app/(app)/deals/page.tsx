import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppHeader } from "@/components/layout/AppHeader"
import { DealsClient } from "./deals-client"

export default async function DealsPage() {
  const user = await getCurrentUser()
  const workspaceId = user?.workspaceId || ""

  const [deals, companies, contacts] = await Promise.all([
    db.deal.findMany({
      where: { workspaceId },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.company.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.contact.findMany({
      where: { workspaceId },
      select: { id: true, name: true, companyId: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Deals & Visual Pipeline"
        subtitle="Manage sales stages, track weighted forecasting, and progress opportunities."
      />
      <DealsClient
        initialDeals={deals}
        companies={companies}
        contacts={contacts}
      />
    </div>
  )
}

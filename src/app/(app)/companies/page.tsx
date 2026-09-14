import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppHeader } from "@/components/layout/AppHeader"
import { CompaniesClient } from "./companies-client"

export default async function CompaniesPage() {
  const user = await getCurrentUser()
  const workspaceId = user?.workspaceId || ""

  const companies = await db.company.findMany({
    where: { workspaceId },
    include: {
      contacts: { select: { id: true, name: true } },
      deals: { select: { id: true, title: true, value: true, stage: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Target Accounts & Companies"
        subtitle="Manage key organizations, account hierarchies, and cross-deal pipelines."
      />
      <CompaniesClient initialCompanies={companies} />
    </div>
  )
}

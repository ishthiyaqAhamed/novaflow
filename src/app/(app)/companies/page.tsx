import { db } from "@/lib/db"
import { AppHeader } from "@/components/layout/AppHeader"
import { CompaniesClient } from "./companies-client"

export default async function CompaniesPage() {
  const companies = await db.company.findMany({
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

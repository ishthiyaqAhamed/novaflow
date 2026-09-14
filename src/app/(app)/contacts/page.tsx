import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppHeader } from "@/components/layout/AppHeader"
import { ContactsClient } from "./contacts-client"

export default async function ContactsPage() {
  const user = await getCurrentUser()
  const workspaceId = user?.workspaceId || ""

  const [contacts, companies] = await Promise.all([
    db.contact.findMany({
      where: { workspaceId },
      include: {
        company: { select: { id: true, name: true } },
        deals: { select: { id: true, title: true, value: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.company.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Contacts Directory"
        subtitle="Manage key stakeholders, decision makers, and communication threads."
      />
      <ContactsClient initialContacts={contacts} companies={companies} />
    </div>
  )
}

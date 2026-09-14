import { db } from "@/lib/db"
import { AppHeader } from "@/components/layout/AppHeader"
import { ContactsClient } from "./contacts-client"

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([
    db.contact.findMany({
      include: {
        company: { select: { id: true, name: true } },
        deals: { select: { id: true, title: true, value: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.company.findMany({
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

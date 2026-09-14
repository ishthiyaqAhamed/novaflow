"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { parseCsv } from "@/lib/csv"
import { revalidatePath } from "next/cache"

export async function importContactsFromCsv(csvText: string) {
  try {
    const user = await requireUser()
    const workspaceId = user.workspaceId

    const records = parseCsv(csvText)
    if (records.length === 0) {
      return { error: "No valid rows found in CSV file." }
    }

    let importedCount = 0
    let skippedCount = 0

    for (const record of records) {
      // Look for standard column variants
      const name = record.name || record.fullname || record.contactname || record.contact
      const email = record.email || record.emailaddress || record.mail
      const phone = record.phone || record.phonenumber || record.telephone || null
      const title = record.title || record.jobtitle || record.position || "Decision Maker"
      const statusRaw = (record.status || "ACTIVE").toUpperCase()
      const status = ["ACTIVE", "LEAD", "CHURNED"].includes(statusRaw) ? statusRaw : "ACTIVE"
      const companyName = record.company || record.companyname || record.account || record.organization

      if (!name && !email) {
        skippedCount++
        continue
      }

      const contactName = name || email!.split("@")[0]
      const contactEmail = email || `${contactName.toLowerCase().replace(/\s+/g, ".")}@example.com`

      // Resolve company if specified
      let companyId: string | null = null
      if (companyName && companyName.trim()) {
        const trimmedCompany = companyName.trim()
        let company = await db.company.findFirst({
          where: {
            workspaceId,
            name: { equals: trimmedCompany, mode: "insensitive" },
          },
        })

        if (!company) {
          company = await db.company.create({
            data: {
              workspaceId,
              ownerId: user.id,
              name: trimmedCompany,
              industry: "Technology",
              size: "50-200",
            },
          })
        }
        companyId = company.id
      }

      // Check if contact already exists with this email in workspace
      const existing = await db.contact.findFirst({
        where: {
          workspaceId,
          email: { equals: contactEmail, mode: "insensitive" },
        },
      })

      if (existing) {
        // Update existing contact
        await db.contact.update({
          where: { id: existing.id },
          data: {
            name: contactName,
            phone: phone || existing.phone,
            title: title || existing.title,
            status,
            companyId: companyId || existing.companyId,
          },
        })
      } else {
        // Create new contact
        await db.contact.create({
          data: {
            workspaceId,
            ownerId: user.id,
            name: contactName,
            email: contactEmail,
            phone,
            title,
            status,
            companyId,
          },
        })
      }

      importedCount++
    }

    revalidatePath("/contacts")
    revalidatePath("/dashboard")
    return { success: true, count: importedCount, skipped: skippedCount }
  } catch (error: any) {
    console.error("importContactsFromCsv error:", error)
    return { error: error?.message || "Failed to import contacts from CSV." }
  }
}

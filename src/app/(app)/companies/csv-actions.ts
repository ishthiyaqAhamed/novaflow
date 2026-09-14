"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { parseCsv } from "@/lib/csv"
import { revalidatePath } from "next/cache"

export async function importCompaniesFromCsv(csvText: string) {
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
      const name = record.name || record.companyname || record.company || record.account
      const domain = record.domain || record.website?.replace(/^https?:\/\//, "").split("/")[0] || null
      const industry = record.industry || record.sector || "Technology"
      const size = record.size || record.companysize || record.employees || "50-200"
      const phone = record.phone || record.phonenumber || record.telephone || null
      const website = record.website || (domain ? `https://${domain}` : null)
      const revenueRaw = record.annualrevenue || record.revenue || record.arr || "0"
      const annualRevenue = parseFloat(revenueRaw.replace(/[^0-9.]/g, "")) || 0

      if (!name) {
        skippedCount++
        continue
      }

      const trimmedName = name.trim()

      const existing = await db.company.findFirst({
        where: {
          workspaceId,
          name: { equals: trimmedName, mode: "insensitive" },
        },
      })

      if (existing) {
        await db.company.update({
          where: { id: existing.id },
          data: {
            domain: domain || existing.domain,
            industry: industry || existing.industry,
            size: size || existing.size,
            phone: phone || existing.phone,
            website: website || existing.website,
            annualRevenue: annualRevenue || existing.annualRevenue,
          },
        })
      } else {
        await db.company.create({
          data: {
            workspaceId,
            ownerId: user.id,
            name: trimmedName,
            domain,
            industry,
            size,
            phone,
            website,
            annualRevenue,
          },
        })
      }

      importedCount++
    }

    revalidatePath("/companies")
    revalidatePath("/dashboard")
    return { success: true, count: importedCount, skipped: skippedCount }
  } catch (error: any) {
    console.error("importCompaniesFromCsv error:", error)
    return { error: error?.message || "Failed to import companies from CSV." }
  }
}

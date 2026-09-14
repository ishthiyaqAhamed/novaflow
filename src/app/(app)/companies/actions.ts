"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createCompany(formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const domain = formData.get("domain") as string
  const industry = (formData.get("industry") as string) || "Technology"
  const size = (formData.get("size") as string) || "50-200"
  const phone = formData.get("phone") as string
  const website = formData.get("website") as string
  const annualRevenue = parseFloat(formData.get("annualRevenue") as string) || 0

  if (!name) {
    throw new Error("Company name is required")
  }

  const company = await db.company.create({
    data: {
      name,
      domain: domain || undefined,
      industry,
      size,
      phone: phone || undefined,
      website: website || (domain ? `https://${domain}` : undefined),
      annualRevenue,
      ownerId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  await db.activityLog.create({
    data: {
      type: "NOTE",
      note: `Added new company account "${company.name}"`,
      relatedType: "COMPANY",
      relatedId: company.id,
      userId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  revalidatePath("/companies")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteCompany(companyId: string) {
  const user = await requireUser()

  await db.company.deleteMany({
    where: { id: companyId, workspaceId: user.workspaceId },
  })

  revalidatePath("/companies")
  revalidatePath("/dashboard")
  return { success: true }
}

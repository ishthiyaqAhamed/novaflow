"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createDeal(formData: FormData) {
  const user = await requireUser()

  const title = formData.get("title") as string
  const value = parseFloat(formData.get("value") as string) || 0
  const stage = (formData.get("stage") as string) || "LEAD"
  const probability = parseInt(formData.get("probability") as string) || 20
  const companyId = (formData.get("companyId") as string) || null
  const contactId = (formData.get("contactId") as string) || null
  const expectedCloseDateStr = formData.get("expectedCloseDate") as string

  if (!title) {
    throw new Error("Deal title is required")
  }

  const deal = await db.deal.create({
    data: {
      title,
      value,
      stage,
      probability,
      companyId: companyId || undefined,
      contactId: contactId || undefined,
      expectedCloseDate: expectedCloseDateStr ? new Date(expectedCloseDateStr) : undefined,
      ownerId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  // Log activity
  await db.activityLog.create({
    data: {
      type: "NOTE",
      note: `Created new deal "${deal.title}" with value $${deal.value.toLocaleString()}`,
      relatedType: "DEAL",
      relatedId: deal.id,
      userId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  revalidatePath("/deals")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateDealStage(dealId: string, newStage: string) {
  const user = await requireUser()

  const deal = await db.deal.findFirst({
    where: { id: dealId, workspaceId: user.workspaceId },
  })

  if (!deal) throw new Error("Deal not found in this workspace")

  const probability = newStage === "WON" ? 100 : newStage === "LOST" ? 0 : newStage === "NEGOTIATION" ? 90 : newStage === "PROPOSAL" ? 75 : newStage === "DEMO" ? 50 : 25

  await db.deal.update({
    where: { id: dealId },
    data: { stage: newStage, probability },
  })

  await db.activityLog.create({
    data: {
      type: "STAGE_CHANGE",
      note: `Moved deal "${deal.title}" from ${deal.stage} to ${newStage}`,
      relatedType: "DEAL",
      relatedId: deal.id,
      userId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  revalidatePath("/deals")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteDeal(dealId: string) {
  const user = await requireUser()

  await db.deal.deleteMany({
    where: { id: dealId, workspaceId: user.workspaceId },
  })

  revalidatePath("/deals")
  revalidatePath("/dashboard")
  return { success: true }
}

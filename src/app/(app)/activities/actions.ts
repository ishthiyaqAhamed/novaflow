"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createActivity(formData: FormData) {
  const user = await requireUser()

  const type = (formData.get("type") as string) || "NOTE"
  const note = formData.get("note") as string
  const relatedType = (formData.get("relatedType") as string) || null
  const relatedId = (formData.get("relatedId") as string) || null

  if (!note) {
    throw new Error("Note content is required")
  }

  await db.activityLog.create({
    data: {
      type,
      note,
      relatedType: relatedType || undefined,
      relatedId: relatedId || undefined,
      userId: user.id,
    },
  })

  revalidatePath("/activities")
  revalidatePath("/dashboard")
  return { success: true }
}

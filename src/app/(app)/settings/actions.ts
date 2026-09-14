"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData): Promise<void> {
  const user = await requireUser()

  const name = formData.get("name") as string
  const title = formData.get("title") as string
  const phone = formData.get("phone") as string
  const avatarUrl = formData.get("avatarUrl") as string

  if (!name) {
    throw new Error("Name is required")
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      title: title || undefined,
      phone: phone || undefined,
      avatarUrl: avatarUrl || undefined,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/dashboard")
}

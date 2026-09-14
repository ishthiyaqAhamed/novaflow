"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function purgeExpiredOtps() {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN") throw new Error("Forbidden")

  await db.otpCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { consumedAt: { not: null } },
      ],
    },
  })

  revalidatePath("/admin/otps")
  revalidatePath("/admin")
  return { success: true }
}

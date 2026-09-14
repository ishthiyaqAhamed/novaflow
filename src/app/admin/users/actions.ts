"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, newRole: string) {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN") throw new Error("Forbidden")

  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN") throw new Error("Forbidden")

  await db.user.delete({
    where: { id: userId },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { success: true }
}

export async function adminCreateUser(formData: FormData) {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN") throw new Error("Forbidden")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = (formData.get("password") as string) || "NovaFlow2026!"
  const role = (formData.get("role") as string) || "MEMBER"
  const title = (formData.get("title") as string) || "Sales Executive"

  if (!name || !email) throw new Error("Name and email are required")

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      title,
    },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { success: true }
}

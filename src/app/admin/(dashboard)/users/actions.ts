"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { isSystemAdminEmail } from "@/lib/admin"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, newRole: string) {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN" || !isSystemAdminEmail(currentUser.email)) {
    throw new Error("Forbidden")
  }

  if (newRole === "ADMIN") {
    throw new Error("Cannot promote user to Admin. Only the system hardcoded admin is an Admin.")
  }

  const target = await db.user.findUnique({ where: { id: userId } })
  if (target && isSystemAdminEmail(target.email)) {
    throw new Error("Super Admin role cannot be modified.")
  }

  await db.user.update({
    where: { id: userId },
    data: { role: "MEMBER" },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN" || !isSystemAdminEmail(currentUser.email)) {
    throw new Error("Forbidden")
  }

  const target = await db.user.findUnique({ where: { id: userId } })
  if (target && isSystemAdminEmail(target.email)) {
    throw new Error("Super Admin account cannot be deleted.")
  }

  // Delete related records
  await db.activityLog.deleteMany({ where: { userId } })
  await db.task.deleteMany({ where: { ownerId: userId } })
  await db.deal.deleteMany({ where: { ownerId: userId } })
  await db.contact.deleteMany({ where: { ownerId: userId } })
  await db.company.deleteMany({ where: { ownerId: userId } })
  await db.workspaceMember.deleteMany({ where: { userId } })
  await db.otpCode.deleteMany({ where: { userId } })

  await db.user.delete({
    where: { id: userId },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { success: true }
}

export async function adminCreateUser(formData: FormData) {
  const currentUser = await requireUser()
  if (currentUser.role !== "ADMIN" || !isSystemAdminEmail(currentUser.email)) {
    throw new Error("Forbidden")
  }

  const name = formData.get("name") as string
  const email = (formData.get("email") as string)?.toLowerCase().trim()
  const password = (formData.get("password") as string) || "NovaFlow2026!"
  const role = "MEMBER" // Admin can only create normal users
  const title = (formData.get("title") as string) || "Workspace User"

  if (!name || !email) throw new Error("Name and email are required")
  if (isSystemAdminEmail(email)) throw new Error("Cannot create user with reserved Admin email.")

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      title,
    },
  })

  // Create their dedicated isolated workspace
  const slug = `ws-${user.id.slice(-6)}-${Date.now().toString(36)}`
  await db.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      slug,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  return { success: true }
}

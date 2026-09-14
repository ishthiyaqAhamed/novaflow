"use server"

import { db } from "@/lib/db"
import { setSession } from "@/lib/session"
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, isSystemAdminEmail } from "@/lib/admin"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function adminLogin(prevState: { error: string }, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim()
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Admin email and password are required." }
    }

    if (!isSystemAdminEmail(email)) {
      return { error: "Invalid admin credentials. This portal is restricted to system administrators." }
    }

    let adminUser = await db.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    const isHardcodedMatch = password === ADMIN_PASSWORD
    let isDbMatch = false
    if (adminUser) {
      isDbMatch = await bcrypt.compare(password, adminUser.password).catch(() => false)
    }

    if (!isHardcodedMatch && !isDbMatch) {
      return { error: "Invalid admin password." }
    }

    // Ensure admin user exists in DB with role ADMIN and synced password
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
      adminUser = await db.user.create({
        data: {
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: "ADMIN",
          title: "System Administrator",
        },
      })
    } else {
      const updateData: { role: "ADMIN"; password?: string } = { role: "ADMIN" }
      if (!isDbMatch && isHardcodedMatch) {
        updateData.password = await bcrypt.hash(ADMIN_PASSWORD, 10)
      }
      await db.user.update({
        where: { id: adminUser.id },
        data: updateData,
      })
    }

    await setSession(adminUser.id)
    redirect("/admin")
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("adminLogin error:", error)
    return { error: error?.message || "Failed to authenticate administrator." }
  }
}

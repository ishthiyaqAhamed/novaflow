"use server"

import { db } from "@/lib/db"
import { setSession } from "@/lib/session"
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, isSystemAdminEmail } from "@/lib/admin"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function login(prevState: { error: string }, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim()
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    // Check if logging in as the single hardcoded super admin
    if (isSystemAdminEmail(email)) {
      let adminUser = await db.user.findUnique({
        where: { email: ADMIN_EMAIL },
      })

      const isHardcodedMatch = password === ADMIN_PASSWORD
      let isDbMatch = false
      if (adminUser) {
        isDbMatch = await bcrypt.compare(password, adminUser.password).catch(() => false)
      }

      if (!isHardcodedMatch && !isDbMatch) {
        return { error: "Incorrect admin password" }
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
    }

    // Regular SaaS user login
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "No account found with this email" }
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return { error: "Incorrect password" }
    }

    await setSession(user.id)
    redirect("/dashboard")
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("login error:", error)
    return { error: error?.message || "Failed to log in. Please try again." }
  }
}

export async function logout() {
  const { clearSession } = await import("@/lib/session")
  await clearSession()
  redirect("/login")
}

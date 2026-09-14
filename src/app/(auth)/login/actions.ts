"use server"

import { db } from "@/lib/db"
import { setSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function login(prevState: { error: string }, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim()
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

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

    if ((user as any).role === "ADMIN") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
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

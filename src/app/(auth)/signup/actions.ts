"use server"

import { db } from "@/lib/db"
import { createOtpForUser } from "@/lib/otp"
import { sendOtpEmail } from "@/lib/email"
import { isSystemAdminEmail } from "@/lib/admin"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function signup(prevState: { error: string }, formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim()
    const email = (formData.get("email") as string)?.toLowerCase().trim()
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { error: "All fields are required" }
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters" }
    }

    if (isSystemAdminEmail(email)) {
      return { error: "This email address is reserved for system administration." }
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "An account with this email already exists. Please sign in." }
    }

    const hashed = await bcrypt.hash(password, 10)

    // Regular users are always created with role MEMBER
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "MEMBER",
        title: "Workspace Owner",
      },
    })

    // Immediately provision a fresh, dedicated workspace for the new user
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

    const code = await createOtpForUser(user.id)
    await sendOtpEmail(email, code)

    redirect(`/verify-otp?userId=${user.id}`)
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("Signup error:", error)
    return { error: error?.message || "Failed to create account. Please try again." }
  }
}
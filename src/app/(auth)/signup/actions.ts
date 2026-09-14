"use server"

import { db } from "@/lib/db"
import { createOtpForUser } from "@/lib/otp"
import { sendOtpEmail } from "@/lib/email"
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

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "An account with this email already exists. Please sign in." }
    }

    const hashed = await bcrypt.hash(password, 10)

    const totalUsers = await db.user.count()
    const role = totalUsers === 0 ? "ADMIN" : "MEMBER"

    const user = await db.user.create({
      data: { name, email, password: hashed, role },
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
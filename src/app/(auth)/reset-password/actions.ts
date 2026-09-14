"use server"

import { db } from "@/lib/db"
import { verifyOtpForUser } from "@/lib/otp"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function resetPassword(prevState: { error: string }, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim()
    const code = (formData.get("code") as string)?.trim()
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!email || !code || !newPassword) {
      return { error: "All fields are required." }
    }

    if (newPassword.length < 8) {
      return { error: "New password must be at least 8 characters." }
    }

    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match." }
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "User account not found." }
    }

    const isValid = await verifyOtpForUser(user.id, code, "PASSWORD_RESET")
    if (!isValid) {
      return { error: "Invalid or expired reset code. Please request a new one." }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    redirect("/login?reset=true")
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("resetPassword error:", error)
    return { error: error?.message || "Failed to update password. Please try again." }
  }
}

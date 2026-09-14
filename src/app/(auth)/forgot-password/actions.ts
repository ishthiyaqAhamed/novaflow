"use server"

import { db } from "@/lib/db"
import { createOtpForUser } from "@/lib/otp"
import { sendPasswordResetEmail } from "@/lib/email"
import { redirect } from "next/navigation"

export async function requestPasswordReset(prevState: { error: string }, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim()

    if (!email) {
      return { error: "Please enter your email address." }
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "No account found with this email address." }
    }

    const code = await createOtpForUser(user.id, "PASSWORD_RESET")
    await sendPasswordResetEmail(email, code)

    redirect(`/reset-password?email=${encodeURIComponent(email)}`)
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("requestPasswordReset error:", error)
    return { error: error?.message || "Failed to send reset code. Please try again." }
  }
}

"use server"

import { db } from "@/lib/db"
import { verifyOtpForUser } from "@/lib/otp"
import { setSession } from "@/lib/session"
import { redirect } from "next/navigation"

export async function verifyOtp(prevState: { error: string }, formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const code = (formData.get("code") as string)?.trim()

    if (!userId || !code) {
      return { error: "Verification code is required" }
    }

    const isValid = await verifyOtpForUser(userId, code)
    if (!isValid) {
      return { error: "Invalid or expired verification code. Please check your email or try again." }
    }

    // Redirect directly to login page after successful verification
    redirect("/login?verified=true")
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error
    }
    console.error("verifyOtp error:", error)
    return { error: error?.message || "Failed to verify code. Please try again." }
  }
}

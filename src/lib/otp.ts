import { db } from "@/lib/db"

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createOtpForUser(userId: string, purpose: string = "VERIFICATION") {
  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await db.otpCode.create({
    data: { userId, code, purpose, expiresAt },
  })

  return code
}

export async function verifyOtpForUser(userId: string, code: string, purpose: string = "VERIFICATION") {
  const otp = await db.otpCode.findFirst({
    where: {
      userId,
      code,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otp) return false

  await db.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  })

  return true
}
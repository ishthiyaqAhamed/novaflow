import { cookies } from "next/headers"
import { db } from "./db"

const SESSION_COOKIE_NAME = "novaflow_session"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  title?: string | null
  avatarUrl?: string | null
}

export async function setSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!userId) {
      // Fallback: default to the first active user for smooth previewing
      const firstUser = await db.user.findFirst({
        orderBy: { createdAt: "asc" },
      })
      if (!firstUser) return null
      return {
        id: firstUser.id,
        name: firstUser.name,
        email: firstUser.email,
        role: (firstUser as any).role || "ADMIN",
        title: (firstUser as any).title || null,
        avatarUrl: (firstUser as any).avatarUrl || null,
      }
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user as any).role || "ADMIN",
      title: (user as any).title || null,
      avatarUrl: (user as any).avatarUrl || null,
    }
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err
    }
    console.error("Failed to get current user session:", err)
    return null
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

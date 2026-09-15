import { cookies } from "next/headers"
import { cache } from "react"
import { db } from "./db"

const SESSION_COOKIE_NAME = "novaflow_session"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  title?: string | null
  avatarUrl?: string | null
  workspaceId: string
  workspaceName: string
  workspaceRole: string
}

export async function ensureUserWorkspace(userId: string, userName: string) {
  const membership = await db.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  })

  if (membership) {
    return {
      workspaceId: membership.workspaceId,
      workspaceName: membership.workspace.name,
      workspaceRole: membership.role,
    }
  }

  // Create default workspace for user
  const slug = `ws-${userId.slice(-6)}-${Date.now().toString(36)}`
  const workspace = await db.workspace.create({
    data: {
      name: `${userName}'s Workspace`,
      slug,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  })

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceRole: "OWNER",
  }
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

// React cache() eliminates duplicate session queries across layout and page components within the same request
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!userId) {
      return null
    }

    // Fetch user and primary workspace membership in a single roundtrip
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        workspaceMembers: {
          include: { workspace: true },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    })

    if (!user) return null

    let workspaceId = ""
    let workspaceName = "Workspace"
    let workspaceRole = "OWNER"

    if (user.workspaceMembers && user.workspaceMembers.length > 0) {
      workspaceId = user.workspaceMembers[0].workspaceId
      workspaceName = user.workspaceMembers[0].workspace.name
      workspaceRole = user.workspaceMembers[0].role
    } else {
      const ws = await ensureUserWorkspace(user.id, user.name)
      workspaceId = ws.workspaceId
      workspaceName = ws.workspaceName
      workspaceRole = ws.workspaceRole
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user as any).role || "MEMBER",
      title: (user as any).title || null,
      avatarUrl: (user as any).avatarUrl || null,
      workspaceId,
      workspaceName,
      workspaceRole,
    }
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err
    }
    console.error("Failed to get current user session:", err)
    return null
  }
})

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

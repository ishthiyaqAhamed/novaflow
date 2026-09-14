"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { sendInviteEmail } from "@/lib/email"
import { isSystemAdminEmail } from "@/lib/admin"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function inviteWorkspaceMember(formData: FormData) {
  try {
    const currentUser = await requireUser()
    const email = (formData.get("email") as string)?.toLowerCase().trim()
    const role = (formData.get("role") as string) || "MEMBER"
    const title = (formData.get("title") as string) || "Team Member"

    if (!email) {
      return { error: "Email address is required." }
    }

    if (isSystemAdminEmail(email)) {
      return { error: "Cannot add the system super administrator as a workspace member." }
    }

    // Verify current user is OWNER or ADMIN of this workspace
    const currentMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: currentUser.workspaceId,
          userId: currentUser.id,
        },
      },
    })

    if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
      return { error: "Only workspace Owners or Admins can invite team members." }
    }

    // Check if user already exists in DB
    let targetUser = await db.user.findUnique({
      where: { email },
    })

    if (!targetUser) {
      // Provision user account with a temporary secure password
      const tempPassword = `NovaFlow-${Math.random().toString(36).slice(-8)}!`
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase())

      targetUser = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MEMBER",
          title,
        },
      })

      // Send email with invitation details
      await sendInviteEmail(
        email,
        currentUser.name,
        currentUser.workspaceName,
        role,
        tempPassword
      ).catch((err: any) => console.error("Failed to send invite email:", err))
    }

    // Check if user is already a member of this workspace
    const existingMembership = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: currentUser.workspaceId,
          userId: targetUser.id,
        },
      },
    })

    if (existingMembership) {
      return { error: "This user is already a member of this workspace." }
    }

    // Add user as member to the current workspace
    await db.workspaceMember.create({
      data: {
        workspaceId: currentUser.workspaceId,
        userId: targetUser.id,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error: any) {
    console.error("inviteWorkspaceMember error:", error)
    return { error: error?.message || "Failed to invite member." }
  }
}

export async function removeWorkspaceMember(memberId: string) {
  try {
    const currentUser = await requireUser()

    const targetMembership = await db.workspaceMember.findUnique({
      where: { id: memberId },
    })

    if (!targetMembership || targetMembership.workspaceId !== currentUser.workspaceId) {
      return { error: "Member not found in your workspace." }
    }

    if (targetMembership.role === "OWNER") {
      return { error: "The Workspace Owner cannot be removed." }
    }

    if (targetMembership.userId === currentUser.id) {
      return { error: "You cannot remove yourself from the workspace." }
    }

    // Verify current user is OWNER or ADMIN
    const currentMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: currentUser.workspaceId,
          userId: currentUser.id,
        },
      },
    })

    if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
      return { error: "Permission denied." }
    }

    await db.workspaceMember.delete({
      where: { id: memberId },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error: any) {
    console.error("removeWorkspaceMember error:", error)
    return { error: error?.message || "Failed to remove member." }
  }
}

export async function updateWorkspaceMemberRole(memberId: string, newRole: string) {
  try {
    const currentUser = await requireUser()

    const targetMembership = await db.workspaceMember.findUnique({
      where: { id: memberId },
    })

    if (!targetMembership || targetMembership.workspaceId !== currentUser.workspaceId) {
      return { error: "Member not found." }
    }

    if (targetMembership.role === "OWNER") {
      return { error: "Workspace Owner role cannot be modified." }
    }

    const currentMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: currentUser.workspaceId,
          userId: currentUser.id,
        },
      },
    })

    if (!currentMember || currentMember.role !== "OWNER") {
      return { error: "Only the Workspace Owner can change member roles." }
    }

    await db.workspaceMember.update({
      where: { id: memberId },
      data: {
        role: newRole === "ADMIN" ? "ADMIN" : "MEMBER",
      },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error: any) {
    console.error("updateWorkspaceMemberRole error:", error)
    return { error: error?.message || "Failed to update role." }
  }
}

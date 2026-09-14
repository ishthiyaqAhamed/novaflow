"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createContact(formData: FormData) {
  const user = await requireUser()

  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim()
  const title = (formData.get("title") as string)?.trim()
  const status = (formData.get("status") as string) || "ACTIVE"

  let companyId = (formData.get("companyId") as string)?.trim() || null
  const companyName = (formData.get("companyName") as string)?.trim()

  if (!name || !email) {
    throw new Error("Name and email are required")
  }

  // Auto-resolve or create Company if typed by name
  if (!companyId && companyName) {
    let company = await db.company.findFirst({
      where: {
        name: { equals: companyName, mode: "insensitive" },
        workspaceId: user.workspaceId,
      },
    })
    if (!company) {
      company = await db.company.create({
        data: {
          name: companyName,
          workspaceId: user.workspaceId,
          ownerId: user.id,
        },
      })
    }
    companyId = company.id
  }

  const contact = await db.contact.create({
    data: {
      name,
      email,
      phone: phone || undefined,
      title: title || "Decision Maker",
      status,
      companyId: companyId || undefined,
      ownerId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  await db.activityLog.create({
    data: {
      type: "NOTE",
      note: `Added new contact "${contact.name}" (${contact.title})`,
      relatedType: "CONTACT",
      relatedId: contact.id,
      userId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  revalidatePath("/contacts")
  revalidatePath("/dashboard")
  revalidatePath("/companies")
  return { success: true }
}

export async function deleteContact(contactId: string) {
  const user = await requireUser()

  await db.contact.deleteMany({
    where: { id: contactId, workspaceId: user.workspaceId },
  })

  revalidatePath("/contacts")
  revalidatePath("/dashboard")
  return { success: true }
}

"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createContact(formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const title = formData.get("title") as string
  const status = (formData.get("status") as string) || "ACTIVE"
  const companyId = (formData.get("companyId") as string) || null

  if (!name || !email) {
    throw new Error("Name and email are required")
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
    },
  })

  await db.activityLog.create({
    data: {
      type: "NOTE",
      note: `Added new contact "${contact.name}" (${contact.title})`,
      relatedType: "CONTACT",
      relatedId: contact.id,
      userId: user.id,
    },
  })

  revalidatePath("/contacts")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteContact(contactId: string) {
  await requireUser()

  await db.contact.delete({
    where: { id: contactId },
  })

  revalidatePath("/contacts")
  revalidatePath("/dashboard")
  return { success: true }
}

"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
  const user = await requireUser()

  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const priority = (formData.get("priority") as string) || "MEDIUM"
  const dueDateStr = formData.get("dueDate") as string

  let dealId = (formData.get("dealId") as string)?.trim() || null
  const dealTitle = (formData.get("dealTitle") as string)?.trim()

  let contactId = (formData.get("contactId") as string)?.trim() || null
  const contactName = (formData.get("contactName") as string)?.trim()

  if (!title) {
    throw new Error("Task title is required")
  }

  // Auto-resolve Deal if typed by title
  if (!dealId && dealTitle) {
    let deal = await db.deal.findFirst({
      where: {
        title: { equals: dealTitle, mode: "insensitive" },
        workspaceId: user.workspaceId,
      },
    })
    if (!deal) {
      deal = await db.deal.create({
        data: {
          title: dealTitle,
          value: 0,
          stage: "LEAD",
          workspaceId: user.workspaceId,
          ownerId: user.id,
        },
      })
    }
    dealId = deal.id
  }

  // Auto-resolve Contact if typed by name
  if (!contactId && contactName) {
    let contact = await db.contact.findFirst({
      where: {
        name: { equals: contactName, mode: "insensitive" },
        workspaceId: user.workspaceId,
      },
    })
    if (!contact) {
      const cleanEmailHandle = contactName.toLowerCase().replace(/[^a-z0-9]/g, "") || "contact"
      contact = await db.contact.create({
        data: {
          name: contactName,
          email: `${cleanEmailHandle}@example.com`,
          workspaceId: user.workspaceId,
          ownerId: user.id,
        },
      })
    }
    contactId = contact.id
  }

  const task = await db.task.create({
    data: {
      title,
      description: description || undefined,
      priority,
      status: "TODO",
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      dealId: dealId || undefined,
      contactId: contactId || undefined,
      ownerId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  await db.activityLog.create({
    data: {
      type: "NOTE",
      note: `Created task "${task.title}"`,
      relatedType: "TASK",
      relatedId: task.id,
      userId: user.id,
      workspaceId: user.workspaceId,
    },
  })

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  revalidatePath("/deals")
  revalidatePath("/contacts")
  return { success: true }
}

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
  const user = await requireUser()

  const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"

  const task = await db.task.findFirst({
    where: { id: taskId, workspaceId: user.workspaceId },
  })

  if (!task) throw new Error("Task not found in this workspace")

  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  })

  if (newStatus === "DONE") {
    await db.activityLog.create({
      data: {
        type: "NOTE",
        note: `Completed task "${updatedTask.title}"`,
        relatedType: "TASK",
        relatedId: updatedTask.id,
        userId: user.id,
        workspaceId: user.workspaceId,
      },
    })
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const user = await requireUser()

  await db.task.deleteMany({
    where: { id: taskId, workspaceId: user.workspaceId },
  })

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

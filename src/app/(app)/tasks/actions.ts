"use server"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createTask(formData: FormData) {
  const user = await requireUser()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = (formData.get("priority") as string) || "MEDIUM"
  const dueDateStr = formData.get("dueDate") as string
  const dealId = (formData.get("dealId") as string) || null
  const contactId = (formData.get("contactId") as string) || null

  if (!title) {
    throw new Error("Task title is required")
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

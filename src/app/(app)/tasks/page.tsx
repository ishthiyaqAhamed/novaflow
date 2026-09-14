import { db } from "@/lib/db"
import { AppHeader } from "@/components/layout/AppHeader"
import { TasksClient } from "./tasks-client"

export default async function TasksPage() {
  const [tasks, deals, contacts] = await Promise.all([
    db.task.findMany({
      include: {
        deal: { select: { id: true, title: true } },
        contact: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    }),
    db.deal.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    db.contact.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Tasks & Reminders"
        subtitle="Track action items, meeting follow-ups, and commercial milestones."
      />
      <TasksClient initialTasks={tasks} deals={deals} contacts={contacts} />
    </div>
  )
}

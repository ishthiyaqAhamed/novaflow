import OpenAI from "openai"
import { db } from "@/lib/db"

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

export async function getWorkspaceCrmContext(workspaceId: string, userName: string) {
  try {
    const [deals, tasks, contacts, companies, activities, workspace] = await Promise.all([
      db.deal.findMany({
        where: { workspaceId },
        include: {
          company: { select: { name: true } },
          contact: { select: { name: true, email: true } },
        },
        orderBy: { value: "desc" },
        take: 20,
      }),
      db.task.findMany({
        where: { workspaceId, status: { not: "DONE" } },
        include: {
          deal: { select: { title: true } },
          contact: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 15,
      }),
      db.contact.findMany({
        where: { workspaceId },
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      db.company.findMany({
        where: { workspaceId },
        orderBy: { annualRevenue: "desc" },
        take: 15,
      }),
      db.activityLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true, plan: true },
      }),
    ])

    // Calculate metrics
    const activeDeals = deals.filter(d => !["WON", "LOST"].includes(d.stage))
    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
    const wonDeals = deals.filter(d => d.stage === "WON")
    const totalWonValue = wonDeals.reduce((sum, d) => sum + d.value, 0)

    const stageBreakdown: Record<string, { count: number; value: number }> = {}
    deals.forEach(d => {
      if (!stageBreakdown[d.stage]) {
        stageBreakdown[d.stage] = { count: 0, value: 0 }
      }
      stageBreakdown[d.stage].count++
      stageBreakdown[d.stage].value += d.value
    })

    return {
      workspaceName: workspace?.name || "Workspace",
      metrics: {
        totalDeals: deals.length,
        activeDealsCount: activeDeals.length,
        totalPipelineValue,
        wonDealsCount: wonDeals.length,
        totalWonValue,
        pendingTasksCount: tasks.length,
        totalContacts: contacts.length,
        totalCompanies: companies.length,
        stageBreakdown,
      },
      topDeals: deals.map(d => ({
        title: d.title,
        value: `$${d.value.toLocaleString()}`,
        stage: d.stage,
        probability: `${d.probability}%`,
        company: d.company?.name || "None",
        contact: d.contact?.name || "None",
      })),
      pendingTasks: tasks.map(t => ({
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "No due date",
        relatedDeal: t.deal?.title || null,
        relatedContact: t.contact?.name || null,
      })),
      recentContacts: contacts.map(c => ({
        name: c.name,
        email: c.email,
        title: c.title,
        company: c.company?.name || "None",
        status: c.status,
      })),
      topCompanies: companies.map(c => ({
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        size: c.size,
        annualRevenue: c.annualRevenue ? `$${c.annualRevenue.toLocaleString()}` : "$0",
      })),
      recentActivities: activities.map(a => ({
        type: a.type,
        note: a.note,
        date: a.createdAt.toISOString().slice(0, 10),
      })),
    }
  } catch (error) {
    console.error("getWorkspaceCrmContext error:", error)
    return null
  }
}

export async function askNovaAi({
  messages,
  workspaceId,
  userName,
}: {
  messages: { role: "user" | "assistant" | "system"; content: string }[]
  workspaceId: string
  userName: string
}) {
  const openai = getOpenAIClient()
  if (!openai) {
    return "OpenAI API key is not configured in the environment variables. Please set `OPENAI_API_KEY` in your environment settings."
  }

  const context = await getWorkspaceCrmContext(workspaceId, userName)

  const systemPrompt = `You are Nova AI, an intelligent, helpful, and insightful executive CRM Copilot built specifically for NovaFlow.
You are currently assisting ${userName} with their CRM workspace: "${context?.workspaceName || "NovaFlow Workspace"}".

Here is the real-time, live data from ${userName}'s CRM workspace:

--- LIVE CRM WORKSPACE CONTEXT ---
${JSON.stringify(context, null, 2)}
----------------------------------

GUIDELINES:
1. Answer questions clearly, concisely, and accurately based on the live CRM data above.
2. If asked about deals, pipeline value, stages, tasks, contacts, or accounts, quote the exact numbers and names from the context.
3. Provide actionable sales advice when asked (e.g., how to push deals in "Negotiation" or "Demo" to "Won", prioritize high-urgency tasks, follow up with key stakeholders).
4. Use clean Markdown formatting with bold text, bullet points, and tables when helpful.
5. If the user asks something not in the CRM data, politely state that it is not present in their current records.
6. Keep a friendly, professional, proactive executive tone.
`

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.slice(-8).map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ]

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    temperature: 0.7,
    max_tokens: 800,
  })

  return completion.choices[0]?.message?.content || "I couldn't generate a response at this moment. Please try again."
}

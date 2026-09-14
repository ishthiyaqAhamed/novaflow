import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { askNovaAi } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 })
    }

    const reply = await askNovaAi({
      messages,
      workspaceId: user.workspaceId,
      userName: user.name,
    })

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("AI Chat API error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to process chat request." },
      { status: 500 }
    )
  }
}

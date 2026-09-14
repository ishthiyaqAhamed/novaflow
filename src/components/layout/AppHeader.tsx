"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, Bell, Sparkles, ChevronDown } from "lucide-react"

interface AppHeaderProps {
  title: string
  subtitle?: string
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  return (
    <header className="h-16 border-b border-border bg-paper/80 backdrop-blur-xs px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-muted">{subtitle}</p>}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:block w-56">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search deals, contacts..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showQuickMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowQuickMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-paper shadow-xl p-1.5 z-20 space-y-0.5">
                <Link
                  href="/deals"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink hover:bg-ink/5 rounded-lg transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-accent"></span>
                  <span>New Deal</span>
                </Link>
                <Link
                  href="/contacts"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink hover:bg-ink/5 rounded-lg transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-signal"></span>
                  <span>New Contact</span>
                </Link>
                <Link
                  href="/companies"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink hover:bg-ink/5 rounded-lg transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>New Company</span>
                </Link>
                <Link
                  href="/tasks"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink hover:bg-ink/5 rounded-lg transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  <span>New Task</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

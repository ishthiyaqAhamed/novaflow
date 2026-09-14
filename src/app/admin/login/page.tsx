"use client"

import { useActionState } from "react"
import Link from "next/link"
import { adminLogin } from "./actions"
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react"

const initialState = { error: "" }

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101012] text-white px-4 selection:bg-purple-500/30">
      <div className="w-full max-w-sm">
        {/* Admin Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/5">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 mb-2">
            Restricted Access
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">NovaFlow Admin Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">
            System management, user accounts, and security telemetry
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md p-6 shadow-2xl">
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5" htmlFor="email">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue="admin@novaflow.com"
                placeholder="admin@novaflow.com"
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5" htmlFor="password">
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              />
            </div>

            {state?.error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 text-white py-2.5 text-xs font-semibold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{pending ? "Authenticating..." : "Sign In to Admin Portal"}</span>
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to User Workspace
          </Link>
        </div>
      </div>
    </div>
  )
}

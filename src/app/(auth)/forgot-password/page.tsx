"use client"

import { useActionState } from "react"
import Link from "next/link"
import { requestPasswordReset } from "./actions"
import { KeyRound, ArrowLeft } from "lucide-react"

const initialState = { error: "" }

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 selection:bg-accent/20">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-lg shadow-sm">
              N
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-ink">NovaFlow</span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <KeyRound className="h-4 w-4 text-accent" />
            <h1 className="text-lg font-bold text-ink">Reset your password</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Enter your work email and we will send a 6-digit recovery code.
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="email">
              Work Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="alex@company.com"
              required
              autoFocus
              className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          {state?.error && (
            <div className="p-2.5 rounded-lg bg-alert/10 border border-alert/20 text-alert text-xs">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-ink text-paper py-2.5 text-xs font-semibold hover:bg-ink/90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pending ? "Sending reset code..." : "Send Reset Code"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { login } from "./actions"
import { CheckCircle2, Eye, EyeOff } from "lucide-react"

const initialState = { error: "" }

function LoginForm() {
  const searchParams = useSearchParams()
  const isVerified = searchParams.get("verified") === "true"
  const isReset = searchParams.get("reset") === "true"
  const [state, formAction, pending] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-sm">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-lg shadow-sm">
            N
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">NovaFlow</span>
        </Link>
        <h1 className="text-xl font-bold text-ink">Welcome back</h1>
        <p className="text-xs text-muted mt-1">Sign in to manage your pipeline and deals</p>
      </div>

      {/* Verification Success Banner */}
      {isVerified && (
        <div className="mb-6 p-3.5 rounded-xl border border-signal/30 bg-signal/5 flex items-start gap-2.5 text-xs text-signal">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Email verified successfully!</div>
            <div className="text-[11px] text-muted mt-0.5">Please sign in with your credentials below.</div>
          </div>
        </div>
      )}

      {/* Password Reset Success Banner */}
      {isReset && (
        <div className="mb-6 p-3.5 rounded-xl border border-signal/30 bg-signal/5 flex items-start gap-2.5 text-xs text-signal">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Password reset successfully!</div>
            <div className="text-[11px] text-muted mt-0.5">Please sign in with your new password below.</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="email">
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            required
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-ink" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-border bg-paper pl-3 pr-9 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-0.5 rounded"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-muted mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-accent hover:underline">
          Create account
        </Link>
      </p>

      <div className="pt-4 mt-6 border-t border-border/60 text-center">
        <Link href="/admin/login" className="text-[11px] text-muted hover:text-accent transition-colors font-medium">
          System Administrator Portal →
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 selection:bg-accent/20">
      <Suspense fallback={<div className="text-xs text-muted">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

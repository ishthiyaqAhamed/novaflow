"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import { signup } from "./actions"
import { Eye, EyeOff } from "lucide-react"

const initialState = { error: "" }

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 selection:bg-accent/20">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-9 w-9 rounded-xl bg-ink text-paper flex items-center justify-center font-display font-bold text-lg shadow-sm">
              N
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-ink">NovaFlow</span>
          </div>
          <h1 className="text-xl font-bold text-ink">Create your account</h1>
          <p className="text-xs text-muted mt-1">Get started with automated OTP email verification</p>
        </div>

        {/* Signup Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="email">
              Work Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="alex@company.com"
              className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="At least 8 characters"
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
            {pending ? "Sending verification code..." : "Create Account & Send Code"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
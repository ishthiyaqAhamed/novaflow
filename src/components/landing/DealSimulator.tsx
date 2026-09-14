"use client"

import { useState } from "react"
import { Calculator, ArrowRight, Zap, TrendingUp, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function DealSimulator() {
  const [dealSize, setDealSize] = useState<number>(35000)
  const [dealsPerMonth, setDealsPerMonth] = useState<number>(12)
  const [winRate, setWinRate] = useState<number>(28)

  const currentAnnualRevenue = (dealSize * dealsPerMonth * 12 * winRate) / 100
  const projectedWinRate = Math.min(100, winRate + 12)
  const projectedAnnualRevenue = (dealSize * dealsPerMonth * 12 * projectedWinRate) / 100
  const uplift = projectedAnnualRevenue - currentAnnualRevenue

  return (
    <div className="w-full rounded-2xl border border-border bg-[#FDFBF7] p-6 sm:p-10 shadow-lg text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
            <Calculator className="h-3.5 w-3.5" />
            <span>Revenue Velocity Simulator</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Calculate your pipeline ROI with NovaFlow
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            See how streamlining pipeline velocity and increasing win rate impacts your bottom line.
          </p>

          <div className="space-y-5 pt-2">
            {/* Slider 1: Deal Size */}
            <div>
              <div className="flex justify-between text-xs font-medium text-ink mb-2">
                <span>Average Deal Size (ARR)</span>
                <span className="font-mono font-bold text-accent">${dealSize.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={dealSize}
                onChange={e => setDealSize(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Slider 2: Monthly Deals */}
            <div>
              <div className="flex justify-between text-xs font-medium text-ink mb-2">
                <span>Active Opportunities / Month</span>
                <span className="font-mono font-bold text-accent">{dealsPerMonth} deals</span>
              </div>
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={dealsPerMonth}
                onChange={e => setDealsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Slider 3: Win Rate */}
            <div>
              <div className="flex justify-between text-xs font-medium text-ink mb-2">
                <span>Current Win Rate</span>
                <span className="font-mono font-bold text-accent">{winRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={winRate}
                onChange={e => setWinRate(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-paper p-6 shadow-md flex flex-col justify-between h-full">
          <div>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Estimated Annual Revenue Uplift</div>
            <div className="font-display text-4xl sm:text-5xl font-bold text-signal font-mono mb-4">
              +${Math.round(uplift).toLocaleString()}
            </div>

            <div className="space-y-3 pt-3 border-t border-border text-xs">
              <div className="flex justify-between py-1 text-muted">
                <span>Current Projected ARR:</span>
                <span className="font-mono font-semibold text-ink">${Math.round(currentAnnualRevenue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-muted">
                <span>With NovaFlow (+12% win rate):</span>
                <span className="font-mono font-semibold text-signal">${Math.round(projectedAnnualRevenue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-muted">
                <span>Avg. Cycle Reduction:</span>
                <span className="font-mono font-semibold text-ink">14.2 Days Faster</span>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="mt-6 w-full bg-ink hover:bg-accent text-paper font-semibold text-xs py-3 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Unlock This Growth</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

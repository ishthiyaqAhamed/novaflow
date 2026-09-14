"use client"

import { useState, useTransition, useRef } from "react"
import {
  Plus,
  Search,
  Building2,
  Globe,
  Users,
  DollarSign,
  Trash2,
  X,
  ExternalLink,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { createCompany, deleteCompany } from "./actions"
import { importCompaniesFromCsv } from "./csv-actions"
import { generateCsv, downloadCsvInBrowser } from "@/lib/csv"

interface CompanyItem {
  id: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  phone: string | null
  website: string | null
  annualRevenue: number | null
  contacts: { id: string; name: string }[]
  deals: { id: string; title: string; value: number; stage: string }[]
}

interface CompaniesClientProps {
  initialCompanies: CompanyItem[]
}

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const [companies, setCompanies] = useState<CompanyItem[]>(initialCompanies)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<string>("")
  const [importStatus, setImportStatus] = useState<{ message?: string; error?: string; count?: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return
    setCompanies(prev => prev.filter(c => c.id !== companyId))
    startTransition(async () => {
      await deleteCompany(companyId)
    })
  }

  const handleExportCsv = () => {
    const rows = filteredCompanies.map(c => ({
      name: c.name,
      domain: c.domain || "",
      industry: c.industry || "",
      size: c.size || "",
      phone: c.phone || "",
      website: c.website || "",
      annualRevenue: c.annualRevenue || 0,
    }))

    const headers = [
      { key: "name", label: "Company Name" },
      { key: "domain", label: "Domain" },
      { key: "industry", label: "Industry" },
      { key: "size", label: "Company Size" },
      { key: "phone", label: "Phone" },
      { key: "website", label: "Website" },
      { key: "annualRevenue", label: "Annual Revenue" },
    ]

    const csvContent = generateCsv(rows, headers)
    downloadCsvInBrowser(`novaflow-companies-${new Date().toISOString().slice(0, 10)}.csv`, csvContent)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportStatus(null)

    const reader = new FileReader()
    reader.onload = event => {
      const text = event.target?.result as string
      setImportPreview(text)
    }
    reader.readAsText(file)
  }

  const handleExecuteImport = () => {
    if (!importPreview) return
    setImportStatus(null)

    startTransition(async () => {
      const res = await importCompaniesFromCsv(importPreview)
      if (res?.error) {
        setImportStatus({ error: res.error })
      } else {
        setImportStatus({
          message: `Successfully imported ${res.count} company account(s).`,
          count: res.count,
        })
        setTimeout(() => {
          setShowImportModal(false)
          window.location.reload()
        }, 1200)
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search companies & domains..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="text-xs rounded-lg border border-border bg-paper hover:bg-ink/[0.03] text-ink px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export companies to CSV"
          >
            <Download className="h-3.5 w-3.5 text-muted" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setImportFile(null)
              setImportPreview("")
              setImportStatus(null)
              setShowImportModal(true)
            }}
            className="text-xs rounded-lg border border-border bg-paper hover:bg-ink/[0.03] text-ink px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Import companies from CSV"
          >
            <Upload className="h-3.5 w-3.5 text-muted" />
            <span>Import CSV</span>
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted border border-dashed border-border rounded-xl">
            No companies found. Click &quot;Add Company&quot; or &quot;Import CSV&quot; to populate your target accounts!
          </div>
        ) : (
          filteredCompanies.map(company => {
            const activeDeals = company.deals.filter(d => !["WON", "LOST"].includes(d.stage))
            const pipelineSum = activeDeals.reduce((sum, d) => sum + d.value, 0)

            return (
              <div
                key={company.id}
                className="group rounded-xl border border-border bg-paper p-5 shadow-xs hover:shadow-md hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-ink text-paper font-bold flex items-center justify-center text-base shrink-0 shadow-xs">
                        {company.name.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-ink">{company.name}</h3>
                        <p className="text-[11px] text-muted">{company.industry || "Technology"}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(company.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-alert p-1 transition-opacity"
                      title="Delete company"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 py-3 border-y border-border/60 text-xs">
                    {company.domain && (
                      <div className="flex items-center justify-between text-muted">
                        <span>Domain:</span>
                        <a
                          href={company.website || `https://${company.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-accent hover:underline flex items-center gap-1"
                        >
                          <span>{company.domain}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted">
                      <span>Size:</span>
                      <span className="font-medium text-ink">{company.size || "50-200"}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted">
                      <span>Stakeholders:</span>
                      <span className="font-mono font-bold text-ink">
                        {company.contacts.length} contact{company.contacts.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                  <span className="text-muted">Active Pipeline:</span>
                  <span className="font-mono font-bold text-ink">
                    ${pipelineSum.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-ink">Import Companies (CSV)</h2>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted mb-4">
              Upload a `.csv` file with column headers like <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">name</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">domain</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">industry</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">size</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">phone</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">website</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">revenue</code>.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent rounded-xl p-6 text-center cursor-pointer transition-colors bg-ink/[0.01]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-muted mx-auto mb-2" />
              <div className="text-xs font-semibold text-ink">
                {importFile ? importFile.name : "Click to select a CSV file"}
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : "Supports UTF-8 CSV exports"}
              </div>
            </div>

            {importPreview && (
              <div className="mt-3 p-2.5 rounded-lg bg-ink/[0.02] border border-border text-[11px] font-mono text-muted max-h-32 overflow-y-auto">
                <div className="font-semibold text-ink mb-1 font-sans">File Preview (First lines):</div>
                <pre className="whitespace-pre-wrap">{importPreview.split("\n").slice(0, 6).join("\n")}</pre>
              </div>
            )}

            {importStatus?.error && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{importStatus.error}</span>
              </div>
            )}

            {importStatus?.message && (
              <div className="mt-3 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-2 rounded-lg border border-border text-muted hover:text-ink text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!importPreview || isPending}
                onClick={handleExecuteImport}
                className="bg-ink hover:bg-accent text-paper font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs text-xs disabled:opacity-50"
              >
                {isPending ? "Importing Data..." : "Import Companies"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Company Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Add Company Account</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async formData => {
                await createCompany(formData)
                setShowModal(false)
                window.location.reload()
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Company Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Domain</label>
                  <input
                    name="domain"
                    placeholder="acme.com"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Industry</label>
                  <input
                    name="industry"
                    placeholder="e.g. Fintech"
                    defaultValue="Technology"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Company Size</label>
                  <select
                    name="size"
                    defaultValue="50-200"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="10-50">10-50 employees</option>
                    <option value="50-200">50-200 employees</option>
                    <option value="200-1000">200-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Phone</label>
                  <input
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-lg border border-border text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink hover:bg-accent text-paper font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

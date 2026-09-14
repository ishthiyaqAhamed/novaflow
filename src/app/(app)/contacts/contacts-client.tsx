"use client"

import { useState, useTransition, useRef } from "react"
import {
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  Trash2,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { createContact, deleteContact } from "./actions"
import { importContactsFromCsv } from "./csv-actions"
import { generateCsv, downloadCsvInBrowser } from "@/lib/csv"

interface CompanyOption {
  id: string
  name: string
}

interface ContactItem {
  id: string
  name: string
  email: string
  phone: string | null
  title: string | null
  status: string
  avatarUrl: string | null
  company: { id: string; name: string } | null
  deals: { id: string; title: string; value: number }[]
}

interface ContactsClientProps {
  initialContacts: ContactItem[]
  companies: CompanyOption[]
}

export function ContactsClient({ initialContacts, companies }: ContactsClientProps) {
  const [contacts, setContacts] = useState<ContactItem[]>(initialContacts)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<string>("")
  const [importStatus, setImportStatus] = useState<{ message?: string; error?: string; count?: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return
    setContacts(prev => prev.filter(c => c.id !== contactId))
    startTransition(async () => {
      await deleteContact(contactId)
    })
  }

  const handleExportCsv = () => {
    const rows = filteredContacts.map(c => ({
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      title: c.title || "",
      company: c.company?.name || "",
      status: c.status,
    }))

    const headers = [
      { key: "name", label: "Full Name" },
      { key: "email", label: "Email Address" },
      { key: "phone", label: "Phone" },
      { key: "title", label: "Job Title" },
      { key: "company", label: "Company" },
      { key: "status", label: "Status" },
    ]

    const csvContent = generateCsv(rows, headers)
    downloadCsvInBrowser(`novaflow-contacts-${new Date().toISOString().slice(0, 10)}.csv`, csvContent)
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
      const res = await importContactsFromCsv(importPreview)
      if (res?.error) {
        setImportStatus({ error: res.error })
      } else {
        setImportStatus({
          message: `Successfully imported ${res.count} contact(s).`,
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
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-paper px-3 py-1.5 text-muted focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="CHURNED">Churned</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="text-xs rounded-lg border border-border bg-paper hover:bg-ink/[0.03] text-ink px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export contacts to CSV"
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
            title="Import contacts from CSV"
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
          <span>Add Contact</span>
        </button>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border border-border bg-paper shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-ink/[0.01]">
              <tr className="text-muted font-medium">
                <th className="py-3 px-4 font-semibold">Contact Person</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 font-semibold">Email & Phone</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Associated Deals</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No contacts found. Click &quot;Add Contact&quot; or &quot;Import CSV&quot; to populate your CRM.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-ink/[0.01] transition-colors">
                    {/* Contact Person */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-ink text-paper font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-ink">{contact.name}</div>
                          <div className="text-[11px] text-muted">{contact.title || "Decision Maker"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      {contact.company ? (
                        <div className="flex items-center gap-1.5 font-medium text-ink">
                          <Building className="h-3.5 w-3.5 text-muted" />
                          <span>{contact.company.name}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1.5 text-accent hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          <span>{contact.email}</span>
                        </a>
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-muted font-mono text-[10px]">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          contact.status === "ACTIVE"
                            ? "bg-signal/10 text-signal"
                            : contact.status === "LEAD"
                            ? "bg-accent/10 text-accent"
                            : "bg-ink/5 text-muted"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>

                    {/* Deals Link */}
                    <td className="py-3.5 px-4">
                      {contact.deals.length > 0 ? (
                        <span className="text-[11px] font-mono font-bold text-ink">
                          {contact.deals.length} deal{contact.deals.length > 1 ? "s" : ""} ($
                          {(contact.deals.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}k)
                        </span>
                      ) : (
                        <span className="text-muted text-[11px]">No active deals</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-muted hover:text-alert p-1 transition-colors"
                        title="Delete contact"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <h2 className="text-base font-bold text-ink">Import Contacts (CSV)</h2>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted mb-4">
              Upload a `.csv` spreadsheet file with columns such as <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">name</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">email</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">company</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">phone</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">title</code>, <code className="bg-ink/5 px-1 py-0.5 rounded font-mono text-ink">status</code>. Any new companies mentioned will be automatically provisioned.
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
                {isPending ? "Importing Data..." : "Import Contacts"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Add New Contact</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async formData => {
                await createContact(formData)
                setShowModal(false)
                window.location.reload()
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Full Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="sarah@company.com"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Title / Role</label>
                  <input
                    name="title"
                    placeholder="e.g. VP Engineering"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Phone Number</label>
                  <input
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Company Account</label>
                  <input
                    list="contact-companies-list"
                    name="companyName"
                    placeholder="Type or select company..."
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                  <datalist id="contact-companies-list">
                    {companies.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue="ACTIVE"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="LEAD">Lead</option>
                    <option value="CHURNED">Churned</option>
                  </select>
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  Trash2,
  X,
  User,
  ExternalLink,
} from "lucide-react"
import { createContact, deleteContact } from "./actions"

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
  const [isPending, startTransition] = useTransition()

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

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
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
                <th className="py-3 px-4 font-semibold">Active Deals</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-ink/[0.01] transition-colors">
                    {/* Name & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {contact.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                            {contact.name.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-ink text-xs">{contact.name}</div>
                          <div className="text-[10px] text-muted">{contact.title || "Decision Maker"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4 text-muted">
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
                  <label className="block text-muted font-medium mb-1">Company</label>
                  <select
                    name="companyId"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">Select Company...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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

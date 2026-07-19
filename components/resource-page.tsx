"use client"

import { useState, useTransition, useCallback } from "react"
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react"
import type { ResourceConfig } from "@/lib/resources"
import { formatCurrency, formatDate } from "@/lib/format"
import { toCSV, downloadCSV } from "@/lib/export"
import { createRecord, updateRecord, deleteRecords } from "@/app/actions/crud"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ResourcePageProps {
  resource: ResourceConfig
  rows: Record<string, unknown>[]
  currency?: string
}

function formatCell(value: unknown, type?: string, currency?: string) {
  if (value === null || value === undefined) return "—"
  if (type === "currency") return formatCurrency(Number(value), currency)
  if (type === "date") return formatDate(value as string)
  if (type === "badge") {
    const v = String(value)
    const variant =
      v === "active" || v === "Cash" ? ("default" as const) :
      v === "terminated" || v === "Credit" ? ("destructive" as const) :
      v === "on_leave" || v === "sold" || v === "closed" ? ("secondary" as const) :
      "outline" as const
    return <Badge variant={variant}>{v}</Badge>
  }
  if (type === "number") return Number(value).toLocaleString()
  return String(value)
}

function RecordForm({
  resource,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  resource: ResourceConfig
  initial?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void
  onCancel: () => void
  submitting: boolean
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial ?? {})

  function set(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {resource.fields.map((f) => (
        <div key={f.name} className="grid gap-1.5">
          <Label htmlFor={f.name}>
            {f.label}
            {f.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {f.type === "select" && f.options ? (
            <Select
              value={String(values[f.name] ?? "")}
              onValueChange={(v) => set(f.name, v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${f.label}`} />
              </SelectTrigger>
              <SelectContent>
                {f.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : f.type === "textarea" ? (
            <Textarea
              id={f.name}
              value={String(values[f.name] ?? "")}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
            />
          ) : (
            <Input
              id={f.name}
              type={f.type === "email" ? "email" : f.type === "date" ? "date" : "text"}
              inputMode={f.type === "number" ? "decimal" : undefined}
              step={f.step}
              value={values[f.name] === null || values[f.name] === undefined ? "" : String(values[f.name])}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
            />
          )}
        </div>
      ))}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save Changes" : `Create ${resource.singular}`}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ResourcePage({ resource, rows, currency = "USD" }: ResourcePageProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = rows.filter((row) => {
    if (!search) return true
    const q = search.toLowerCase()
    return resource.searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
  })

  const toggleAll = useCallback(() => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((r) => String(r.id))))
    }
  }, [selected.size, filtered])

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  async function handleCreate(values: Record<string, unknown>) {
    setSubmitting(true)
    const result = await createRecord(resource.slug, values)
    setSubmitting(false)
    if (result.success) {
      setFormOpen(false)
    } else {
      alert(result.error)
    }
  }

  async function handleUpdate(values: Record<string, unknown>) {
    if (!editing?.id) return
    setSubmitting(true)
    const result = await updateRecord(resource.slug, String(editing.id), values)
    setSubmitting(false)
    if (result.success) {
      setFormOpen(false)
      setEditing(null)
    } else {
      alert(result.error)
    }
  }

  async function handleDelete() {
    const ids = Array.from(selected)
    setSubmitting(true)
    const result = await deleteRecords(resource.slug, ids)
    setSubmitting(false)
    if (result.success) {
      setSelected(new Set())
      setDeleteConfirmOpen(false)
    } else {
      alert(result.error)
    }
  }

  function handleExport() {
    const csv = toCSV(resource.columns, filtered as Record<string, unknown>[])
    downloadCSV(`${resource.slug}.csv`, csv)
  }

  return (
    <div>
      <PageHeader title={resource.label} description={resource.description}>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4" />
          Add {resource.singular}
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${resource.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete ({selected.size})
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              {resource.columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={resource.columns.length + 2} className="h-24 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={String(row.id)} data-state={selected.has(String(row.id)) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(String(row.id))}
                      onCheckedChange={() => toggleOne(String(row.id))}
                    />
                  </TableCell>
                  {resource.columns.map((col) => (
                    <TableCell key={col.key}>
                      {formatCell(row[col.key], col.type, currency)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => { setEditing(row); setFormOpen(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        {search ? ` (filtered from ${rows.length})` : ""}
      </p>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${resource.singular}` : `New ${resource.singular}`}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? `Update the ${resource.singular.toLowerCase()} details below.`
                : `Fill in the details to create a new ${resource.singular.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <RecordForm
              key={String(editing.id)}
              resource={resource}
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => { setFormOpen(false); setEditing(null) }}
              submitting={submitting}
            />
          ) : (
            <RecordForm
              resource={resource}
              onSubmit={handleCreate}
              onCancel={() => setFormOpen(false)}
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {resource.label}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selected.size} {selected.size === 1 ? "record" : "records"}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

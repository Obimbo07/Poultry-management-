import type { ResourceColumn } from "@/lib/resources"

export function toCSV(columns: ResourceColumn[], rows: Record<string, unknown>[]) {
  const header = columns.map((c) => `"${c.label}"`).join(",")
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const v = row[c.key]
          const s = v === null || v === undefined ? "" : String(v)
          return `"${s.replace(/"/g, '""')}"`
        })
        .join(","),
    )
    .join("\n")
  return `${header}\n${body}`
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

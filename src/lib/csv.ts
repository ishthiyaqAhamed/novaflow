/**
 * Utility functions for generating and parsing RFC-4180 compliant CSV files.
 */

export function generateCsv(rows: Record<string, any>[], headers: { key: string; label: string }[]): string {
  const headerRow = headers.map(h => escapeCsvCell(h.label)).join(",")

  const bodyRows = rows.map(row => {
    return headers
      .map(h => {
        const val = row[h.key]
        if (val === null || val === undefined) return ""
        if (typeof val === "object" && val instanceof Date) return val.toISOString()
        return escapeCsvCell(String(val))
      })
      .join(",")
  })

  return [headerRow, ...bodyRows].join("\r\n")
}

function escapeCsvCell(cell: string): string {
  if (cell.includes(",") || cell.includes('"') || cell.includes("\n") || cell.includes("\r")) {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}

export function parseCsv(csvText: string): Record<string, string>[] {
  const lines: string[] = []
  let currentLine = ""
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++
      }
      if (currentLine.trim()) {
        lines.push(currentLine)
      }
      currentLine = ""
    } else {
      currentLine += char
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine)
  }

  if (lines.length < 2) return []

  const parseLine = (line: string): string[] => {
    const cells: string[] = []
    let cell = ""
    let quoted = false

    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      const next = line[i + 1]

      if (c === '"') {
        if (quoted && next === '"') {
          cell += '"'
          i++
        } else {
          quoted = !quoted
        }
      } else if (c === "," && !quoted) {
        cells.push(cell.trim())
        cell = ""
      } else {
        cell += c
      }
    }
    cells.push(cell.trim())
    return cells
  }

  const rawHeaders = parseLine(lines[0])
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""))

  const records: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    if (values.every(v => !v)) continue // skip empty row

    const record: Record<string, string> = {}
    rawHeaders.forEach((rawHeader, idx) => {
      const key = headers[idx] || rawHeader.toLowerCase().trim()
      record[key] = values[idx] || ""
    })
    records.push(record)
  }

  return records
}

export function downloadCsvInBrowser(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

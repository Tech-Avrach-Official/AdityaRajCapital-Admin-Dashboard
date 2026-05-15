/**
 * Shared CSV export utility.
 * Produces a BOM-prefixed, RFC-4180 compliant CSV and triggers a browser download.
 *
 * @param {string[]}   headers  - Column header labels (must match `rows` column order exactly)
 * @param {Array[]}    rows     - Array of row arrays; each inner array must have same length as `headers`
 * @param {string}     filename - Suggested filename (without extension; .csv is added automatically)
 */
export function exportToCsv(headers, rows, filename) {
  if (!headers?.length) throw new Error("exportToCsv: headers array is required")

  const escapeCsvCell = (val) => {
    const s = String(val ?? "")
    // Wrap in quotes if the value contains a comma, double-quote, newline, or carriage-return
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const csvRows = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => {
      // Guard: if a row has fewer columns than headers, pad with empty strings
      const padded = headers.map((_, idx) => row[idx] ?? "")
      return padded.map(escapeCsvCell).join(",")
    }),
  ]

  // \uFEFF = UTF-8 BOM so Excel opens the file correctly without a charset dialog
  const csv = "\uFEFF" + csvRows.join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

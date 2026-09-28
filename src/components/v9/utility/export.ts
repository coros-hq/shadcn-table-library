export function toCsv(headers: string[], rows: string[][]): string {
  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

  return [headers, ...rows]
    .map((row) => row.map(escape).join(','))
    .join('\n')
}

export function toExcelHtml(headers: string[], rows: string[][]): string {
  const th = headers.map((h) => `<th>${h}</th>`).join('')
  const trs = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('')

  return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

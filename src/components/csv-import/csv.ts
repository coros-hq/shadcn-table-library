export interface CsvData {
  headers: string[]
  rows: string[][]
}

/**
 * A small RFC 4180 parser: quoted fields, doubled quotes, line breaks inside
 * quotes, CRLF, and comma, semicolon or tab delimiters (whichever the header
 * row uses most). Blank lines are dropped and short rows padded.
 */
export function parseCsv(input: string): CsvData {
  const text = input.replace(/^\uFEFF/, '')
  const firstLine = text.slice(0, text.search(/\r?\n|$/))
  const delimiter = [',', ';', '\t'].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  )

  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"' && field === '') quoted = true
    else if (char === delimiter) {
      record.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      record.push(field)
      records.push(record)
      record = []
      field = ''
    } else field += char
  }
  if (quoted) throw new Error('A quoted value is never closed.')
  if (field || record.length) {
    record.push(field)
    records.push(record)
  }

  const nonEmpty = records.filter((r) => r.some((v) => v.trim()))
  if (nonEmpty.length < 2) {
    throw new Error('The file needs a header row and at least one row of data.')
  }
  const [headers, ...rows] = nonEmpty
  return {
    headers: headers.map((h, i) => h.trim() || `Column ${i + 1}`),
    rows: rows.map((r) => headers.map((_, i) => r[i] ?? '')),
  }
}

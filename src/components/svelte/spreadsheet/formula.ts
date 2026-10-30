export const COLS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
export const ROW_COUNT = 20

export type CellKind = 'number' | 'text' | 'error' | 'empty'

export type CellView = {
  text: string
  kind: CellKind
  value: number | null
}

type Scalar = number | string | null
type Value = Scalar | Scalar[]
type Token = { type: 'num' | 'id' | 'op'; text: string }

// The message is the spreadsheet error code, e.g. #DIV/0!
class SheetError extends Error {}

const err = (code: string) => new SheetError(code)

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  const re = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z]+[0-9]*)|(\S))/y
  let match: RegExpExecArray | null
  while ((match = re.exec(src))) {
    if (match[1]) tokens.push({ type: 'num', text: match[1] })
    else if (match[2]) tokens.push({ type: 'id', text: match[2] })
    else tokens.push({ type: 'op', text: match[3] })
  }
  return tokens
}

function parseRef(text: string) {
  const match = /^([A-Za-z])(\d+)$/.exec(text)
  if (!match) throw err('#NAME?')
  const c = (COLS as readonly string[]).indexOf(match[1].toUpperCase())
  const r = Number(match[2]) - 1
  if (c < 0 || r < 0 || r >= ROW_COUNT) throw err('#REF!')
  return { r, c }
}

function toNumber(value: Value): number {
  if (value === null) return 0
  if (typeof value !== 'number') throw err('#VALUE!')
  return value
}

function formatNumber(n: number) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1e4) / 1e4)
}

/** Evaluates every cell: plain numbers, text, and `=` formulas (+ - * /, parentheses, A1 refs, ranges, SUM AVERAGE MIN MAX COUNT) */
export function evaluateSheet(raw: string[][]): CellView[][] {
  const cache = new Map<string, Scalar | SheetError>()
  const visiting = new Set<string>()

  function cellValue(r: number, c: number): Scalar {
    const key = `${r},${c}`
    const hit = cache.get(key)
    if (hit !== undefined) {
      if (hit instanceof SheetError) throw hit
      return hit
    }
    // A cell that is reached again while it is still being evaluated is a cycle
    if (visiting.has(key)) throw err('#CIRC!')
    visiting.add(key)
    try {
      const value = compute(raw[r][c])
      cache.set(key, value)
      return value
    } catch (e) {
      if (e instanceof SheetError) cache.set(key, e)
      throw e
    } finally {
      visiting.delete(key)
    }
  }

  function compute(text: string): Scalar {
    const trimmed = text.trim()
    if (trimmed === '') return null
    if (trimmed.startsWith('=')) return evaluateFormula(trimmed.slice(1))
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : text
  }

  function evaluateFormula(src: string): number {
    const tokens = tokenize(src)
    let pos = 0
    const peek = () => tokens.at(pos)
    const next = () => tokens.at(pos++)
    const isOp = (token: Token | undefined, op: string) =>
      token?.type === 'op' && token.text === op

    function expect(op: string) {
      if (!isOp(next(), op)) throw err('#ERR!')
    }

    function expr(): Value {
      let left = term()
      while (isOp(peek(), '+') || isOp(peek(), '-')) {
        const op = next()!.text
        const a = toNumber(left)
        const b = toNumber(term())
        left = op === '+' ? a + b : a - b
      }
      return left
    }

    function term(): Value {
      let left = unary()
      while (isOp(peek(), '*') || isOp(peek(), '/')) {
        const op = next()!.text
        const a = toNumber(left)
        const b = toNumber(unary())
        if (op === '/' && b === 0) throw err('#DIV/0!')
        left = op === '*' ? a * b : a / b
      }
      return left
    }

    function unary(): Value {
      if (isOp(peek(), '-')) {
        next()
        return -toNumber(unary())
      }
      return primary()
    }

    function primary(): Value {
      const token = next()
      if (!token) throw err('#ERR!')
      if (token.type === 'num') return Number(token.text)
      if (isOp(token, '(')) {
        const inner = expr()
        expect(')')
        return inner
      }
      if (token.type !== 'id') throw err('#ERR!')
      if (isOp(peek(), '(')) {
        next()
        return call(token.text.toUpperCase())
      }
      const from = parseRef(token.text)
      if (!isOp(peek(), ':')) return cellValue(from.r, from.c)
      next()
      const end = next()
      if (end?.type !== 'id') throw err('#ERR!')
      const to = parseRef(end.text)
      const values: Scalar[] = []
      for (let r = Math.min(from.r, to.r); r <= Math.max(from.r, to.r); r++) {
        for (let c = Math.min(from.c, to.c); c <= Math.max(from.c, to.c); c++) {
          values.push(cellValue(r, c))
        }
      }
      return values
    }

    function call(name: string): number {
      const args: Value[] = []
      if (!isOp(peek(), ')')) {
        args.push(expr())
        while (isOp(peek(), ',')) {
          next()
          args.push(expr())
        }
      }
      expect(')')
      // Text and empty cells inside ranges are skipped, as in a real spreadsheet
      const nums = args.flat().filter((v): v is number => typeof v === 'number')
      const sum = nums.reduce((total, n) => total + n, 0)
      switch (name) {
        case 'SUM':
          return sum
        case 'AVERAGE':
          if (nums.length === 0) throw err('#DIV/0!')
          return sum / nums.length
        case 'MIN':
          return nums.length ? Math.min(...nums) : 0
        case 'MAX':
          return nums.length ? Math.max(...nums) : 0
        case 'COUNT':
          return nums.length
        default:
          throw err('#NAME?')
      }
    }

    const result = expr()
    if (pos < tokens.length) throw err('#ERR!')
    if (Array.isArray(result)) throw err('#VALUE!')
    return toNumber(result)
  }

  return raw.map((row, r) =>
    row.map((_, c): CellView => {
      try {
        const value = cellValue(r, c)
        if (value === null) return { text: '', kind: 'empty', value: null }
        if (typeof value === 'number') {
          return { text: formatNumber(value), kind: 'number', value }
        }
        return { text: value, kind: 'text', value: null }
      } catch (e) {
        if (e instanceof SheetError) {
          return { text: e.message, kind: 'error', value: null }
        }
        throw e
      }
    }),
  )
}

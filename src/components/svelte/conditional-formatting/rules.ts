/**
 * A tiny rule engine, not a table feature — any column's cell renderer can
 * call matchRule against its own row and get back a className. Rules are
 * checked in order and the first match wins, so put the most specific
 * condition (e.g. "out of stock") before the more general one ("low stock").
 */
export interface FormatRule<TData> {
  test: (row: TData) => boolean
  className: string
  label?: string
}

export function matchRule<TData>(
  row: TData,
  rules: FormatRule<TData>[],
): FormatRule<TData> | undefined {
  return rules.find((rule) => rule.test(row))
}

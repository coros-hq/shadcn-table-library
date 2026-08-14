/**
 * Same tiny rule engine as the Conditional Formatting Table example — a
 * rule is a predicate over the whole row plus a className. Rules are
 * checked in order and the first match wins.
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

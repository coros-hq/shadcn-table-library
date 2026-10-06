import { describe, expect, it } from 'vitest'
import {
  COLS,
  ROW_COUNT,
  evaluateSheet,
} from '#/components/spreadsheet/formula'
import { initialSheet } from '#/components/spreadsheet/data'

function sheet(cells: Record<string, string>) {
  const raw = Array.from({ length: ROW_COUNT }, () => COLS.map(() => ''))
  for (const [name, value] of Object.entries(cells)) {
    raw[Number(name.slice(1)) - 1][
      COLS.indexOf(name[0] as (typeof COLS)[number])
    ] = value
  }
  const view = evaluateSheet(raw)
  return (name: string) =>
    view[Number(name.slice(1)) - 1][
      COLS.indexOf(name[0] as (typeof COLS)[number])
    ]
}

describe('spreadsheet formulas', () => {
  it('reads numbers, text and empty cells', () => {
    const get = sheet({ A1: '42', A2: 'hello', A3: ' 7.5 ' })
    expect(get('A1')).toMatchObject({ kind: 'number', value: 42, text: '42' })
    expect(get('A2')).toMatchObject({
      kind: 'text',
      text: 'hello',
      value: null,
    })
    expect(get('A3')).toMatchObject({ kind: 'number', value: 7.5 })
    expect(get('B9')).toMatchObject({ kind: 'empty', text: '' })
  })

  it('does arithmetic with precedence, parentheses and unary minus', () => {
    const get = sheet({
      A1: '=1+2*3',
      A2: '=(1+2)*3',
      A3: '=-4+10/4',
      A4: '= 2 * ( 3 + 4 ) - 1',
    })
    expect(get('A1').value).toBe(7)
    expect(get('A2').value).toBe(9)
    expect(get('A3').value).toBe(-1.5)
    expect(get('A4').value).toBe(13)
  })

  it('follows cell references, including formulas that depend on formulas', () => {
    const get = sheet({ A1: '10', A2: '=A1*2', A3: '=A2+A1', B1: '=a1+1' })
    expect(get('A3').value).toBe(30)
    expect(get('B1').value).toBe(11)
  })

  it('treats an empty referenced cell as zero', () => {
    expect(sheet({ A1: '=B1+5' })('A1').value).toBe(5)
  })

  it('aggregates ranges and skips text and empty cells', () => {
    const get = sheet({
      A1: '1',
      A2: '2',
      A3: 'x',
      A5: '6',
      B1: '=SUM(A1:A5)',
      B2: '=AVERAGE(A1:A5)',
      B3: '=MIN(A1:A5)',
      B4: '=MAX(A1:A5)',
      B5: '=COUNT(A1:A5)',
      B6: '=SUM(A1:A2, 10)',
      B7: '=SUM(A5:A1)',
    })
    expect(get('B1').value).toBe(9)
    expect(get('B2').value).toBe(3)
    expect(get('B3').value).toBe(1)
    expect(get('B4').value).toBe(6)
    expect(get('B5').value).toBe(3)
    expect(get('B6').value).toBe(13)
    expect(get('B7').value).toBe(9)
  })

  it('reports errors instead of throwing', () => {
    const get = sheet({
      A1: '=1/0',
      A2: '=A2',
      A3: '=B3',
      B3: '=A3',
      A4: '=ZZ9+1',
      A5: '=Z1',
      A6: '=A21',
      A7: 'text',
      A8: '=A7+1',
      A9: '=1+',
      A10: '=SUM(',
      A11: '=NOPE(1)',
      A12: '=AVERAGE(B20:B20)',
      A13: '=C1:C2',
      A14: '=A1+1',
    })
    expect(get('A1').text).toBe('#DIV/0!')
    expect(get('A2').text).toBe('#CIRC!')
    expect(get('A3').text).toBe('#CIRC!')
    expect(get('B3').text).toBe('#CIRC!')
    expect(get('A4').text).toBe('#NAME?')
    expect(get('A5').text).toBe('#REF!')
    expect(get('A6').text).toBe('#REF!')
    expect(get('A8').text).toBe('#VALUE!')
    expect(get('A9').text).toBe('#ERR!')
    expect(get('A10').text).toBe('#ERR!')
    expect(get('A11').text).toBe('#NAME?')
    expect(get('A12').text).toBe('#DIV/0!')
    expect(get('A13').text).toBe('#VALUE!')
    // An error in a dependency carries through
    expect(get('A14').text).toBe('#DIV/0!')
    expect(get('A1').kind).toBe('error')
  })

  it('rounds long decimals for display', () => {
    expect(sheet({ A1: '=1/3' })('A1').text).toBe('0.3333')
  })

  it('evaluates the demo sheet without errors', () => {
    const view = evaluateSheet(initialSheet())
    const errors = view.flat().filter((cell) => cell.kind === 'error')
    expect(errors).toEqual([])
    // Total column and total row of the budget
    expect(view[1][4].value).toBe(5400)
    expect(view[6][1].value).toBe(2493)
  })
})

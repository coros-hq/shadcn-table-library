export type Density = 'compact' | 'comfortable' | 'spacious'

export const densityCellClass: Record<Density, string> = {
  compact: 'py-1 text-xs',
  comfortable: 'py-2 text-sm',
  spacious: 'py-4 text-base',
}

export const densityHeadClass: Record<Density, string> = {
  compact: 'h-8 text-xs',
  comfortable: 'h-10 text-sm',
  spacious: 'h-14 text-base',
}

export type FontSizeLevel = 'default' | 'large' | 'xlarge'

export const DEFAULT_FONT_SIZE_LEVEL: FontSizeLevel = 'default'

export const FONT_SIZE_SCALE: Record<FontSizeLevel, number> = {
  default: 1,
  large: 1.08,
  xlarge: 1.16,
}

export function normalizeFontSizeLevel(value: string | null | undefined): FontSizeLevel {
  if (value === 'large' || value === 'xlarge') return value
  return DEFAULT_FONT_SIZE_LEVEL
}

export function fontScaleForLevel(value: string | null | undefined): number {
  return FONT_SIZE_SCALE[normalizeFontSizeLevel(value)]
}

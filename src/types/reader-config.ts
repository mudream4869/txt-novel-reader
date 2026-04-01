export type SplitMethod = 'regex' | 'line-count'

export type FontFamily = 'system' | 'serif' | 'sans-serif' | 'monospace'

export const fontFamilyLabels: Record<FontFamily, string> = {
  system: '系統預設',
  serif: '襯線體',
  'sans-serif': '無襯線體',
  monospace: '等寬體'
}

export const fontFamilyCss: Record<FontFamily, string> = {
  system: 'system-ui, sans-serif',
  serif: 'serif',
  'sans-serif': 'sans-serif',
  monospace: 'monospace'
}

export const DEFAULT_FONT_SIZE = '18'
export const DEFAULT_FONT_FAMILY: FontFamily = 'system'

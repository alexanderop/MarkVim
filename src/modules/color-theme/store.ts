import type { Result } from '~/shared/utils/result'
import { useCssVar, useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { readonly, watchEffect } from 'vue'
import { z } from 'zod'
import { Err, Ok, tryCatch } from '~/shared/utils/result'

export interface OklchColor {
  l: number // Lightness: 0-1
  c: number // Chroma: 0-0.4
  h: number // Hue: 0-360
  a?: number // Alpha: 0-1 (optional for backwards compatibility)
}

export interface ColorTheme {
  background: OklchColor
  foreground: OklchColor
  accent: OklchColor
  muted: OklchColor
  border: OklchColor
  alertNote: OklchColor
  alertTip: OklchColor
  alertImportant: OklchColor
  alertWarning: OklchColor
  alertCaution: OklchColor
}

// --- THE MESSAGES ---
// A union type of all possible actions that can change the state.
export type ColorThemeMessage
  = | { type: 'UPDATE_COLOR', payload: { colorKey: keyof ColorTheme, color: OklchColor } }
    | { type: 'RESET_TO_DEFAULTS' }
    | { type: 'IMPORT_THEME', payload: { theme: ColorTheme } }

// Color constants
const MAX_CHROMA = 0.4
const HUE_DEGREES_FULL_CIRCLE = 360
const PERCENTAGE_FACTOR = 100
const DECIMAL_PLACES_PERCENTAGE = 1
const DECIMAL_PLACES_CHROMA = 3

// Zod schemas for validation
const OklchColorSchema = z.object({
  l: z.number().min(0).max(1),
  c: z.number().min(0).max(MAX_CHROMA),
  h: z.number().min(0).max(HUE_DEGREES_FULL_CIRCLE),
  a: z.number().min(0).max(1).optional(),
})

const ColorThemeSchema = z.object({
  background: OklchColorSchema,
  foreground: OklchColorSchema,
  accent: OklchColorSchema,
  muted: OklchColorSchema,
  border: OklchColorSchema,
  alertNote: OklchColorSchema,
  alertTip: OklchColorSchema,
  alertImportant: OklchColorSchema,
  alertWarning: OklchColorSchema,
  alertCaution: OklchColorSchema,
})

// Default dark mode colors
export const DEFAULT_COLOR_THEME: ColorTheme = {
  background: { l: 0.12, c: 0.002, h: 0 }, // oklch(12% 0.002 0) - Deep dark background
  foreground: { l: 0.96, c: 0, h: 0 }, // oklch(96% 0 0) - Light text
  accent: { l: 0.60, c: 0.18, h: 240 }, // oklch(60% 0.18 240) - Brighter blue for dark mode
  muted: { l: 0.20, c: 0.002, h: 0 }, // oklch(20% 0.002 0) - Dark muted surfaces
  border: { l: 0.25, c: 0.003, h: 20 }, // oklch(25% 0.003 20) - Subtle dark borders
  alertNote: { l: 0.60, c: 0.18, h: 240 }, // Blue - Note/Info
  alertTip: { l: 0.65, c: 0.18, h: 140 }, // Green - Tips/Success
  alertImportant: { l: 0.65, c: 0.18, h: 280 }, // Purple - Important
  alertWarning: { l: 0.65, c: 0.18, h: 80 }, // Orange - Warning
  alertCaution: { l: 0.65, c: 0.18, h: 20 }, // Red - Danger/Caution
}

// --- THE UPDATE FUNCTION (Reducer) ---
// A pure function that calculates the next state based on the current state and a message.
function update(currentTheme: ColorTheme, message: ColorThemeMessage): ColorTheme {
  switch (message.type) {
    case 'UPDATE_COLOR':
      return {
        ...currentTheme,
        [message.payload.colorKey]: message.payload.color,
      }

    case 'RESET_TO_DEFAULTS':
      return { ...DEFAULT_COLOR_THEME }

    case 'IMPORT_THEME':
      return { ...message.payload.theme }

    default:
      return currentTheme
  }
}

// Public store (exported)
export const useColorThemeStore = defineStore('color-theme', () => {
  // Internal state
  const _theme = useLocalStorage<ColorTheme>('markvim-color-theme', DEFAULT_COLOR_THEME, {
    mergeDefaults: true,
  })

  // Helper function for converting OKLCH to string
  function oklchToString(color: OklchColor): string {
    const alpha = color.a !== undefined ? ` / ${color.a.toFixed(DECIMAL_PLACES_CHROMA)}` : ''
    return `oklch(${(color.l * PERCENTAGE_FACTOR).toFixed(DECIMAL_PLACES_PERCENTAGE)}% ${color.c.toFixed(DECIMAL_PLACES_CHROMA)} ${color.h.toFixed(0)}${alpha})`
  }

  // CSS custom property references
  const backgroundVar = useCssVar('--background')
  const foregroundVar = useCssVar('--foreground')
  const accentVar = useCssVar('--accent')
  const mutedVar = useCssVar('--muted')
  const borderVar = useCssVar('--border')
  const alertNoteVar = useCssVar('--alert-note')
  const alertTipVar = useCssVar('--alert-tip')
  const alertImportantVar = useCssVar('--alert-important')
  const alertWarningVar = useCssVar('--alert-warning')
  const alertCautionVar = useCssVar('--alert-caution')

  // CodeMirror syntax highlighting CSS custom properties
  const cmContentVar = useCssVar('--cm-content')
  const cmHeading1Var = useCssVar('--cm-heading1')
  const cmHeading2Var = useCssVar('--cm-heading2')
  const cmHeading3Var = useCssVar('--cm-heading3')
  const cmHeading4Var = useCssVar('--cm-heading4')
  const cmHeading5Var = useCssVar('--cm-heading5')
  const cmHeading6Var = useCssVar('--cm-heading6')
  const cmKeywordVar = useCssVar('--cm-keyword')
  const cmStringVar = useCssVar('--cm-string')
  const cmCommentVar = useCssVar('--cm-comment')
  const cmNumberVar = useCssVar('--cm-number')
  const cmOperatorVar = useCssVar('--cm-operator')
  const cmVariableNameVar = useCssVar('--cm-variableName')
  const cmPunctuationVar = useCssVar('--cm-punctuation')
  const cmBracketVar = useCssVar('--cm-bracket')
  const cmLinkVar = useCssVar('--cm-link')
  const cmEmphasisVar = useCssVar('--cm-emphasis')
  const cmStrongVar = useCssVar('--cm-strong')
  const cmStrikethroughVar = useCssVar('--cm-strikethrough')

  // CodeMirror selection background - use muted color for vim visual mode
  const cmSelectionBackgroundVar = useCssVar('--cm-selection-background')

  // Update CSS custom properties when theme changes
  watchEffect(() => {
    const currentTheme = _theme.value

    // Guard against undefined theme during initialization
    if (!currentTheme || !currentTheme.background) {
      return
    }

    backgroundVar.value = oklchToString(currentTheme.background)
    foregroundVar.value = oklchToString(currentTheme.foreground)
    accentVar.value = oklchToString(currentTheme.accent)
    mutedVar.value = oklchToString(currentTheme.muted)
    borderVar.value = oklchToString(currentTheme.border)
    alertNoteVar.value = oklchToString(currentTheme.alertNote)
    alertTipVar.value = oklchToString(currentTheme.alertTip)
    alertImportantVar.value = oklchToString(currentTheme.alertImportant)
    alertWarningVar.value = oklchToString(currentTheme.alertWarning)
    alertCautionVar.value = oklchToString(currentTheme.alertCaution)

    // CodeMirror syntax highlighting colors - accent for headings, foreground for regular text
    cmContentVar.value = oklchToString(currentTheme.foreground)
    cmHeading1Var.value = oklchToString(currentTheme.accent)
    cmHeading2Var.value = oklchToString(currentTheme.accent)
    cmHeading3Var.value = oklchToString(currentTheme.accent)
    cmHeading4Var.value = oklchToString(currentTheme.accent)
    cmHeading5Var.value = oklchToString(currentTheme.accent)
    cmHeading6Var.value = oklchToString(currentTheme.accent)
    cmKeywordVar.value = oklchToString(currentTheme.accent)
    cmStringVar.value = oklchToString(currentTheme.foreground)
    cmCommentVar.value = oklchToString(currentTheme.foreground)
    cmNumberVar.value = oklchToString(currentTheme.accent)
    cmOperatorVar.value = oklchToString(currentTheme.foreground)
    cmVariableNameVar.value = oklchToString(currentTheme.foreground)
    cmPunctuationVar.value = oklchToString(currentTheme.foreground)
    cmBracketVar.value = oklchToString(currentTheme.foreground)
    cmLinkVar.value = oklchToString(currentTheme.accent)
    cmEmphasisVar.value = oklchToString(currentTheme.foreground)
    cmStrongVar.value = oklchToString(currentTheme.foreground)
    cmStrikethroughVar.value = oklchToString(currentTheme.foreground)

    // CodeMirror selection background - use muted color with some transparency for vim visual mode
    cmSelectionBackgroundVar.value = oklchToString({ ...currentTheme.muted, a: 0.3 })
  })

  // --- PUBLIC API - Readonly state ---
  const theme = readonly(_theme)

  // --- ACTIONS (The only way to mutate state) ---
  function dispatch(message: ColorThemeMessage): void {
    // Pass the current state and the message to our pure update function.
    // The result is the new state, which we assign back to our reactive state object.
    _theme.value = update(_theme.value, message)
  }

  // --- Helper functions (non-mutating) ---
  function exportTheme(): string {
    return JSON.stringify(_theme.value, null, 2)
  }

  function importTheme(themeJson: string): Result<void, Error> {
    const parseResult = tryCatch(
      () => JSON.parse(themeJson),
      () => new Error('Invalid JSON format'),
    )

    if (!parseResult.ok) {
      return parseResult
    }

    const parsedData = parseResult.value
    const schemaResult = ColorThemeSchema.safeParse(parsedData)

    if (!schemaResult.success) {
      console.error('Invalid theme format:', schemaResult.error)
      return Err(new Error('Invalid theme format'))
    }

    const parsedTheme = schemaResult.data
    const requiredKeys: (keyof ColorTheme)[] = ['background', 'foreground', 'accent', 'muted', 'border', 'alertNote', 'alertTip', 'alertImportant', 'alertWarning', 'alertCaution']
    const isValid = requiredKeys.every(key =>
      parsedTheme[key]
      && typeof parsedTheme[key].l === 'number'
      && typeof parsedTheme[key].c === 'number'
      && typeof parsedTheme[key].h === 'number'
      && (parsedTheme[key].a === undefined || typeof parsedTheme[key].a === 'number'),
    )

    if (!isValid) {
      return Err(new Error('Theme is missing required keys or has invalid values'))
    }

    // Dispatch the validated theme
    dispatch({ type: 'IMPORT_THEME', payload: { theme: parsedTheme } })
    return Ok(undefined)
  }

  return {
    theme,
    dispatch,
    exportTheme,
    importTheme,
    oklchToString,
  }
})

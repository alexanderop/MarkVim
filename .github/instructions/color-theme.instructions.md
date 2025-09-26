---
description: "Instructions for working with the color theme module - OKLCH color system and CSS custom properties"
applyTo: "src/modules/color-theme/**/*"
---

# Color Theme Module Instructions

## Module Purpose
Manages application theming using the OKLCH color space with a customizable color picker interface and CSS custom properties integration.

## Key Components
- `ColorThemeModal.vue` - Main theme customization modal
- `OklchColorPicker.vue` - OKLCH color space picker component
- `OklchChannelSlider.vue` - Individual channel (L/C/H) slider controls
- `store.ts` - Pinia store for theme persistence

## OKLCH Color System

### Color Interface
```typescript
interface OklchColor {
  l: number // Lightness: 0-1
  c: number // Chroma: 0-0.4
  h: number // Hue: 0-360
  a?: number // Alpha: 0-1 (optional)
}
```

### Theme Structure
```typescript
interface ColorTheme {
  background: OklchColor
  foreground: OklchColor
  accent: OklchColor
  muted: OklchColor
  border: OklchColor
  alertNote: OklchColor // Blue - Notes/Info
  alertTip: OklchColor // Green - Tips/Success
  alertImportant: OklchColor // Purple - Important
  alertWarning: OklchColor // Orange - Warning
  alertCaution: OklchColor // Red - Danger/Caution
}
```

## Development Guidelines

### Color Picker Implementation
- Use controlled slider components for L/C/H channels
- Implement real-time preview of color changes
- Maintain accessibility with proper contrast ratios
- Handle edge cases in OKLCH color space boundaries

### CSS Custom Properties Integration
- Colors automatically convert to CSS custom properties
- Use semantic color names in CSS classes
- Maintain consistent naming convention across components
- Support both light and dark mode variations

### Store Management
- Use `useLocalStorage` for theme persistence
- Implement `mergeDefaults` for backward compatibility
- Provide computed properties for CSS variable generation
- Handle theme reset and import/export functionality

### Component Patterns
- Extract color picker logic into reusable composables
- Use reactive color updates with immediate visual feedback
- Implement proper keyboard navigation for accessibility
- Handle color space validation and boundary checks

## Common Tasks

### Adding New Theme Colors
1. Update `ColorTheme` interface in store
2. Add default value to `DEFAULT_COLOR_THEME`
3. Update CSS custom property generation
4. Add picker controls in modal component

### Color Space Calculations
- Use OKLCH for perceptual uniformity
- Implement proper color space conversions
- Handle color gamut limitations
- Validate color values within acceptable ranges

### Accessibility Considerations
- Ensure sufficient contrast ratios
- Provide alternative color indicators
- Support high contrast mode preferences
- Test with color vision deficiency simulators

## Integration Points
- Integrates with UnoCSS via CSS custom properties
- Works with all UI components through semantic color classes
- Persists to localStorage for cross-session consistency
- Exports/imports theme configurations for sharing

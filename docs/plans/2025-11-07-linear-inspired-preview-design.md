# Linear-Inspired Preview Design

**Date**: 2025-11-07
**Status**: Design Complete, Ready for Implementation
**Goal**: Transform MarkVim's markdown preview with Linear's clean, spacious aesthetic

## Problem Statement

The current markdown preview suffers from:
- Poor readability due to insufficient contrast and cramped spacing
- Weak visual hierarchy - headings don't stand out
- Code blocks blend into the background
- Inline code barely distinguishable from regular text
- Overall lack of breathing room between elements

User feedback: "Everything is not so readable"

## Design Philosophy

Linear's aesthetic is built on **generous whitespace and restraint**. Key principles:
1. Let content breathe with substantial padding and margins
2. Use consistent spacing rhythm (8px base unit)
3. Create subtle surface elevation through micro-variations in background lightness
4. Strong typography hierarchy through size, weight, and spacing
5. Clean, polished details (border radius, letter spacing)

## Design Solution

### 1. Spacing Philosophy

**Container Breathing Room**
- Desktop: `px-16 py-16` (up from `px-12 py-12`)
- Tablet: `px-12 py-12`
- Mobile: `px-6 py-8`
- Optional: `max-w-4xl mx-auto` for centered reading comfort

**Typography Spacing**
- Line height: **1.7** for body text (generous leading)
- Paragraph spacing: Equal to font size
- Heading spacing:
  - Top margin: 32-48px (depending on level)
  - Bottom margin: 16-24px
- Code blocks: 24px vertical margin
- Lists: 8px between items, 16px before/after
- Blockquotes: 24px vertical margin, 16px internal padding

**8px Rhythm System**
- Base spacing unit: 8px
- Scale: 8, 16, 24, 32, 48, 64
- Creates consistent visual rhythm throughout

### 2. Typography & Contrast

**Font Size Scale** (building on `var(--font-size-base)`)
- H1: `2.5em` (dramatic presence)
- H2: `1.875em`
- H3: `1.5em`
- H4: `1.25em`
- H5/H6: `1.125em`
- Body: `var(--font-size-base)` with line-height 1.7

**Font Weight Hierarchy**
- H1/H2: `font-weight: 600` (semibold)
- H3/H4: `font-weight: 500` (medium)
- H5/H6/Body: `font-weight: 400` (regular)

**Letter Spacing**
- Headings: `letter-spacing: -0.02em` (tighter, more polished)
- Body/Code: `letter-spacing: 0` (normal)

**Surface Elevation** (micro-variations in lightness)
- Preview base: `oklch(15% 0.002 0)` - slightly elevated from app background
- Code blocks: `oklch(18% 0.002 0)` - distinct surface
- Inline code: `oklch(20% 0.002 0)` - subtle highlight
- Text: `var(--foreground)` at 96% lightness - maintains high contrast

### 3. Code Blocks & Inline Elements

**Shiki Code Blocks**
```css
.prose .shiki {
  background: oklch(18% 0.002 0);
  padding: 24px;
  border: 1px solid oklch(25% 0.003 20);
  border-radius: 8px;
  margin: 24px 0;
}
```

**Line Numbers**
- Increase left padding to `4em` for better separation
- Maintain subtle opacity for numbers

**Inline Code**
```css
.prose code:not(.shiki code) {
  background: oklch(20% 0.002 0);
  padding: 2px 6px;
  border: 1px solid oklch(25% 0.003 20);
  border-radius: 4px;
  font-size: 0.9em;
}
```

**Lists**
- List item margin: `8px` bottom
- Nested list spacing: `8px` top/bottom
- Proper marker spacing: `padding-left: 1.5em`

**Blockquotes**
```css
.prose blockquote {
  border-left: 4px solid var(--accent);
  opacity: 0.4; /* on border */
  background: oklch(15% 0.002 0);
  padding: 16px 20px;
  margin: 24px 0;
  font-style: normal; /* modern, clean */
}
```

## Implementation Plan

### Files to Modify

**Primary**: `src/shared/ui/tokens.css`
- All styling changes happen here
- Keeps component logic clean

**Secondary**: `src/modules/markdown-preview/components/MarkdownPreview.client.vue`
- Update container padding classes for responsive spacing
- Optional: Add max-width constraint

### Implementation Steps

1. **Update prose base styles** (lines 164-177)
   - Add comprehensive heading typography (size, weight, spacing, letter-spacing)
   - Set body text line-height to 1.7

2. **Add prose element spacing** (new section)
   - Paragraphs: `margin-bottom: 1em`
   - Lists: Item spacing, nested spacing
   - Horizontal rules, tables

3. **Enhance code block styling** (lines 168-171)
   - New background, padding, border, border-radius
   - Update line number spacing (lines 136-154)

4. **Add inline code styling** (new)
   - Target with `.prose code:not(.shiki code)`
   - Background, padding, border treatment

5. **Add blockquote styling** (new)
   - Linear-inspired clean treatment
   - Remove italic, add subtle accent border

6. **Update preview container** (MarkdownPreview.client.vue)
   - Responsive padding: `class="px-16 py-16 md:px-12 md:py-12 sm:px-6 sm:py-8"`
   - Optional max-width: `max-w-4xl mx-auto`

### Testing Checklist

Test with documents containing:
- [ ] Multiple heading levels (H1-H6)
- [ ] Long paragraphs with inline code
- [ ] Code blocks with syntax highlighting
- [ ] Nested lists (ordered and unordered)
- [ ] Blockquotes
- [ ] GitHub-style alerts
- [ ] Mermaid diagrams
- [ ] Mixed content (current Event Communication doc is perfect)

Test on:
- [ ] Desktop (wide screen)
- [ ] Tablet (medium screen)
- [ ] Mobile (small screen)
- [ ] Different font size settings (MarkVim's dynamic sizing)

## Design Rationale

### Why This Approach Works

1. **Respects existing architecture**
   - No component refactoring needed
   - All changes in CSS tokens file
   - Maintains module boundaries

2. **Preserves color system**
   - Uses existing OKLCH tokens
   - Only adds micro-variations in lightness
   - No new color variables

3. **Responsive by design**
   - Spacing scales naturally
   - Works with existing mobile patterns
   - Respects font size preferences

4. **Incremental enhancement**
   - Can be implemented in stages
   - Easy to revert specific changes
   - Non-breaking to existing content

### Linear Design Principles Applied

- **Generous whitespace**: 8px rhythm, substantial padding/margins
- **Typography hierarchy**: Clear size jumps, weight variation
- **Subtle depth**: Surface elevation through lightness
- **Polished details**: Border radius, letter spacing, refined borders
- **Content-first**: Reading comfort over decoration

## Success Metrics

- Improved readability (subjective: "looks readable now")
- Clear visual hierarchy (headings stand out)
- Distinct code blocks and inline code
- Comfortable reading experience
- Maintains fast performance (CSS-only changes)

## Future Enhancements (Out of Scope)

- Custom font loading (Inter for body, matching Linear)
- Hover states for links with smooth transitions
- Smooth scroll indicators
- Reading progress bar
- Dark/light mode optimizations beyond current system

---

**Next Steps**: Create implementation plan with git worktree setup, then execute design in isolated branch.

# Linear-Inspired Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform MarkVim's markdown preview with Linear's generous spacing, strong typography hierarchy, and subtle surface elevation.

**Architecture:** CSS-only changes in `src/shared/ui/tokens.css` with responsive container updates in preview component. No component refactoring, preserves existing OKLCH color system.

**Tech Stack:** Tailwind CSS v4, Vue 3 SFCs, Nuxt 3

---

## Task 1: Update Preview Container Spacing

**Files:**
- Modify: `src/modules/markdown-preview/components/MarkdownPreview.client.vue:84-93`

**Step 1: Read current container markup**

Current container div at line 84:
```vue
<div
  ref="root"
  class="mx-auto px-12 py-12 max-w-none"
>
```

**Step 2: Update container with responsive spacing**

Replace lines 84-86 with:
```vue
<div
  ref="root"
  class="mx-auto px-16 py-16 md:px-12 md:py-12 sm:px-6 sm:py-8 max-w-4xl"
>
```

Changes:
- Desktop: `px-16 py-16` (was `px-12 py-12`)
- Tablet: `md:px-12 md:py-12`
- Mobile: `sm:px-6 sm:py-8`
- Max width: `max-w-4xl` (was `max-w-none`) for comfortable reading on wide screens

**Step 3: Verify syntax**

Run: `pnpm typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/markdown-preview/components/MarkdownPreview.client.vue
git commit -m "feat(preview): Add responsive container spacing with Linear-style padding

- Desktop: px-16 py-16 for generous breathing room
- Tablet: px-12 py-12 for comfortable reading
- Mobile: px-6 py-8 to fit smaller screens
- Max width: 4xl for optimal line length on wide displays"
```

---

## Task 2: Add Prose Typography Base Styles

**Files:**
- Modify: `src/shared/ui/tokens.css:164-166`

**Step 1: Read current prose heading styles**

Current code at lines 164-166:
```css
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: var(--accent);
}
```

**Step 2: Replace with comprehensive typography hierarchy**

Replace lines 164-166 with:
```css
/* =============================================
   ✨ PROSE TYPOGRAPHY - Linear-Inspired Hierarchy
   =============================================*/

/* Body text - generous line height for readability */
.prose {
  line-height: 1.7;
}

/* Heading hierarchy with size, weight, spacing, and letter-spacing */
.prose h1 {
  color: var(--accent);
  font-size: 2.5em;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-top: 48px;
  margin-bottom: 24px;
  line-height: 1.2;
}

.prose h2 {
  color: var(--accent);
  font-size: 1.875em;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-top: 40px;
  margin-bottom: 20px;
  line-height: 1.3;
}

.prose h3 {
  color: var(--accent);
  font-size: 1.5em;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-top: 32px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.prose h4 {
  color: var(--accent);
  font-size: 1.25em;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-top: 24px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.prose h5,
.prose h6 {
  color: var(--accent);
  font-size: 1.125em;
  font-weight: 400;
  letter-spacing: 0;
  margin-top: 20px;
  margin-bottom: 10px;
  line-height: 1.5;
}

/* First heading has no top margin */
.prose > :first-child {
  margin-top: 0;
}
```

**Step 3: Verify syntax**

Run: `pnpm lint`
Expected: No CSS syntax errors

**Step 4: Commit**

```bash
git add src/shared/ui/tokens.css
git commit -m "feat(prose): Add Linear-inspired typography hierarchy

- Generous line-height 1.7 for body text
- Dramatic heading size scale (H1: 2.5em → H6: 1.125em)
- Font weights: H1/H2 semibold (600), H3/H4 medium (500), H5/H6 regular
- Negative letter-spacing on large headings for polished look
- Substantial margins for breathing room (8px rhythm system)
- Remove top margin from first element"
```

---

## Task 3: Add Prose Element Spacing

**Files:**
- Modify: `src/shared/ui/tokens.css` (insert after heading styles)

**Step 1: Add paragraph and list spacing**

Insert after the heading styles (after `.prose > :first-child` rule):

```css
/* Paragraph spacing */
.prose p {
  margin-bottom: 1em;
}

/* List spacing */
.prose ul,
.prose ol {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 1.5em;
}

.prose li {
  margin-bottom: 8px;
}

.prose li:last-child {
  margin-bottom: 0;
}

/* Nested lists */
.prose ul ul,
.prose ul ol,
.prose ol ul,
.prose ol ol {
  margin-top: 8px;
  margin-bottom: 8px;
}

/* Horizontal rules */
.prose hr {
  margin-top: 32px;
  margin-bottom: 32px;
  border-color: var(--border);
}

/* Tables */
.prose table {
  margin-top: 24px;
  margin-bottom: 24px;
}

/* Links */
.prose a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.prose a:hover {
  text-decoration-thickness: 2px;
}
```

**Step 2: Verify syntax**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/tokens.css
git commit -m "feat(prose): Add generous element spacing

- Paragraphs: 1em bottom margin for breathing room
- Lists: 16px vertical margins, 8px between items
- Nested lists: 8px top/bottom for proper hierarchy
- HR: 32px vertical margins using 8px rhythm
- Tables: 24px vertical margins
- Links: Subtle underline with 2px offset, thicker on hover"
```

---

## Task 4: Enhance Code Block Styling

**Files:**
- Modify: `src/shared/ui/tokens.css:168-171` (Shiki blocks)
- Modify: `src/shared/ui/tokens.css:136-154` (Line numbers)

**Step 1: Update Shiki code block styles**

Find current `.prose .shiki` rule (around line 168-171):
```css
.prose .shiki {
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

Replace with:
```css
.prose .shiki {
  background: oklch(18% 0.002 0);
  padding: 24px;
  border: 1px solid oklch(25% 0.003 20);
  border-radius: 8px;
  margin: 24px 0;
  overflow-x: auto;
}
```

**Step 2: Update line number spacing**

Find the `.shiki .line` rule (around line 135-140):
```css
.shiki .line {
  counter-increment: shiki-line-number;
  display: block;
  position: relative;
  padding-left: 3.5em;
}
```

Change `padding-left` from `3.5em` to `4em`:
```css
.shiki .line {
  counter-increment: shiki-line-number;
  display: block;
  position: relative;
  padding-left: 4em;
}
```

**Step 3: Verify syntax**

Run: `pnpm lint`
Expected: No errors

**Step 4: Commit**

```bash
git add src/shared/ui/tokens.css
git commit -m "feat(prose): Enhance code block styling with surface elevation

- Background: oklch(18%) - distinct from preview base (15%)
- Padding: 24px for generous breathing room
- Border: 1px solid with subtle color for definition
- Border radius: 8px for polished, modern look
- Margin: 24px vertical using 8px rhythm
- Line numbers: Increase padding to 4em for better separation"
```

---

## Task 5: Add Inline Code Styling

**Files:**
- Modify: `src/shared/ui/tokens.css` (insert after Shiki styles)

**Step 1: Add inline code rule**

Insert after the `.prose .shiki` rule:

```css
/* Inline code (exclude Shiki code blocks) */
.prose code:not(.shiki code) {
  background: oklch(20% 0.002 0);
  padding: 2px 6px;
  border: 1px solid oklch(25% 0.003 20);
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--foreground);
}
```

**Step 2: Verify syntax**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/tokens.css
git commit -m "feat(prose): Add distinct inline code styling

- Background: oklch(20%) - lighter than code blocks for hierarchy
- Padding: 2px 6px for horizontal breathing room
- Border: 1px solid for clear definition
- Border radius: 4px for smooth, polished look
- Font size: 0.9em slightly smaller than body text
- Targets only inline code, excludes Shiki blocks"
```

---

## Task 6: Add Blockquote Styling

**Files:**
- Modify: `src/shared/ui/tokens.css` (insert after inline code)

**Step 1: Add blockquote rule**

Insert after the inline code rule:

```css
/* Blockquotes - Linear-inspired clean treatment */
.prose blockquote {
  border-left: 4px solid var(--accent);
  border-left-color: color-mix(in oklch, var(--accent) 40%, transparent);
  background: oklch(15% 0.002 0);
  padding: 16px 20px;
  margin: 24px 0;
  font-style: normal;
  color: var(--foreground);
}

.prose blockquote p {
  margin-bottom: 0.5em;
}

.prose blockquote p:last-child {
  margin-bottom: 0;
}
```

**Step 2: Verify syntax**

Run: `pnpm lint`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/ui/tokens.css
git commit -m "feat(prose): Add Linear-inspired blockquote styling

- Border left: 4px accent color at 40% opacity (subtle accent)
- Background: Same as preview base for consistency
- Padding: 16px vertical, 20px horizontal for breathing room
- Margin: 24px vertical using 8px rhythm
- Font style: Normal (not italic) for modern, clean look
- Paragraph spacing: Adjusted for blockquote context"
```

---

## Task 7: Update Preview Base Background

**Files:**
- Modify: `src/modules/markdown-preview/components/MarkdownPreview.client.vue:79-82`

**Step 1: Read current scroll container**

Current code at line 79-82:
```vue
<div
  ref="scrollContainer"
  class="bg-[var(--background)] flex-1 min-h-0 overflow-auto focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20 focus:ring-inset transition-all"
  tabindex="0"
>
```

**Step 2: Update background color**

Replace `bg-[var(--background)]` with slightly elevated surface:
```vue
<div
  ref="scrollContainer"
  class="bg-[oklch(15%_0.002_0)] flex-1 min-h-0 overflow-auto focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-20 focus:ring-inset transition-all"
  tabindex="0"
>
```

**Step 3: Verify syntax**

Run: `pnpm typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/markdown-preview/components/MarkdownPreview.client.vue
git commit -m "feat(preview): Elevate preview background for subtle depth

- Background: oklch(15%) - 3% lighter than app background (12%)
- Creates subtle surface elevation for content area
- Code blocks (18%) and inline code (20%) build on this base
- Maintains Linear-inspired layered depth approach"
```

---

## Task 8: Visual Testing & Verification

**Files:**
- Test: Preview rendering with various markdown content

**Step 1: Start dev server**

```bash
pnpm dev
```

Expected: Server starts at http://localhost:3000

**Step 2: Test with heading hierarchy**

Create or navigate to a document with all heading levels (H1-H6). Verify:
- [ ] H1 is largest (2.5em), semibold, generous spacing
- [ ] Progressive size reduction H1 → H6
- [ ] Clear visual hierarchy with font weights
- [ ] Consistent 8px rhythm spacing
- [ ] No cramped feeling between elements

**Step 3: Test with code blocks**

Document with both code blocks and inline code. Verify:
- [ ] Code blocks have distinct background (darker than preview)
- [ ] 24px padding creates breathing room inside blocks
- [ ] 8px border radius looks polished
- [ ] Line numbers properly spaced from code
- [ ] Inline code clearly different from code blocks
- [ ] Inline code has subtle border and background

**Step 4: Test with lists**

Document with ordered, unordered, and nested lists. Verify:
- [ ] 8px spacing between list items
- [ ] 16px margins before/after lists
- [ ] Nested lists properly indented and spaced
- [ ] No cramped feeling in dense lists

**Step 5: Test with blockquotes**

Document with blockquotes. Verify:
- [ ] Subtle accent border on left (40% opacity)
- [ ] 16px/20px padding creates breathing room
- [ ] 24px vertical margins separate from content
- [ ] Font style is normal (not italic)

**Step 6: Test responsive spacing**

Resize browser window. Verify:
- [ ] Desktop: Generous 64px padding (16 × 4)
- [ ] Tablet: Comfortable 48px padding (12 × 4)
- [ ] Mobile: Efficient 24px/32px padding
- [ ] Max width constraint works on ultra-wide screens
- [ ] Content remains readable at all breakpoints

**Step 7: Test with GitHub alerts**

Document with all alert types (note, tip, important, warning, caution). Verify:
- [ ] Alerts inherit spacing improvements
- [ ] Alert backgrounds work with new preview background
- [ ] Alert borders maintain visibility

**Step 8: Stop dev server**

```bash
# In separate terminal or Ctrl+C
pnpm kill:servers
```

**Step 9: Document test results**

Create test notes (no commit needed yet):
- Note any visual issues discovered
- List any edge cases that need refinement
- Document cross-browser concerns (if applicable)

---

## Task 9: Run Quality Checks

**Files:**
- Verify: Type checking and linting

**Step 1: Run typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 2: Run linter**

```bash
pnpm lint
```

Expected: No new warnings beyond existing 56 warnings

**Step 3: Run architecture validation**

```bash
pnpm depcruise
```

Expected: No new violations (boundary rules still pass)

**Step 4: Commit quality verification**

No commit needed - verification step only

---

## Task 10: Update Documentation

**Files:**
- Modify: `CLAUDE.md` (add Linear preview section)

**Step 1: Add Linear preview section**

Find the "## High-Level Architecture" section and add after the "Modules" list:

```markdown
**Linear-Inspired Preview Styling**

The markdown preview uses Linear's generous spacing philosophy:
* 8px rhythm system: All spacing uses 8, 16, 24, 32, 48, 64px
* Typography hierarchy: H1 (2.5em) → H6 (1.125em) with font weight variation
* Surface elevation: Preview (15%), code blocks (18%), inline code (20%)
* Generous line-height: 1.7 for body text ensures comfortable reading
* Responsive padding: Desktop (16), Tablet (12), Mobile (6/8) in Tailwind units
* All styles: `src/shared/ui/tokens.css` (lines 164+)
```

**Step 2: Verify markdown syntax**

Run: `pnpm lint` (checks markdown files)
Expected: No errors

**Step 3: Commit documentation**

```bash
git add CLAUDE.md
git commit -m "docs: Document Linear-inspired preview styling approach

Add documentation for preview spacing philosophy, typography
hierarchy, and surface elevation strategy. Reference exact file
locations for future maintenance."
```

---

## Task 11: Final Review & Branch Completion

**Files:**
- Review: All changes

**Step 1: Review git log**

```bash
git log --oneline -12
```

Expected: 10 commits for this feature (Tasks 1-7, 10)

**Step 2: Create summary of changes**

Changes made:
1. Responsive container spacing (desktop/tablet/mobile)
2. Typography hierarchy (H1-H6 with weights/spacing)
3. Element spacing (paragraphs, lists, tables, links)
4. Code block enhancement (background, padding, borders)
5. Inline code styling (distinct from blocks)
6. Blockquote styling (Linear-inspired)
7. Preview background elevation (subtle depth)
8. Documentation updates (CLAUDE.md)

**Step 3: Verify no uncommitted changes**

```bash
git status
```

Expected: Clean working directory

**Step 4: Branch ready for review/merge**

This task completes the implementation. Next steps:
- Use superpowers:finishing-a-development-branch to handle merge/PR
- Run full E2E test suite if desired: `pnpm test:e2e`

---

## Success Criteria

After implementation, verify:
- [ ] Preview has generous breathing room at all breakpoints
- [ ] Typography hierarchy is immediately clear (headings stand out)
- [ ] Code blocks and inline code are distinct and readable
- [ ] Blockquotes have clean, modern styling
- [ ] No type errors or lint violations introduced
- [ ] Architecture boundaries maintained (depcruise passes)
- [ ] Documentation updated in CLAUDE.md

## Visual Quality Checklist

Compare before/after:
- [ ] Text feels more comfortable to read (line-height 1.7)
- [ ] Elements have clear separation (8px rhythm)
- [ ] Headings create strong hierarchy
- [ ] Code doesn't blend into background
- [ ] Overall "breathing room" matches Linear aesthetic

---

**Implementation Notes:**

* All changes are CSS-only, no component refactoring
* Preserves existing OKLCH color system
* Respects existing module boundaries
* Responsive by design (desktop/tablet/mobile)
* Non-breaking changes (content still renders correctly)
* Follows MarkVim's conventions (tokens in tokens.css, responsive utilities)

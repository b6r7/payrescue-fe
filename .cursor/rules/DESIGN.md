# Design System: Affirm

## 1. Visual Theme & Atmosphere

Affirm's design system radiates **approachable confidence** -- the visual equivalent of a trusted financial advisor who also happens to wear sneakers. The aesthetic is clean, modern, and uncluttered, with deep indigo (#000049) anchoring the brand against generous white space. Every surface breathes; every element earns its place.

The system embodies five core principles:

- **Approachable** -- Friendly colors, clear layouts, generous whitespace, rounded interactive elements, and inviting CTAs. Financial services without the cold corporate veneer.
- **Smart Casual** -- Professional but never sterile. Sophisticated simplicity. Functional elegance that doesn't try too hard.
- **Forward Looking** -- Modern aesthetic, contemporary typography (Axiforma for Affirm headlines, Calibre body text), fresh patterns, and subtle innovation.
- **Accessible** -- High contrast text (4.5:1 minimum), clear visual hierarchy, readable font sizes (16px minimum body), sufficient touch targets (44px minimum).
- **Trustworthy** -- Consistent patterns, predictable interactions, professional polish. No visual surprises. Users are making financial decisions here.

The overall density is **comfortable** -- not cramped, not wasteful. Surfaces are defined by subtle background color shifts (`#f8f8fa`, `#edeef2`) rather than heavy borders. Elevation is minimal; shadows are used sparingly and only where semantically meaningful. The system prefers **color differentiation over shadow differentiation** for layering.

## 2. Color Palette & Roles

All colors are sourced from the DS Core Library Figma file. The system supports **Light** and **Dark** modes via semantic tokens.

### Core Semantic Colors (Light / Dark)

#### Text
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `color/text/primary` | `#121319` | `#ffffff` | Default body text, headings |
| `color/text/secondary` | `#5f6272` | `#8b8f9c` | Supporting text, descriptions |
| `color/text/primary/inverse` | `#ffffff` | `#121319` | Text on dark/light surfaces |
| `color/text/link` | `#1b0d7c` | `#f2f5ff` | Clickable link text |
| `color/text/primary/brand` | `#4a4af4` | `#8396ff` | Brand-accent text |
| `color/text/success` | `#007832` | `#59b16d` | Success messaging |
| `color/text/critical` | `#b4193f` | `#ef6879` | Error messaging |
| `color/text/warning` | `#8b5500` | `#cf8a30` | Warning messaging |
| `color/text/info` | `#196b88` | `#5ea4c2` | Informational messaging |

#### Backgrounds
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `color/bg/primary` | `#ffffff` | `#121319` | Card surfaces, primary containers |
| `color/bg/secondary` | `#f8f8fa` | `#191a21` | Page background, secondary surfaces |
| `color/bg/tertiary` | `#edeef2` | `#262830` | Inset surfaces, grouped content |
| `color/bg/primary/inverse` | `#121319` | `#ffffff` | Dark sections, inverse cards |
| `color/bg/primary/brand` | `#ccd6ff` | `#3c38d6` | Brand-tinted backgrounds |
| `color/bg/secondary/brand` | `#a9dff8` | `#005671` | Secondary brand backgrounds |

#### Icons
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `color/icon/primary` | `#121319` | `#ffffff` | Default icons |
| `color/icon/secondary` | `#5f6272` | `#8b8f9c` | Supporting icons |
| `color/icon/link` | `#1b0d7c` | `#f2f5ff` | Interactive/link icons |
| `color/icon/primary/brand` | `#4a4af4` | `#8396ff` | Brand accent icons |
| `color/icon/success` | `#007832` | `#59b16d` | Success state icons |
| `color/icon/critical` | `#b4193f` | `#ef6879` | Error state icons |
| `color/icon/warning` | `#8b5500` | `#cf8a30` | Warning state icons |
| `color/icon/info` | `#196b88` | `#5ea4c2` | Info state icons |

#### Borders & Dividers
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `color/border/primary` | `#cccdd4` | `#3f424e` | Default borders |
| `color/border/secondary` | `#dddee2` | `#353743` | Subtle borders |
| `color/border/separation/primary` | `#ffffff` | `#121319` | Section dividers (matches bg) |
| `color/border/separation/tertiary` | `#edeef2` | `#262830` | Visible dividers |
| `color/divider/primary/fill` | `#dddee2` | `#353743` | Horizontal rules |
| `color/divider/secondary/fill` | `#cccdd4` | `#3f424e` | Stronger dividers |

#### Fills & Accents
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `color/fill/neutral` | `#8b8f9c` | `#6d7180` | Neutral fill shapes |
| `color/fill/neutral/decorative` | `#edeef2` | `#2d3039` | Decorative backgrounds |
| `color/fill/primary/brand` | `#4a4af4` | `#4a4af4` | Brand fill (same both modes) |
| `color/fill/secondary/brand` | `#196b88` | `#196b88` | Secondary brand fill |

### Button Colors (Light / Dark)

#### Primary Button
| Part | Resting | Hover | Pressed | Disabled |
|------|---------|-------|---------|----------|
| **Background (Light)** | `#000049` | `#3131a3` | `#151579` | `#d8d8df` |
| **Text (Light)** | `#f7f7f8` | `#f0f0ff` | `#d4d4ff` | `#9797a8` |

#### Secondary Button (Outline)
| Part | Resting | Hover | Pressed | Disabled |
|------|---------|-------|---------|----------|
| **Border (Light)** | `#000049` | `#4242cf` | `#3131a3` | `#b1b1be` |
| **Text (Light)** | `#000061` | `#4242cf` | `#3131a3` | `#b1b1be` |

## 3. Typography Rules

### Font Families

| Role | Family | Fallback Stack |
|------|--------|---------------|
| **Headlines** | `Axiforma for Affirm` | `'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif` |
| **Body & UI** | `Calibre` | `'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| **Monospace** | `Alma Mono` | `Courier, monospace` |

### Type Scale -- Headlines (Axiforma for Affirm)

| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| `headline-XXLarge` | 52px | Medium (500) | 70px | -1px |
| `headline-XLarge` | 40px | Medium (500) | 54px | -1px |
| `headline-Large` | 32px | SemiBold (600) | 44px | -0.5px |
| `headline-Medium` | 24px | SemiBold (600) | 32px | -0.25px |
| `headline-Small` | 18px | Bold (700) | 24px | 0 |

### Type Scale -- Body (Calibre)

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `body-XLarge` | 20px | Regular (400) | 30px |
| `body-Large` | 18px | Regular (400) | 27px |
| `body-Medium` | 16px | Regular (400) | 24px — **default** |
| `body-Small` | 14px | Regular (400) | 21px |

### Typography Principles

- Headlines use **negative letter-spacing** (-1px at large sizes, -0.5px at medium) for a tight, modern feel
- Body text uses **0 letter-spacing**
- Three emphasis levels: Regular (400), Medium (500), Semibold (600). Bold (700) is reserved for `headline-Small` only
- Links always use **Medium weight + underline** decoration
- **Minimum body text: 16px.** Never go below 14px for any readable content

## 4. Component Stylings

### Primary Button
```css
.button-primary {
  background: #000049;
  color: #f7f7f8;
  padding: 18px 28px;            /* large size */
  border-radius: 32px;           /* pill */
  font-family: 'Calibre', sans-serif;
  font-size: 16px;
  font-weight: 600;
  border: none;
}
.button-primary:hover { background: #3131a3; }
.button-primary:active { background: #151579; }
.button-primary:disabled { background: #d8d8df; color: #9797a8; }
```

Button sizes:
| Size | Padding Y | Padding X | Radius |
|------|-----------|-----------|--------|
| Large | 18px | 28px | 32px |
| Medium | 12px | 24px | 24px |
| Small | 8px | 16px | 18px |

### Card Container
```css
.card-on-page {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
}
.card-on-surface {
  background: #f8f8fa;
  border-radius: 8px;
  padding: 16px;
}
.card-inset {
  background: #edeef2;
  border-radius: 2px;
  padding: 12px;
}
```

### Text Input
```css
.input-text {
  background: #ffffff;
  border: 1px solid #cccdd4;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  color: #121319;
}
.input-text:focus {
  border-color: #000049;
  outline: 2px solid rgba(0, 0, 73, 0.15);
  outline-offset: 2px;
}
```

### Banner / Message
```css
/* Error */  .banner.critical { background: #ffecf0; }
/* Warning */ .banner.warning { background: #ffe1b6; }
/* Success */ .banner.success { background: #a6eab2; }
/* Info */    .banner.info    { background: #a9dff8; }
```

### Bottom Sheet (Mobile)
```css
.bottom-sheet {
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  padding: 24px 16px 64px;
}
```

## 5. Layout Principles

### Border Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| `radius/onSurface/inset` | 2px | Deeply nested elements |
| `radius/onSurface/default` | 8px | Inputs, banners, nested cards |
| `radius/onPage/default` | 16px | Page-level cards, chips |
| `radius/elevatedSurface/default` | 24px | Modals, dialogs, bottom sheets |
| Button Large | 32px | Full pill |
| Button Medium | 24px | Generous rounding |
| Button Small | 18px | Comfortable rounding |

### Spacing System

| Context | Value |
|---------|-------|
| Page horizontal margin | 16px |
| Page vertical spacing | 32px |
| Card padding | 16px |
| Dialog padding | 24px |
| Dialog gap | 16px |
| Bottom sheet content gap | 24px |
| Banner padding | 16px |
| Banner gap | 8px |

## 6. Depth & Elevation

Affirm's design system is intentionally **flat**. Most components have zero shadow. Elevation is communicated through **background color layering** (`#ffffff` > `#f8f8fa` > `#edeef2`).

Only the physical Affirm Card component gets a shadow: `0 10px 20px rgba(18, 19, 25, 0.25)`. Everything else: no shadow.

## 7. Do's and Don'ts

### Do

- **Use `#000049` for primary button backgrounds** — the authoritative brand interactive color
- **Use `#f8f8fa` for page backgrounds** — pure white is for card surfaces only
- **Use `#121319` for primary text** — not pure black
- **Use pill-shaped buttons** — radius 24-32px
- **Use Calibre for body, Axiforma for Affirm for headlines**
- **Communicate elevation through background color, not shadow**
- **Test WCAG AA** (4.5:1 normal text, 3:1 large text)

### Don't

- **Don't use `#8C8CFF`** for primary buttons — that's `indigo-400`, brand accent only
- **Don't use pure white as page background** — use `#f8f8fa`
- **Don't use pure black for text** — use `#121319`
- **Don't use shadow on cards** — use bg color layering
- **Don't use small border-radius on buttons** (4-8px) — pill only
- **Don't use font-weight 700 on body text** — Semibold (600) max
- **Don't use gradients on backgrounds**
- **Don't use `text-transform: uppercase` with letter-spacing on labels**

## 8. Agent Prompt Guide

### Quick Color Reference

```
Primary CTA background:    #000049
Primary CTA text:          #f7f7f8
Page background:           #f8f8fa
Card surface:              #ffffff
Heading text:              #121319
Body text:                 #121319
Secondary text:            #5f6272
Link text:                 #1b0d7c
Border:                    #cccdd4
Focus ring:                rgba(0, 0, 73, 0.15) 2px outline, 2px offset
Brand accent:              #4a4af4
Error:                     #b4193f
Success:                   #007832
```

### Iteration Checklist

1. **Primary buttons** use `#000049` (NOT `#8C8CFF`)
2. **Page background** is `#f8f8fa` (NOT pure white)
3. **Text color** is `#121319` (NOT pure black)
4. **Button radius** is pill-shaped (18-32px)
5. **Card radius** is 16px on-page, 8px on-surface
6. **Spacing** uses token values (16px card padding, 24px dialog, etc.)
7. **Font families** reference Axiforma for Affirm / Calibre with proper fallbacks
8. **Headlines** use negative letter-spacing
9. **No shadows** on cards — use background color layering
10. **Status colors** are correct (green success, red critical, amber warning, teal info)

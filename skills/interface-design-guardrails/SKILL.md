---
name: interface-design-guardrails
description: Use when designing, redesigning, or reviewing polished product interfaces, especially marketing pages, premium UI components, Neuve visual work, craft-quality audits, anti-slop checks, quality-facet scoring, and interface design guardrails.
argument-hint: "[design task, screenshot, file path, or review target]"
---

# Interface Design Guardrails

A skill for building interfaces with uncommon care. Based on Josh Puckett's Interface Craft principles and practical patterns from best-in-class product pages.

## When to Use

- Designing or redesigning marketing/landing pages
- Building new UI components that need to feel premium
- Reviewing designs for quality and intentionality
- Breaking out of "template aesthetics" loops
- Working with AI on interface design (ensuring craft, not slop)

## Sub-Documents

| Document                          | Purpose                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `resources/craft-principles.md`   | The 10 Working Knowledge principles (Noticing, Conceptual Range/Depth, Uncommon Care, Less But Better, etc.) |
| `resources/quality-framework.md`  | Facets of Quality radar chart, the 1-10 spectrum, design quality checklist                                   |
| `resources/industry-standards.md` | Platform defaults → innovate process, exemplary products                                                     |
| `resources/anti-patterns.md`      | Process anti-patterns, visual AI slop, Neuve-specific rejections                                             |

## Core Philosophy

> "As software gets easier to make, the products that stand out will be the ones crafted with uncommon care."

Three pillars:

1. **Less, but better** — Two typefaces, limited colors, one key interaction. Execute to an incredibly high bar.
2. **Default, then innovate** — Start with shadcn/Tailwind defaults, meet industry standards, then push beyond.
3. **Every decision needs a WHY** — If the answer is "it's common" or "it's clean," you have defaulted, not chosen.

## Quick Reference

### Process Rules

| #   | Rule                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Explore range first** — Generate structurally different solutions before committing. Variants of one idea = depth, not range. |
| 2   | **Then go deep** — Push from level 1 to 10. Most work stops at 1-3. Ask: what would the next level look like?                   |
| 3   | **Separate concerns** — Don't solve everything at once. Ask: what question am I answering right now?                            |
| 4   | **Define quality facets** — Name what "good" means for YOUR product. Rate 1-5. Track over time.                                 |
| 5   | **Hack away the unessential** — Fight the tendency to add more. Refine what exists instead.                                     |
| 6   | **Notice obsessively** — Document WHY things feel right or wrong, not just that they do.                                        |
| 7   | **Care uncommonly** — The details people remember are the ones you didn't have to do.                                           |

### Visual Rules

| #   | Rule                                                                                              |
| --- | ------------------------------------------------------------------------------------------------- |
| 1   | **Max 2 font families** — One distinctive display + one clean body. Never use system fonts alone. |
| 2   | **Flat colors only** — No gradients. Single strong hues used decisively.                          |
| 3   | **8px spacing grid** — All spacing in multiples of 8 (4 for micro). Consistent throughout.        |
| 4   | **120px+ section spacing** — Generous vertical padding between sections. Whitespace = premium.    |
| 5   | **One separation method per card** — Shadow OR border OR background. Not multiple.                |
| 6   | **44px minimum touch targets** — All interactive elements on mobile.                              |
| 7   | **Width-constrain body text** — max-w-lg or max-w-xl even in full-width sections.                 |

### Section Pattern (Three-Layer)

Every major section should follow this hierarchy:

```
COLORED LABEL     ← small, uppercase, tracked, brand color
Bold Headline     ← large, bold, near-black, tracking-tight
Muted Description ← medium, muted gray, width-constrained
```

### Anti-Slop Checklist

Before shipping, verify NONE of these are present together:

- [ ] System font as only typeface
- [ ] Purple-to-blue gradients
- [ ] Evenly-spaced 3-column icon+text cards
- [ ] Generic "Get Started" + "Learn More" CTAs
- [ ] Decorative elements with no purpose
- [ ] Hover-only interactions (useless on mobile)

## Neuve-Specific Guidance

### Brand Colors

- **Golden-grass** (primary): -50 for card backgrounds, -500 for buttons/badges, -700 for headlines
- **Ocean-green** (secondary): -50 for card backgrounds, -500 for badges, -700 for headlines
- **Hopbush** (tertiary): -50 for card backgrounds, -500 for badges, -700 for headlines

### Hard Rules

- **NO gradients** — every color is flat
- **NO full-bleed -500 color blocks** — use -50/-100 tints
- **iOS-only product** — no desktop browser mockups
- **Mobile-first** — 375px is primary viewport
- **Match the product** — must feel like it belongs to the authenticated Neuve app

### Quality Facets for Neuve

| Facet         | Description                                          |
| ------------- | ---------------------------------------------------- |
| **Warm**      | Personal, inviting, human — not cold SaaS            |
| **Crafted**   | Every detail intentional, not template-generated     |
| **Confident** | Bold typography, decisive color, no hedging          |
| **Cohesive**  | Belongs to the same product as the authenticated app |
| **Memorable** | One thing someone will remember and tell a friend    |

## Instructions

1. Read `resources/craft-principles.md` for the design philosophy
2. Read `resources/anti-patterns.md` to know what to avoid (includes Neuve-specific rejections from 10+ iterations)
3. Read `resources/quality-framework.md` to evaluate your work against facets
4. Reference `resources/industry-standards.md` for platform defaults and section starting points
5. Start with shadcn/Tailwind defaults, then innovate beyond
6. After each iteration, rate against the quality facets — are they trending up?
7. For every design decision, be able to explain WHY

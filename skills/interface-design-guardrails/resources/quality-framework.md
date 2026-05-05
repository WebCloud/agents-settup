# Quality Framework

## The 1-10 Spectrum

Rate your current implementation honestly:

| Level | Description                                                                |
| ----- | -------------------------------------------------------------------------- |
| 1-3   | Default, minimum viable. Technically works. **Most work ships here.**      |
| 4-6   | Fixing obvious problems, addressing gaps, resolving edge cases             |
| 7-8   | Discovery and invention. No longer fixing — pushing to see what's possible |
| 9-10  | Best version imaginable. Everything considered, tried, edited, improved    |

Ask: **Where does this fall? Can I push it further? What would the next level look like?**

---

## Facets of Quality

Define 3-5 specific quality attributes for your product. These are the external characteristics you want users to perceive.

### How to Define Facets

1. Ask: What do I want someone to FEEL when they use this?
2. Be specific — not "good design" but "crafted", "playful", "trustworthy"
3. Each facet should be independently measurable
4. Rate each 1-5 on a radar chart
5. Stack rank by importance

### Neuve Homepage Facets (Proposed)

| Facet         | Description                                                        | Current | Target |
| ------------- | ------------------------------------------------------------------ | ------- | ------ |
| **Warm**      | Feels personal, inviting, human — not cold SaaS                    | ?       | 4+     |
| **Crafted**   | Every detail feels intentional, not template-generated             | ?       | 4+     |
| **Confident** | Bold typography, decisive color, no hedging                        | ?       | 4+     |
| **Cohesive**  | Feels like it belongs to the same product as the authenticated app | ?       | 5      |
| **Memorable** | One thing someone will remember and tell a friend                  | ?       | 3+     |

### Using the Framework

- **Planning**: Which facets need the most work? Focus effort there.
- **Critique**: "This doesn't feel warm enough" is more useful than "needs improvement"
- **Tracking**: Re-evaluate after each iteration. Are facets trending up?

---

## Design Quality Checklist

Before shipping, evaluate against these questions:

- [ ] Does the typography feel just right, or hard to read?
- [ ] Are colors working together or fighting?
- [ ] Is there a clear hierarchy, or does everything compete for attention?
- [ ] Does it look cheap or crafted?
- [ ] Does it feel fast or sluggish?
- [ ] Does it respond the way you expect?
- [ ] Does it meet the industry standard bar?
- [ ] Where does it fall on the 1-10 spectrum?
- [ ] Which quality facets are weakest? Can they be pushed?

---

## Visual Design Rules (Implementation Checklist)

From interfacecraft.dev Practical Demonstration and Consolidated Guidelines.

### Typography

- [ ] System/body font for all UI text; display/serif font for page title ONLY
- [ ] Clear typographic scale with consistent hierarchy
- [ ] Font personality matches product: serif = authority/trust; sans-serif = clean/modern
- [ ] No more than 2 font families

### Color

- [ ] Warm neutral palette as foundation (off-whites, warm grays)
- [ ] Pure white reserved for focused content areas
- [ ] One bright accent color used sparingly for key actions
- [ ] No background colors used without clear intention
- [ ] No default AI-generated color schemes (purple gradients)

### Spacing & Layout

- [ ] Max 2 dominant vertical alignment rules
- [ ] Padding balanced optically, not just mathematically
- [ ] Equal gaps between sibling elements
- [ ] 120px+ between major sections (whitespace = premium)

### Containers & Cards

- [ ] Siblings don't use separate containers unnecessarily
- [ ] Subtle layers preferred over strokes/shadows
- [ ] One separation method per card (shadow OR border OR background)
- [ ] Lighter borders = more refined

### Icons & Visual Elements

- [ ] Consistent icon style throughout (filled vs outline — pick one)
- [ ] Consistent stroke widths
- [ ] Icon language carried through entire interface consistently

---

## Interface Design Rules (Implementation Checklist)

### Hierarchy

- [ ] Every view has a clear primary action
- [ ] Primary action positioned on the right (iOS convention)
- [ ] Active items visually dominate completed/secondary items
- [ ] CTAs look like CTAs with clear visual weight

### Information Architecture

- [ ] Starts from platform defaults, then innovates
- [ ] Related items grouped to reduce cognitive load
- [ ] Progressive disclosure: summary first, details on tap
- [ ] No redundant text (duplicate subtitles, verbose headers)

### Navigation & Flow

- [ ] Vertical scrolling as primary pattern
- [ ] Sheet modalities over full-page pushes where possible
- [ ] Auto-expand/scroll to current location
- [ ] Focusing mechanism: "this is what to do next"

### Content

- [ ] Language warmed up for consumer products (not clinical)
- [ ] Emotional context considered
- [ ] Expectations set (time estimates, what to expect)

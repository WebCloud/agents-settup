# Interface Craft — Working Knowledge Principles

Source: interfacecraft.dev by Josh Puckett (ex-Wealthfront, Dropbox; mentored designers at Apple, Browserbase, Cardless)

> "As software gets easier to make, the products that stand out will be the ones crafted with uncommon care."

---

## 1. Noticing

> A foundational skill necessary to develop an eye for details.

Train yourself to see **why** things feel right or wrong, not just that they do.

### What to Notice (Checklist)

- **Moments of hesitation** — What caused it? Uncertainty? Lack of trust?
- **Expectation gaps** — Where did your mental model break?
- **Emotional shifts** — Why are you suddenly annoyed? What triggered the smile?
- **When something's missing** — What were you looking for?
- **What's being assumed** — What's hidden vs surfaced? Why?
- **How it looks** — Cheap or crafted? Typography right or hard to read? Colors working together or fighting? Clear hierarchy or everything competing?
- **How it feels** — Fast or sluggish? Responsive as expected? Durable or fragile?

### Building the Habit

Noticing is a muscle. Spend 10 minutes with something you use regularly. Write down what you find. Be specific — never just "it feels nice" or "the design is clean." Write down **why**.

---

## 2. Conceptual Range

> Exploring a wide range of disparate solutions before committing.

### Key Distinction

Variants of the same idea = **depth**, NOT range. True range means structurally different solutions.

### How to Push Past the Obvious

1. **Remove (or add!) a constraint** — What if this didn't need to be a screen?
2. **Blend from other domains** — How would this work as a game? What if Muji made it?
3. **Invert the problem** — Help users eliminate what they don't want instead of finding what they do
4. **Set an arbitrary range** — Force 5, 12, or 20 ideas
5. **Optimize for facets** — What if this was 10/10 on durable? On differentiation?

---

## 3. Conceptual Depth

> Refining a solution through intentional iteration.

### The 1-10 Spectrum

- **Level 1**: Default, minimum viable. First draft.
- **Level 10**: Best version imaginable. Everything considered, tried, edited, improved.
- Most work ships at **1-3**. Not because that's all possible — because it's easy to stop pushing.

### How to Push Further

1. **Zoom in** — Pick one thing and give it all your attention
2. **Remove something** — Did you actually need it?
3. **Name what isn't working** — Even without knowing the fix, articulate the problem
4. **Reference the best** — Find world-class examples. Let them reveal gaps.
5. **Generate more** — Sometimes the only way to improve is to create more, then select
6. **Critique** — Self-critique using your facets of quality

---

## 4. Live Tuning

> Creating an immediate connection to what you are creating.

Expose key parameters (duration, easing, spacing, shadows, blur, scale) for real-time adjustment. Feel the difference instead of guessing through tweak-save-look cycles.

- Build intuition faster
- Find combinations you'd never land on by guessing
- Generate many iterations with random parameters to see wide range of possibilities

---

## 5. Uncommon Care

> Pushing beyond to make people feel something.

The details people remember are the ones **you didn't have to do** — edge cases, error states, conditions only a few users might ever see.

### Why It Matters Now

- AI gives immense leverage. The question: fill it with pedestrian work, or pour more of yourself into what you create?
- Anyone can generate "good enough" quickly. The bar for good enough is collapsing.
- The way to stand out: create something that makes people ask "How did they do that?!"

### Self-Reflection Prompts

- Where are you stopping at good enough?
- What's the skeleton in the closet — the thing everyone knows is broken?
- Where are you limiting yourself because it feels uncomfortable to lean in?

---

## 6. Separation of Concerns

> Focusing attention on resolving discrete concerns.

Don't solve everything simultaneously. Before diving in, ask: **what concern am I trying to resolve? What question am I answering?**

- Use the right tool/format and go only as far as needed
- Build "breakable toys" to test if a direction is worth pursuing
- Work at a fidelity conducive to the decision at hand
- Be intentional about what you're resolving and modulate output appropriately

> "Slow is smooth, and smooth is fast."

---

## 7. Facets of Quality

> Defining and improving the attributes that matter most to you.

Define specific quality attributes for YOUR product. Not general things ("usefulness") but the external characteristics you want users to perceive.

### Example Facets (Interface Craft's Own)

1. **Crafted** — Feels like a well-made product by someone who honed their trade
2. **Fidgetable** — Fun, interactive, playful, almost physical
3. **Authentic** — True expression of the creator, representative of genuine care
4. **Expansive** — Substantial, a living body of work that grows over time
5. **Inventive** — Novel, different, something you've never seen before

### Usage

- Rate each facet 1-5 on a radar chart
- Stack rank by importance
- Creates shared language for quality discussion
- More precise than "needs more work" → "doesn't feel inventive enough"

---

## 8. Less, but Better

> A discipline of minimalism. (Dieter Rams)

Continually fight the tendency to add more. It's far easier to design less, then refine until it's great.

### In Practice

Interface Craft's pre-launch site: single page, **two typefaces, three sizes, two neutral colors, one button**. Hero graphic is cards with animated graphics. One simple, key interaction.

> "I chose to do as little as possible, but execute it to an incredibly high bar."

> "It is not daily increase but daily decrease, hack away the unessential." — Bruce Lee

---

## 9. Recreate Everything

> A way of rapidly learning and growing your skillset.

Simple rule: **anything that inspires you or makes you wonder "how did they do that?", try to recreate it.** Ideally as soon as possible, while you still have that spark of curiosity.

1. See something inspiring
2. Spin up a playground
3. Think about it, start building
4. Iterate through progressive improvements
5. Stop when you've learned enough

---

## 10. Industry Standards

> Understanding the invisible bar that users expect.

Popular apps (Instagram, Notion, TikTok, iOS, Linear, Figma) form collective expectations — the **industry standard**. If your product doesn't meet this bar, people immediately discount it.

### Default, Then Innovate

- **iOS**: Start with Human Interface Guidelines, standardized APIs, system components
- **Web**: Start with what the default shadcn app with Tailwind would be
- Then improve and innovate beyond

### Exemplary Products

- **Family** (fintech): Looks Apple-made. Took iOS defaults, showed great respect for platform standards, but went beyond and innovated on every aspect.
- **Raycast** (Mac): Feels completely native. Everything about it ranges from a little to a lot better than Spotlight.

> Start with defaults. Understand standards. Then innovate. Don't start from scratch.

---

## Practical Refinement Techniques (from Case Studies)

Source: interfacecraft.dev Practical Demonstration collection — three detailed walkthroughs of real app refinement.

### Progressive Refinement Methodology

Small changes compound. Each seems minor alone, but together they transform the result:

1. **Simplify toolbar/nav** — Remove visual containers, use floating buttons, put primary action on right
2. **Reduce vertical alignment rules** — Simplify to max 2 dominant vertical rules; share consistent left edge
3. **Tighten padding optically** — Balance proportions by feel, not just math
4. **Standardize dividers** — If some elements have them, all siblings should (or none should)
5. **Use tokens for labels** — Style category/section labels as visual tokens to differentiate from body text
6. **Align iconography** — Consistent stroke widths and styles across entire interface
7. **Reserve decorative fonts** — Display/serif fonts for page title ONLY; body font for section headers. Using them everywhere dilutes impact.
8. **Merge sibling cards** — Don't separate related items that don't need separate containers
9. **Progressive disclosure** — Show key info only; click/tap for details. Don't stuff every data point at overview level.
10. **Warm up clinical language** — "Form Preparation" → "Your Paperwork". Consider emotional context.

### Visual Language Development Process

From the mobile web app redesign (3-part walkthrough):

1. **Define guiding attributes FIRST** — What do you want users to feel? (e.g., Trust, Calm, Expertise)
2. **Test 3-4 fonts before choosing** — Understand what each conveys before committing
3. **Test visual language on isolated components** — Play with styles on buttons/cards/badges before applying to full interfaces
4. **Establish corner radius spectrum** — From technical (sharp) to friendly (rounded). Be intentional.
5. **One bright accent color** — Warm neutral palette overall, one bright accent for key actions/moments of hope
6. **Prefer subtle layers over strokes** — Layer blurring and cards instead of borders or shadows for containment
7. **Icons: bold, precise** — Strong weight, no corner radius on icons to balance soft containers

### Interface Architecture Process

1. Start with iOS/platform defaults as foundation
2. Group items by meaningful phases (don't present flat lists of 40+ items)
3. Vertical scrolling is most natural — accordion over tabs when possible
4. Sheet modality over full-page pushes (keeps user anchored)
5. Auto-expand/scroll to user's current location
6. Surface input directly on view (don't hide behind navigation)
7. Collapse completed content with subtle visual treatment

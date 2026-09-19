# DevHub — Landing Page Reference Notes

These references are the visual/motion authority for the DevHub landing page.
Do not copy the reference branding, content, names, pricing, or product identity.
Translate the visual principles into an original DevHub experience.

## Files

- `landing-scroll-reference.mp4`
  - Main reference for overall landing-page pacing, section transitions, depth, atmosphere, density, and scroll choreography.
- `navbar-reference.png`
  - Main reference for the floating pill navigation shape, proportions, border, compact spacing, and shadow.
- `footer-reference.png`
  - Main reference for the final CTA + footer composition, rounded containers, spacing, column structure, and oversized faint wordmark treatment.
- `depth-text-reference.md`
  - React Bits DepthText reference supplied by the user. Use it as the basis for the primary dimensional hero typography.

---

# 1. Overall landing direction

DevHub must feel like a premium developer-intelligence product, not a generic SaaS template.

Use the landing video for:
- section rhythm
- cinematic pacing
- visual continuity
- foreground/background depth
- product UI integrated into storytelling
- restrained use of animation
- smooth scene handoffs
- polished dark atmosphere

Do NOT copy:
- DesignCode branding
- text/content
- pricing
- course/product content
- exact section copy

DevHub content must remain about:
- GitHub developer discovery
- repository intelligence
- languages
- contributors
- activity
- favorites
- comparisons
- developer/repository search

Preserve the existing React Bits particle atmosphere where it fits the landing background.

---

# 2. Hero typography

Use the supplied React Bits `DepthText` component as the primary reference for the main hero display typography.

Recommended primary use:
- the word `DEVHUB`

The dimensional text should feel premium and interactive:
- subtle pointer tracking on desktop
- controlled depth
- restrained cyan/ice-blue/violet extrusion rather than loud neon
- soft shadow
- no excessive spinning
- no giant 3D text repeated across every section

The 3D/depth effect belongs mainly to the hero and possibly one major transition moment.

Do not use DepthText for normal body copy, navigation, tables, cards, or every heading.

---

# 3. Navbar behavior — IMPORTANT

Use `navbar-reference.png` for the navigation's visual form.

At/near the top of the landing page:
- show the full floating pill navbar
- rounded capsule
- compact height
- GitHub/DevHub cat mark at the LEFT
- navigation links/actions in the pill
- clean black/dark surface
- thin light border
- subtle premium shadow

The exact reference labels are NOT to be copied.

Use DevHub-relevant navigation/actions, based on routes that actually exist.

## Scroll-collapse behavior

While the user is actively scrolling away from the top:

1. The navbar must collapse.
2. All text links/actions smoothly disappear.
3. The pill width smoothly contracts.
4. The GitHub/DevHub cat mark that normally sits at the LEFT must travel smoothly into the CENTER.
5. The collapsed navbar becomes essentially one compact circular/rounded control.
6. In this state, ONLY the centered cat/logo should remain visible.
7. Do not leave stray text, separators, empty gaps, or partial buttons visible.

The collapse should look like one component transforming, not one navbar being replaced by another.

## Hover/focus behavior

When the navbar is collapsed and the user:
- moves the mouse over it
- moves the pointer into its hover area
- keyboard-focuses it

the navbar should smoothly expand back into the full pill.

The cat/logo moves from center back to its left position.
The links/actions reveal smoothly.

When the pointer leaves:
- if the page is still scrolled away from the top, it may collapse again after a short calm delay
- do not instantly snap shut

At the top of the page:
- keep the full navbar visible

## Touch/mobile behavior

There is no hover on touch devices.

Use tap to expand/collapse or open the mobile menu.
Do not create a hover-only navigation system.

## Accessibility

- keyboard reachable
- visible focus state
- semantic links/buttons
- reduced-motion fallback
- no layout shift
- no inaccessible hidden links receiving focus while visually collapsed

---

# 4. Landing scroll behavior

The video reference is the main scroll-motion reference.

Scrolling should feel continuous, not like stacked PowerPoint slides.

Avoid:
- identical fade-up animation on every section
- hard snap-scroll everywhere
- huge empty gaps
- random floating UI
- excessive zoom
- every section being a 3-card grid
- giant text in every viewport

Prefer:
- visual continuation between scenes
- layered transitions
- shared UI elements that evolve between sections
- masks/reveals
- subtle parallax
- controlled pinned sequences where they genuinely help
- real DevHub product visuals

---

# 5. Footer

Use `footer-reference.png` as the footer composition reference.

Key ideas to carry over:
- a strong final CTA panel above the footer
- large rounded outer containers
- generous but controlled spacing
- brand block on the left
- useful grouped navigation columns
- subtle divider
- legal/meta row
- oversized very faint `DevHub` wordmark in the background/lower area

Do NOT copy:
- Graphy logo
- Graphy wording
- Graphy links
- the exact CTA copy
- social links that DevHub does not actually have

Adapt the composition to DevHub.

A light/near-white closing section can be used as an intentional contrast to the dark landing experience if it integrates smoothly with the preceding section.

The final CTA should be DevHub-specific, for example centered around exploring open-source intelligence, searching GitHub, or starting with DevHub.

---

# 6. Quality bar

The landing page should feel intentionally authored.

No:
- acid-lime brand color
- generic AI SaaS layout
- random gradients
- random badges
- fake statistics
- dead buttons
- placeholder sections
- scroll instructions
- progress counters/page numbers
- gratuitous animation

Every visible control must have a real purpose.

Desktop and mobile must both be deliberately designed.

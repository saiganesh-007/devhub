# DevHub Global Reference — Typography

Use `typography-reference.png` as the PRIMARY typography reference for DevHub.

This reference is about TYPOGRAPHY ONLY.

Do not copy it as a full page layout.
Do not recreate it as a dashboard.
Do not introduce unrelated cards, illustrations, scenery, or extra UI because of this image.

## What to take from this reference

Use it to define:
- DevHub wordmark treatment
- display typography
- H1 / H2 / H3 / H4 hierarchy
- body large / body / small / caption hierarchy
- font weights
- tracking / letter spacing
- line-height rhythm
- contrast between display copy and supporting copy
- restrained blue-violet accent treatment inside important words
- uppercase micro-label style
- stat / numeric typography
- metadata typography

## Overall type personality

The DevHub type system should feel:
- modern
- technical
- premium
- calm
- confident
- highly readable
- suitable for a serious developer intelligence product

Avoid:
- playful rounded startup fonts
- overly futuristic sci-fi fonts
- giant display text everywhere
- excessive uppercase
- excessive gradient text
- tiny low-contrast body copy
- random font families page-to-page

## Font direction

Prefer a clean modern sans-serif for product UI and marketing copy.

Use a monospace font only where it has semantic value:
- code
- keyboard shortcuts
- hashes / IDs
- terminal-like metadata where appropriate

Do not use monospace for normal body copy.

## Hierarchy

Treat the reference as guidance for a consistent scale:

- Display: landing hero / rare major moments only
- H1: page title
- H2: major section title
- H3: subsection title
- H4: card/module title
- Body Large: lead/supporting copy
- Body: normal content
- Small: secondary information
- Caption: labels / metadata

The exact pixel values should be adapted responsively to the existing DevHub layout rather than copied blindly.

## Gradient / accent typography

The blue-to-violet treatment may be used sparingly for:
- part of the DevHub wordmark
- one emphasized phrase in a hero
- one meaningful highlighted word

Do not apply gradients to every heading.

## Light / Dark / System themes

Typography must work in:
- Light mode
- Dark mode
- System mode

Maintain:
- readable contrast
- consistent hierarchy
- sensible muted-text colors
- proper emphasis in every theme

The reference image is dark-mode visual inspiration only; the typography system itself must be theme-independent.

## Responsive typography

The type scale must adapt cleanly across:
- mobile
- tablet
- laptop
- large desktop

Prevent:
- clipped display text
- awkward single-word wraps
- overflow
- oversized mobile headings

Use responsive `clamp()`-style scaling where appropriate.

## Consistency rule

This typography system must be shared across:
- landing page
- auth pages
- dashboard
- search
- developer profile
- repository profile
- compare
- settings
- loading copy where any text is shown

Do not let individual pages invent their own typography system.

## Important

This reference is a TYPOGRAPHY REFERENCE ONLY.
Do not copy its page structure or surrounding layout.

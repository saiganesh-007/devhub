# DevHub Reference Map

This file defines how Astra must interpret and prioritize every design reference inside `design-references/`.

These references are NOT separate redesigns.
They are parts of one unified DevHub product system.

Astra must inspect every referenced file before making visual changes.

---

# 0. Global Priority Rules

When two references appear to conflict, use this priority order:

1. Preserve working functionality and real data flows.
2. Follow the page-specific reference for that page.
3. Follow `09-global` for typography, colors, buttons, cards, motion, and shared interaction language.
4. Preserve DevHub brand identity.
5. Preserve accessibility and responsive behavior.
6. Prefer the simpler polished solution over unnecessary effects.

Do not copy external/reference branding, text, data, product names, statistics, or identities.

Use references for:
- composition
- spacing
- hierarchy
- motion
- interaction
- visual language
- component behavior

DevHub content must remain DevHub-specific.

---

# 1. Official DevHub Brand Asset

The generated DevHub cat + `DEVHUB` artwork is the official product brand identity.

Use it consistently across the product.

Use the full cat + wordmark where space allows.

Use the cat mark alone in compact locations such as:
- collapsed floating navbar
- compact sidebar state
- favicon/app icon
- small branded controls

Do NOT:
- generate another DevHub logo
- substitute a generic GitHub logo
- use an unrelated cat mascot
- distort the logo aspect ratio
- squeeze the full wordmark into tiny icon containers

Where a visual reference contains a GitHub/Octocat mark or generic placeholder brand icon, adapt that position to the official DevHub brand asset.

Important locations:
- landing navbar
- collapsed navbar
- loader branding where appropriate
- auth mascot identity
- app shell
- sidebar
- footer
- branded empty states where appropriate

---

# 2. React Bits Particle Reference

File:

`design-references/react-bits-particles.md`

This is the reference for the existing atmospheric particle background.

Preserve the existing React Bits particle implementation where it is already part of the intended visual direction.

Do not replace it with:
- random CSS dots
- a different particle library
- unnecessary canvas effects
- heavy WebGL effects that reduce performance

Use it mainly where it supports the cinematic landing/loading atmosphere.

Do not force particles onto every authenticated dashboard page.

---

# 3. Loading Experience

Folder:

`design-references/01-loading/`

Expected files:

- `loader-bar-reference.png`
- `loader-cat-reference.png`
- `NOTES.md`

This folder is the authority for the loading screen.

## Core concept

A DevHub/GitHub-style cat holds a paintbrush and actively paints the loading bar from left to right.

The loading progress should visually feel driven by the brush movement.

Required sequence:

1. Fullscreen loader appears.
2. Premium dark background/particle atmosphere.
3. Cat and brush are visible.
4. Cat paints/fills the bar from left to right.
5. Bar completes.
6. Brief completion beat.
7. Loader transitions smoothly into the landing page.

Do NOT use:
- generic spinner
- fake percentage counter
- random PNG orbiting
- Tom/Jerry chase behavior
- abrupt `display: none`
- disconnected loading bar animation

The mascot/loader interaction should feel playful but premium.

---

# 4. Landing Page

Folder:

`design-references/02-landing/`

Expected files include:

- `landing-scroll-reference.mp4`
- `navbar-reference.png`
- `footer-reference.png`
- `depth-text-reference.md`
- `NOTES.md`

This folder is the authority for the public landing page.

## 4.1 Main scroll video

`landing-scroll-reference.mp4`

Use it for:
- scroll pacing
- section rhythm
- cinematic continuity
- depth
- transitions
- scene handoffs
- product storytelling

Do NOT copy:
- branding
- product content
- exact section copy
- unrelated UI data

DevHub must tell its own story around:
- developer discovery
- repository intelligence
- languages
- contributors
- activity
- favorites
- comparison
- search

Avoid:
- repeated 3-card grids
- giant headings in every viewport
- identical fade-up sections
- hard page snapping everywhere
- meaningless decorative statistics

## 4.2 Navbar

`navbar-reference.png`

Use the floating pill shape, compact spacing, subtle border, and premium dark surface as the structural reference.

At the top:
- full navbar is visible
- DevHub brand/cat is on the left

While scrolling:
- navbar contracts smoothly
- links/actions disappear
- the DevHub cat/logo travels from left to center
- collapsed state becomes a compact rounded control
- only the centered cat/logo remains visible

When hovering/focusing the collapsed navbar:
- expand smoothly
- cat/logo moves back to the left
- navigation links/actions reveal

When pointer leaves while still scrolled:
- collapse again after a short calm delay

Mobile/touch:
- do not depend on hover
- use tap/menu behavior

The collapse must feel like one component transforming, not two unrelated navbars swapping.

## 4.3 Hero typography

`depth-text-reference.md`

Use React Bits DepthText mainly for the hero word:

`DEVHUB`

Use:
- subtle dimensional extrusion
- controlled pointer tracking
- restrained blue/indigo/violet depth color
- responsive sizing
- reduced-motion fallback

Do NOT use 3D depth text for:
- every section heading
- tables
- cards
- form labels
- normal app UI

## 4.4 Footer

`footer-reference.png`

Use it for:
- strong final CTA panel
- large rounded composition
- grouped navigation columns
- subtle separators
- brand block
- oversized faint `DEVHUB` background wordmark if it fits the final visual system

Do not copy the source brand or source links.

---

# 5. Authentication

Folder:

`design-references/03-auth/`

Expected files include:

- `login-reference.png`
- `NOTES.md`
- `signup-reference.md`
- `otp-verification-reference.md`
- `forgot-password-reference.md`
- `reset-password-reference.md`

This folder is the authority for the full authentication experience.

All auth pages must feel like states of ONE system.

Use the SAME:
- background
- form shell
- typography
- spacing
- buttons
- input language
- DevHub cat mascot
- motion language
- error/success styling

## 5.1 Login

Use `login-reference.png` for the playful reactive-mascot interaction concept.

Replace the source mascot with the DevHub cat identity.

Required reactions:
- idle = alive but subtle
- cursor movement = eyes/head track gently
- email/username focus = curious/identity-check reaction
- password focus = cat closes/covers eyes
- wrong credentials = skeptical/judging reaction
- successful login = positive approval reaction

Keep real Supabase login behavior intact.

## 5.2 Signup

Use the same login visual system.

Reactions:
- name/username = welcoming/curious
- email = checking
- password = eyes covered
- confirm password = cautious peek
- mismatch = confused/judging
- successful account creation = positive reaction

Do not invent a completely different signup layout.

## 5.3 OTP / Email Verification

Use `otp-verification-reference.md`.

Important:
- DO NOT hard-code the UI to exactly 6 digits.
- The real auth flow may use a longer OTP.
- Support actual configured/received code length robustly.

Must support:
- typing
- paste
- backspace behavior
- clear invalid/expired state
- resend
- loading
- success
- mobile keyboard behavior
- keyboard accessibility

Mascot can react to:
- waiting
- code entry
- invalid code
- resend
- successful verification

## 5.4 Forgot Password

Use `forgot-password-reference.md`.

Required:
- real email submission
- loading
- error
- success
- back-to-login
- same mascot system

## 5.5 Reset Password

Use `reset-password-reference.md`.

Required:
- new password
- confirm password
- validation
- real recovery-session handling
- expired/invalid recovery state
- success redirect

Mascot:
- eyes closed on new password
- cautious peek on confirmation
- confused on mismatch
- happy on success

---

# 6. App Shell / Dashboard

Folder:

`design-references/04-app-shell/`

Expected files:

- `dashboard-reference.png`
- `NOTES.md`

This folder controls the authenticated product shell.

Use the dashboard reference for:
- sidebar width
- icon spacing
- topbar height
- search placement
- page margins
- card density
- chart/table rhythm
- overall app-shell hierarchy

Do NOT copy the finance content from the reference.

Adapt to DevHub content such as:
- favorite developers
- favorite repositories
- recent searches
- recent views
- repository activity
- language breakdown
- contributor insights
- comparison history
- saved/watchlist items

## Theme requirement

The entire authenticated app must support:
- Light mode
- Dark mode
- System mode

System mode follows the OS/browser setting.

Theme changes must correctly affect:
- surfaces
- cards
- text
- borders
- shadows
- inputs
- tables
- charts
- semantic states

Do not build dark-only.

---

# 7. Search

Folder:

`design-references/05-search/`

Expected files:

- `search-reference.png`
- `NOTES.md`

This folder controls the search-field visual language.

Use the reference for:
- long rounded pill shape
- soft premium surface
- subtle glass/neumorphic feeling
- refined border/shadow
- separate rounded search action button
- spacious, calm composition

Use for:
- global search
- developer search
- repository search
- compare entity selection where appropriate

Must support:
- initial state
- typing
- loading
- results
- no results
- API error
- rate-limit state
- keyboard focus
- responsive/mobile behavior

Translate the visual style properly into:
- Light mode
- Dark mode
- System mode

---

# 8. Developer Profile

Folder:

`design-references/06-developer-profile/`

Expected files:

- `developer-reference.png`
- `NOTES.md`

This folder controls the developer profile/intelligence page.

Use the reference for:
- profile hero composition
- balance between identity and metrics
- strong first-screen impact
- card grouping
- section hierarchy
- premium personal/developer presentation

Do NOT clone it as a portfolio page.

Adapt it to real GitHub developer data:

Possible sections:
- avatar
- display name
- username
- bio
- location/company/site when available
- followers/following
- public repository count
- top repositories
- language breakdown
- repository stars
- organizations
- recent activity where supported
- save/favorite
- compare
- external GitHub link

Do not invent unavailable metrics.

Support:
- loading
- error
- missing data
- responsiveness
- light/dark/system themes

---

# 9. Repository Page

Folder:

`design-references/07-repository/`

Expected files:

- `repository-reference.png`
- `NOTES.md`

This folder controls the repository intelligence page.

Use the reference for:
- repository header composition
- tabs
- file-list/table density
- right-side metadata
- contributors section
- language breakdown
- spacing and hierarchy

Do NOT copy the sample repository or hard-code sample statistics.

Adapt to real GitHub/API data such as:
- owner/name
- description
- visibility
- primary language
- stars
- forks
- open issues
- watchers if available
- default branch
- license
- repository size
- topics
- contributors
- language composition
- recent activity where available
- external GitHub link
- favorite/save

Support:
- loading
- missing data
- API errors
- responsive layouts
- light/dark/system themes

---

# 10. Compare Page

Folder:

`design-references/08-compare/`

Expected files:

- `compare-reference.png`
- `NOTES.md`

This folder controls the comparison experience.

Use the reference for:
- side-by-side layout
- equal visual weight
- clear `VS` separation
- aligned metric rows
- category tabs
- language charts
- feature comparison area
- repository/developer info rows
- clear spacing and hierarchy

Important:
- comparison is factual
- do NOT declare a winner
- do NOT create arbitrary scores
- do NOT call one entity objectively better overall

Use real available data only.

Repository comparison may include:
- stars
- forks
- watchers
- open issues
- languages
- contributors
- last updated
- branch
- license
- size
- releases
- topics
- activity data where available

Developer comparison may include:
- public repositories
- followers/following
- top repositories
- total stars across tracked repos
- language mix
- contribution/activity signals
- organizations/metadata where available

If an AI summary exists:
- keep it factual
- base it on real data
- do not fabricate
- do not declare a winner

If AI summary functionality does NOT exist, do not fake it just because the visual reference contains one.

---

# 11. Global Design System

Folder:

`design-references/09-global/`

This folder controls all shared visual language across the product.

Expected files currently include:

- `typography-reference.png`
- `typography-NOTES.md`
- `colors-reference.png`
- `NOTES.md`
- `buttons-reference.png`
- `buttons-reference.md`
- `buttons-code-notes.md`
- `cards-reference.png`
- `cards-reference.md`
- `cards-code-notes.md`
- `interactions-reference.md`
- `motion-tokens.md`
- DevHub logo reference if placed here

---

# 11.1 Typography

Use the typography reference for:
- hero hierarchy
- page titles
- section titles
- body copy
- metadata
- statistics
- code/technical text
- labels
- microcopy

Do not make every heading enormous.

Application UI should prioritize readability over cinematic typography.

Use tabular numerals where useful for aligned metrics.

---

# 11.2 Colors

Use `colors-reference.png` as the global color-system reference.

Core direction:
- deep graphite/navy/near-black base
- soft white primary text
- cool gray secondary text
- electric indigo / blue-violet primary brand accent
- vivid purple secondary accent
- restrained orange/amber highlight where appropriate

Use semantic colors for:
- success
- warning
- error
- info

Avoid:
- acid-lime as brand color
- oversaturated rainbow surfaces
- glow on every component
- gradients everywhere

Create proper tokens for:
- backgrounds
- elevated surfaces
- borders
- text
- muted text
- inputs
- cards
- semantic states
- charts

Must support Light / Dark / System.

---

# 11.3 Buttons

Use the global button reference for compact icon-button interaction.

Reference behavior includes:
- circular shape
- translucent/glassy surface
- subtle border
- restrained glow
- small hover scale
- tiny playful rotation where appropriate
- highlight sweep
- tactile active state

Use selectively for:
- favorite
- bookmark
- external link
- share
- theme toggle
- compact utilities

Do NOT use playful rotation on:
- destructive actions
- critical auth actions
- every normal button

DevHub still needs normal:
- Primary
- Secondary
- Ghost
- Destructive
- Loading
- Disabled

button variants.

---

# 11.4 Cards

Use the global card reference plus supplied flip-card behavior.

The 3D flip interaction is OPTIONAL and selective.

Potential uses:
- developer summary card
- repository summary card
- saved item card
- feature storytelling card

Do NOT flip:
- every dashboard card
- forms
- charts
- tables
- critical controls
- dense information panels

Information required for scanning should remain visible without requiring a flip.

On touch:
- use tap
- or replace with expandable behavior if flipping harms usability

Use DevHub colors instead of the source coral/bisque styling.

---

# 11.5 Global Interactions

Use `interactions-reference.md` and `motion-tokens.md` as the shared motion rulebook.

DevHub motion should feel:
- precise
- premium
- responsive
- calm
- slightly playful only where appropriate

Shared approximate timing:
- hover: 120–220ms
- buttons/tabs: ~200ms
- dropdowns: 160–240ms
- card expand/flip: 450–750ms
- larger visual transitions: 350–700ms
- cinematic landing motion may be longer

Use consistent easing.

Respect:
`prefers-reduced-motion`

Clean up:
- RAF loops
- GSAP contexts
- event listeners
- timers
- observers
- ScrollTriggers

Avoid:
- excessive bounce
- random floating
- constant pulsing
- meaningless parallax
- inconsistent motion speeds

---

# 12. Shared Responsive Rule

Every page must be deliberately designed for:

- ~375px mobile
- ~430px mobile
- ~768px tablet
- ~1024px laptop/tablet landscape
- ~1440px desktop
- large desktop

Do not simply hide important information on mobile.

Adapt:
- grids
- tables
- charts
- sidebars
- navigation
- comparisons
- cards
- hero typography

Touch targets must remain usable.

---

# 13. Shared Accessibility Rule

All references are visual inspiration only.

Final implementation must remain:
- semantic
- keyboard accessible
- screen-reader understandable
- focus-visible
- contrast-safe
- touch friendly
- reduced-motion aware

Never sacrifice accessibility just to imitate a reference.

---

# 14. Shared Functional Rule

References must NEVER replace working functionality.

Preserve:
- Supabase authentication
- Supabase RLS
- persisted favorites
- recent views
- GitHub API integration
- repository/developer search
- dynamic routes
- validation
- server-side secrets
- real data

Do not replace real data with hard-coded mock data just to match a screenshot.

---

# 15. Final Interpretation Rule

Astra should treat all references as a single coherent system:

- `01-loading` = first impression / loader
- `02-landing` = public storytelling + navbar + hero + footer
- `03-auth` = reactive mascot auth system
- `04-app-shell` = authenticated shell/dashboard layout
- `05-search` = search visual language
- `06-developer-profile` = developer intelligence presentation
- `07-repository` = repository intelligence presentation
- `08-compare` = side-by-side factual comparison
- `09-global` = shared typography/colors/buttons/cards/motion
- `react-bits-particles.md` = atmospheric particle implementation reference
- official DevHub cat + wordmark = canonical brand identity

Do not redesign these areas independently.

The final application must feel like one intentionally designed DevHub product.

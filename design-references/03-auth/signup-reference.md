# DevHub Auth Reference — Signup

Use the SAME visual system and mascot style as the login page.

Primary visual reference:
- `login-reference.png` already stored in `design-references/03-auth/`

Do NOT invent a separate signup art direction.

## Signup concept

The signup page should feel like the natural second state of the login experience:
same background,
same form language,
same spacing,
same typography,
same DevHub/GitHub-style cat mascot,
same interaction quality.

## Required mascot reactions

### Default / first visit
- friendly, curious expression
- subtle idle motion

### Name / username field
- mascot looks interested / welcoming
- optional playful microcopy:
  - "What should I call you?"
  - "New developer detected."

### Email field
- mascot visually checks the entry
- optional microcopy:
  - "Where should we reach you?"
  - "Looks legit so far."

### Password field
- mascot closes or covers its eyes
- optional microcopy:
  - "I won't peek."
  - "Make it a good one."

### Weak password
- worried / skeptical expression
- keep message useful, not mocking
- show actual password requirements clearly

### Confirm password
- mascot peeks/checks cautiously
- if matching:
  - subtle positive reaction
- if not matching:
  - confused / judging reaction
  - clear text: passwords do not match

### Submit / creating account
- mascot enters short loading/anticipation state
- prevent repeated submissions

### Signup success
- happy / celebratory reaction
- smoothly move into email verification / OTP flow
- do NOT fake account creation

## Functional requirements

Keep the real Supabase signup flow intact.

Must include:
- real validation
- real loading state
- server/auth errors
- account-exists handling
- accessible labels
- keyboard support
- mobile responsiveness

## Important consistency rule

Login and signup should look like two states of ONE auth experience,
not two unrelated pages.

Do not:
- change the palette
- introduce a second mascot
- use a different card system
- use a totally different layout
- add random illustrations

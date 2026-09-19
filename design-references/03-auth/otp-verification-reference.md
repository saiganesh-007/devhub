# DevHub Auth Reference — Email Verification / OTP

Use the SAME visual system, spacing, typography, background, and DevHub/GitHub-style cat mascot already defined for Login and Signup.

Do NOT invent a third auth design.

## Core verification experience

After signup, move naturally into an email-verification state.

The page should feel like the next step of the same auth flow.

## Layout

Keep it compact and focused:

- DevHub branding
- short verification heading
- masked / partially shown destination email
- OTP input
- Verify button
- resend action
- back/change-email action only if the existing auth flow supports it
- mascot reaction area

Do not overload the page with extra cards or illustrations.

## IMPORTANT OTP requirement

Do NOT hard-code the UI to exactly 6 digits.

The real verification flow may deliver a longer code (for example 8 digits).

Build the OTP input so its length is driven by the actual auth configuration / received flow, or otherwise safely supports the real code length used by the project.

Support:
- typing
- full-code paste
- backspace navigation
- arrow-key navigation where appropriate
- mobile numeric keyboard where possible
- accessible labels / announcements
- clear invalid-code state

## Mascot reactions

### Waiting for code
- cat looks toward the OTP fields / mailbox area
- subtle waiting animation
- optional microcopy:
  - "Check your inbox."
  - "I sent something your way."

### While typing OTP
- eyes follow the active digit/input area
- subtle curious expression
- do not distract from input

### Invalid / expired OTP
- confused / skeptical / disappointed reaction
- useful copy, not mocking
- examples:
  - "That code didn’t work."
  - "Looks like that code expired."
  - "Try the newest code from your inbox."

### Resend
- short send/mail reaction
- disable resend during cooldown
- show clear countdown or state only if actually implemented

### Verification success
- happy / approving reaction
- brief success beat
- smoothly continue to login or the authenticated app based on the actual auth flow

## Functional requirements

Keep the real Supabase verification flow intact.

Must handle:
- valid code
- invalid code
- expired code
- resend
- loading state
- network/auth errors
- already verified state where relevant
- keyboard-only use
- mobile responsiveness

## Visual consistency

Use the same:
- background
- form container
- border radius
- button system
- input system
- mascot
- motion language
- error/success styling

as Login and Signup.

The entire auth flow must look like ONE coherent product.

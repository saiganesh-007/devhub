# DevHub Auth Reference — Forgot Password

Use the SAME visual system and the SAME DevHub/GitHub-style cat mascot as Login, Signup, and OTP verification.

Do NOT invent a new auth layout.

## Core flow

The forgot-password state should be compact, calm, and reassuring.

Required:
- email field
- submit/reset-link action
- loading state
- success state
- error state
- back-to-login action

## Mascot behavior

### Initial state
- friendly/attentive
- optional microcopy:
  - "Forgot something?"
  - "I can help with that."

### Email entry
- eyes subtly track the email field
- optional microcopy:
  - "Where should I send the reset link?"

### Sending
- brief anticipation/mail-send reaction
- disable repeated submission while sending

### Success
- relieved/approving reaction
- clearly explain that a reset email was sent
- do not pretend the password is already reset

### Invalid / unknown / auth error
- confused but not mocking
- useful copy
- preserve account-security best practices and avoid leaking unnecessary account existence details if the backend intentionally obscures them

## Functional requirements

Keep the real Supabase password-reset flow intact.

Must support:
- valid email submission
- loading
- success
- network/auth errors
- keyboard accessibility
- mobile responsiveness
- real redirect/callback behavior used by the project

## Consistency

Same:
- background
- form shell
- typography
- buttons
- inputs
- mascot
- motion language
- error/success states
as the rest of Auth.

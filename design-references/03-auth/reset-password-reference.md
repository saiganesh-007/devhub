# DevHub Auth Reference — Reset Password

Use the SAME DevHub auth visual system.

This page appears after the real reset/recovery link flow.

## Required UI

- new password
- confirm new password
- show/hide password controls if already part of the auth system
- validation feedback
- submit/update action
- loading
- error
- success

Do not add fake requirements that the backend does not enforce.

## Mascot behavior

### New password focus
- cat closes/covers its eyes
- playful privacy microcopy:
  - "I won't peek."
  - "New secret, got it."

### Confirm password
- cat cautiously peeks/checks
- matching passwords:
  - small approving reaction
- mismatch:
  - confused/judging reaction
  - clear message that passwords do not match

### Weak/invalid password
- concerned/skeptical reaction
- show actual useful validation text

### Updating password
- short anticipation/loading reaction
- prevent double submission

### Success
- happy/relieved reaction
- clear confirmation
- smoothly continue to Login or the authenticated app according to the actual project flow

## Security / correctness

Keep the real Supabase recovery session/callback logic intact.

Handle:
- invalid or expired recovery link/session
- password mismatch
- validation errors
- auth errors
- network errors
- successful update
- redirect after success

Do not expose secrets/tokens in visible UI or client logs.

## Consistency

Forgot Password and Reset Password must look like states of the SAME DevHub auth experience as:
- Login
- Signup
- OTP verification

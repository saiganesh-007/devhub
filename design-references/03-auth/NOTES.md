# DevHub Auth Reference — Login

Use `login-reference.png` as the interaction/style reference for the DevHub login page.

## Core concept

Create a premium dark login page for DevHub with an interactive DevHub/GitHub-style cat mascot.

The current reference shows the idea of a mascot reacting to cursor, identity fields, and password fields.
Do NOT copy the pink square character.
Replace it with a DevHub-branded GitHub-style cat mascot.

## Required mascot behaviors

### Idle state
- The mascot is visible near or above the login form.
- The mascot feels alive, friendly, and premium.
- Subtle idle motion is allowed.

### Cursor tracking
- The mascot should visually follow or react to the user’s cursor.
- When the cursor moves around the auth area, the cat’s eyes/head can subtly track it.
- Keep it smooth and not overdone.

### Identity input behavior
- When the user focuses the email / username field:
  - the cat reacts as if checking the user identity
  - can show a message like:
    - "Is this really you?"
    - "Let’s see who’s logging in."
    - "Identify yourself."
- Keep the tone playful, not childish.

### Password input behavior
- When the user focuses the password field:
  - the cat should close or cover its eyes
  - clearly communicate privacy/protection
  - this should feel intentional and cute
- Example supportive copy:
  - "I won’t look."
  - "Your secret is safe."
  - "Typing password… eyes closed."

### Wrong password / failed login
- If login fails:
  - the cat should react with a judging / suspicious / disappointed expression
  - not terrifying, just playful
- Example copy tone:
  - "Hmm… that doesn’t look right."
  - "Try that again."
  - "Suspicious credentials detected."
  - "That password seems wrong."

### Success
- On successful login:
  - the cat should react positively
  - brief success state before redirect
  - smooth transition into the app/dashboard

## Visual direction

- dark premium developer-tool aesthetic
- refined spacing
- compact clean form
- not a huge boring centered white card
- polished motion
- elegant typography
- DevHub visual identity
- cat mascot integrated intentionally, not pasted randomly

## Functional auth requirements

This page must still be a real auth page, not just visual design.

Required:
- real email login
- real signup flow later
- real OTP / email verification compatible flow where needed
- real error states
- real loading states
- accessible labels and inputs
- proper focus handling
- reduced-motion safe behavior

## Do NOT do

- do not use the random square pink mascot from the reference
- do not use generic placeholder auth UI
- do not create childish cartoon overload
- do not break real auth just to add mascot reactions
- do not make the mascot block form usability

## DevHub adaptation

All mascot reactions must use the DevHub / GitHub-style cat character instead of unrelated creatures.
The auth page should feel playful but still premium and production-ready.

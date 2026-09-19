# DevHub Motion Tokens

Suggested shared motion tokens for Astra to normalize during implementation.

- fast: 120ms
- normal: 200ms
- medium: 320ms
- large: 520ms
- cinematic: 700ms+

Use these as guidance, not rigid requirements.

Suggested categories:
- hover / focus: fast-normal
- buttons / tabs: normal
- dropdowns: normal-medium
- cards / drawers: medium-large
- landing scenes: large-cinematic

Use consistent easing variables instead of one-off transition strings everywhere.

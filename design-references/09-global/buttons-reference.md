# DevHub Global Buttons Reference

Use `buttons-reference.png` as the main visual reference for compact icon-button interactions in DevHub.

## Visual direction

Take from the reference:
- circular icon buttons
- dark translucent / glassy surfaces
- soft border
- subtle glow based on semantic/accent color
- compact premium feel
- strong icon clarity
- smooth hover and press feedback

Do NOT copy the unrelated brand icons/content.
Replace them with DevHub-relevant icons from the existing icon system (prefer Lucide where appropriate).

## Interaction behavior

Desktop hover:
- slight scale-up
- very small rotation is allowed for playful icon-only buttons
- border becomes more visible
- glow strengthens subtly
- a soft highlight sweep may pass across the button
- icon color can brighten slightly

Active / press:
- scale down slightly
- rotation returns toward neutral
- immediate tactile feedback

Focus:
- keyboard-visible focus ring
- do not rely on glow alone for accessibility

Reduced motion:
- remove rotation and exaggerated motion
- keep simple color/border feedback

## Where this style may be used

Use selectively for:
- favorite / bookmark
- external GitHub link
- share
- theme toggle
- compact utility actions
- icon-only controls

Do NOT use this exact circular treatment for every button.

## Standard buttons

DevHub still needs a consistent normal button system for:
- Primary
- Secondary
- Ghost
- Destructive
- Loading
- Disabled

These should use the global DevHub color tokens and remain calmer than the playful icon buttons.

## Theme requirement

Support:
- Light mode
- Dark mode
- System mode

The reference is dark, but the component system must have a proper light-theme equivalent with accessible contrast.

## Quality rules

- no excessive glow everywhere
- no giant hover scaling
- no distracting rotations on critical actions
- no dead buttons
- no inconsistent button heights
- keep hit targets accessible on touch devices

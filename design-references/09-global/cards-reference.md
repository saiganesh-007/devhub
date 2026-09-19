# DevHub Global Cards Reference

Use `cards-reference.png` plus the supplied flip-card CSS as the interaction reference for selected DevHub cards.

## Core idea

Some DevHub cards can use a polished 3D flip interaction:
- front = concise summary
- back = secondary details / actions
- smooth perspective rotation
- premium depth and shadow
- rounded corners
- clear visual hierarchy

The supplied Uiverse example is a behavior reference, NOT the final color/style reference.

## Where flip cards MAY be useful

Use selectively for cards where a second face genuinely adds value, for example:
- developer summary -> quick stats / actions
- repository summary -> languages / activity / actions
- saved item -> metadata / remove / compare
- feature explanation on landing page

Do NOT make every card flip.

Normal dashboard cards, charts, tables, auth panels, forms, and critical controls should remain stable and immediately readable.

## Desktop interaction

On hover/focus:
- smoothly rotate the inner card around Y axis
- preserve perspective
- front and back use backface-visibility
- animation should feel controlled, not gimmicky

Recommended motion:
- approximately 500–800 ms
- premium ease
- no repeated wobble
- no unnecessary bounce

## Touch/mobile behavior

Hover does not exist on touch devices.

For mobile/tablet:
- use tap to reveal the back face where flip behavior is retained
- provide a clear close/back affordance
- never trap important actions behind an undiscoverable gesture

If flipping harms usability on mobile, replace it with an expandable card instead.

## Accessibility

- keyboard accessible
- focusable only when interactive
- visible focus state
- content on the hidden face must not remain confusingly reachable
- respect prefers-reduced-motion
- provide a non-animated state when reduced motion is enabled

## DevHub visual adaptation

Do NOT use the peach/coral palette from the source example.

Use DevHub tokens:
- deep graphite/navy surfaces
- soft white text
- electric blue / indigo / violet accents
- subtle semantic colors when needed
- restrained glow
- thin borders
- premium shadows

Must support:
- Light mode
- Dark mode
- System mode

## Card system consistency

DevHub should have multiple intentional card variants:

1. Static information card
2. Metric/stat card
3. Developer card
4. Repository card
5. Interactive flip/expand card
6. Empty-state card
7. Error/warning card

Keep shared:
- radius system
- padding rhythm
- border treatment
- typography hierarchy
- focus behavior
- theme tokens

## Important

The flip interaction is an enhancement, not the foundation of the whole UI.
Information needed for fast scanning must remain visible without requiring a flip.

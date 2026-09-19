# DevHub Global Interactions Reference

This file defines the shared interaction and motion language for the entire DevHub product.

Use it together with:
- `buttons-reference.md`
- `cards-reference.md`
- landing references
- auth mascot notes
- app-shell references

The goal is consistency. Do not let every page invent its own animation style.

## 1. Motion personality

DevHub motion should feel:
- precise
- premium
- responsive
- slightly playful where appropriate
- technical
- calm
- intentional

Avoid:
- random floating
- excessive bounce
- long delays
- heavy scroll hijacking
- constant pulsing
- animation for decoration only
- different easing styles on every component

## 2. Interaction speed

Use fast feedback for product UI:

- hover feedback: ~120–220ms
- button press: ~80–160ms
- dropdown / popover: ~160–240ms
- tab indicator: ~180–280ms
- card expand / flip: ~450–750ms
- page/scene transitions: ~350–700ms when visually justified
- loading / cinematic landing motion may be longer

Do not slow down normal product use just to look cinematic.

## 3. Easing

Prefer smooth premium easing.

Use one or two shared easing curves across the application.

Examples conceptually:
- standard UI: ease-out / cubic-bezier with quick response and soft landing
- larger transformations: smoother ease-in-out
- spring/bounce only for playful mascot moments or tiny success reactions

Do not use aggressive overshoot for forms, tables, navigation, or critical actions.

## 4. Buttons

Buttons should respond immediately.

Hover:
- subtle lift or scale
- border / glow / surface response
- icon may shift slightly

Active:
- slight scale-down
- immediate tactile feedback

Disabled:
- no hover animation
- clearly lower emphasis

Loading:
- preserve button width
- avoid layout shift
- show spinner/progress only if appropriate

## 5. Icon buttons

Use the global circular icon-button interaction reference selectively.

Allowed effects:
- small scale-up
- tiny rotation for playful utility actions
- subtle glow
- soft highlight sweep

Avoid rotation on destructive or critical actions.

## 6. Cards

Static cards:
- very subtle hover lift or border emphasis only if clickable

Interactive cards:
- may use 3D flip/expand behavior where the second face adds real information

Never require hover to discover critical content.

Touch:
- use tap or expandable alternatives

## 7. Search

Search is a major DevHub interaction.

Focus:
- surface/border should become more defined
- subtle glow is allowed
- placeholder transitions should remain calm

Typing:
- avoid distracting animations

Results:
- skeleton or lightweight loading state
- results appear smoothly without jumping the whole page

Keyboard:
- preserve fast arrow-key / enter interaction where implemented
- visible focus state

## 8. Tabs

Tabs should use:
- smooth active-indicator motion
- clear state contrast
- no heavy animation

The indicator should visually connect old and new states where possible.

## 9. Dropdowns / popovers / menus

Open:
- small fade + scale/translate
- anchored to trigger
- fast and predictable

Close:
- slightly quicker than open

Must:
- close on Escape
- handle focus correctly
- remain usable via keyboard

## 10. Sidebar and app shell

Sidebar:
- active item transition should be subtle
- collapse/expand only if implemented intentionally
- no excessive icon motion

Mobile drawer:
- controlled slide/fade
- proper backdrop
- body scroll lock
- focus management

## 11. Theme switching

Light / Dark / System mode must switch smoothly without an ugly flash.

Do not animate every color property for a long duration.

Prefer:
- quick coordinated surface/text transition
- no layout shift
- preserve chart readability
- update browser/system color-scheme where appropriate

Respect System mode.

## 12. Auth mascot interaction

The DevHub/GitHub-style cat is the most playful interaction system.

Allowed:
- eye/head cursor tracking
- covering eyes for password
- suspicious/judging reaction on failed login
- happy approval on success
- OTP/email attention states

Keep these reactions local to auth.
Do not spread mascot animations across every dashboard page.

## 13. Loader interaction

The loader cat paints the loading bar.

The brush action must visually drive the loading progress.

Sequence:
1. loader enters
2. cat starts painting
3. fill advances left to right
4. completion beat
5. loader transforms/fades into landing

No abrupt disappearance.

## 14. Landing-page motion

The landing page can be more cinematic than the app.

Use:
- GSAP / ScrollTrigger where already appropriate
- masks
- layered depth
- controlled parallax
- shared-element-like continuity
- pinned scenes only where they genuinely improve storytelling

Avoid:
- identical fade-up animation everywhere
- hard page snapping
- giant zooms
- random orbiting objects
- visible scene/page counters
- scroll instructions

## 15. Navbar motion

At the top:
- full pill navbar visible

While scrolling:
- pill collapses
- text/actions disappear
- DevHub/GitHub cat/logo moves from left to center
- collapsed state contains only the centered mascot/logo

Hover/focus while collapsed:
- pill expands smoothly
- mascot/logo moves back left
- links/actions reveal

Pointer leave while scrolled:
- may collapse again after a short calm delay

Mobile:
- use tap; never depend on hover

## 16. Favorites / save interactions

On save:
- immediate optimistic visual feedback where safe
- short icon state change
- no huge celebration

On failure:
- revert state
- show clear error

## 17. Compare interactions

Changing either compared entity:
- update the side cleanly
- preserve alignment
- avoid resetting the entire page unnecessarily

Swap:
- animate the two sides only if it remains readable and quick

No winner animation or ranking emphasis.

## 18. Loading states

Prefer skeletons that resemble final content.

Avoid:
- generic fullscreen spinner for local data
- blank screens
- jumping card dimensions

Use local loading states whenever possible.

## 19. Error states

Errors should:
- appear near the relevant control/content
- not shake the entire screen
- use restrained semantic color
- include a retry action where useful

Auth mascot can react playfully, but the actual error copy must remain clear.

## 20. Success feedback

Use:
- subtle check state
- short toast
- compact positive motion

Do not block users with oversized success screens unless the flow requires a dedicated completion step.

## 21. Reduced motion

Honor `prefers-reduced-motion`.

When enabled:
- remove parallax
- remove 3D card flipping where necessary
- remove large transform sequences
- remove mascot tracking/orbit-like motion
- preserve clear state changes through opacity/color/instant positioning

## 22. Accessibility

Every interaction must remain:
- keyboard accessible
- screen-reader understandable
- touch friendly
- focus visible
- semantically correct

Hidden/animated content must not remain confusingly focusable.

## 23. Performance

Avoid:
- multiple competing RAF loops
- animation on layout-heavy properties when transforms/opacity work
- unnecessary React state updates on pointer move / scroll
- duplicate ScrollTriggers
- memory leaks

Clean up:
- event listeners
- requestAnimationFrame
- GSAP contexts
- observers
- timers

## 24. Final rule

Motion should make DevHub feel more coherent and responsive.

If an animation makes the interface slower, harder to understand, harder to access, or harder to maintain, simplify or remove it.

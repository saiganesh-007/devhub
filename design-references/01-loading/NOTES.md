# DevHub Loading Reference

Create a premium fullscreen loading overlay for DevHub.

Use the supplied references:

- `loader-bar-reference.png` = loading bar style/composition reference
- `loader-cat-reference.png` = mascot/brush character reference

## Core concept

A cute GitHub-style cat uses a paintbrush to fill the loading bar.

The bar should fill from left to right as if the cat is painting it in.

The motion should feel intentional and polished, not like a generic progress bar.

## Required animation sequence

1. Show a fullscreen dark DevHub loading screen.
2. Keep the background premium, minimal, and developer-tool appropriate.
3. Place the cat near the loading bar.
4. The cat should animate with the brush as if painting the bar.
5. The loading bar should progressively fill from left to right with a hand-painted / brushed visual style.
6. The cat motion and the bar fill should feel connected.
7. When the fill completes, hold the finished state briefly.
8. Then smoothly transition into the landing page.

## Visual direction

- premium dark loading screen
- polished, minimal, cinematic feel
- smooth easing
- clean silhouette
- no ugly random motion
- no jittery PNG dragging
- no generic spinner
- no fake percentage counter
- no clunky orbit animation

## Important behavior

- The cat should feel like it is actively painting the loading bar.
- The brush action should visually drive the fill progress.
- The loader should not feel childish or messy.
- It should be playful but still premium.
- The landing page should reveal smoothly after the loading completes.

## Transition requirement

At the end of the loading animation:
- brief finished state
- clean fade/transform/mask transition
- reveal the landing page underneath

Do not abruptly hide the loader.

## Preserve

- the cat + brush idea
- the loading bar concept
- the left-to-right painting motion
- premium DevHub feel

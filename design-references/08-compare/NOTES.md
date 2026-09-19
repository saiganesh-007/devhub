# DevHub Compare Page Reference

Use `compare-reference.png` as the PRIMARY visual/layout reference for DevHub's comparison experience.

## What to take from this reference

Use it for:
- the side-by-side comparison layout
- equal visual weight for both compared entities
- clear VS separation
- metric rows with aligned values
- tabs for different comparison categories
- language breakdown visualization
- feature comparison area
- repository information table
- strong spacing and hierarchy
- premium dark developer-tool visual language

## Important product rule

This is a comparison page, not a ranking page.

Do NOT:
- declare a winner
- assign an arbitrary score
- create a "best repository" label
- imply one developer/repository is objectively superior overall

Present factual differences only.

## DevHub adaptation

The page should support comparison of real DevHub entities using real GitHub/API data.

Possible repository comparison data:
- stars
- forks
- watchers
- open issues
- languages
- contributors
- last updated
- default branch
- license
- repository size
- releases
- topics
- activity-related data where available

Possible developer comparison data:
- public repositories
- followers / following
- top repositories
- total stars across tracked repositories
- language mix
- contribution/activity signals where available
- organizations / metadata where available

Do not invent unavailable metrics.

## AI summary / narrative area

If DevHub has an AI-generated or synthesized comparison summary:
- keep it factual
- base it only on real available comparison data
- do not call a winner
- do not fabricate conclusions
- clearly distinguish observed differences from interpretation

If the project does not have AI comparison functionality, do not fake it just because the reference contains an AI Summary card.

## Search / entity selection

Users should be able to:
- select the first entity
- select the second entity
- swap sides
- replace either entity
- add another comparison only if the actual product supports more than two

Reuse the DevHub premium search interaction language where appropriate.

## Theme requirement

Must support:
- Light mode
- Dark mode
- System mode

Do not build this as dark-only.

Charts, labels, borders, cards, and comparison indicators must remain readable in all themes.

## Responsive behavior

Desktop:
- preserve side-by-side comparison where space allows

Tablet/mobile:
- stack or transform the comparison intelligently
- keep labels aligned with the correct entity
- do not crush charts or tables into unreadable widths
- allow deliberate horizontal comparison only where it is genuinely useful

## Visual consistency

The finished comparison page must use the same:
- DevHub app shell
- typography
- spacing system
- buttons
- cards
- search style
- theme tokens
- chart language

as the rest of the application.

This image is a REFERENCE, not a literal template.
Do not hard-code the sample Next.js / Node.js values shown in the image.

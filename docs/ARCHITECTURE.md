# DevHub architecture

## Runtime flows

`Browser → Next.js App Router → REST route handlers → typed GitHub service → GitHub REST API`

The GitHub token is read only by the server service. Public GitHub responses use Next.js fetch revalidation; API errors are normalized into a stable `{ ok, error }` shape with rate-limit metadata.

`Browser / Server Components → Supabase Auth → PostgreSQL → Row Level Security`

Supabase SSR clients use cookie-backed sessions. Personalized reads and writes derive identity from the authenticated session; clients never submit a trusted `user_id`. RLS policies provide the final authorization boundary.

## Decisions

- Server Components own initial intelligence-page data fetching to avoid browser waterfalls.
- Client Components are limited to interactive search, comparison, and authentication.
- Analytics are pure deterministic functions tested independently.
- Comparisons expose factual metrics and never produce an opaque quality score.
- The UI uses one restrained dark theme to maximize polish and accessibility within the delivery window.

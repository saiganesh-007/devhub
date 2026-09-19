# DevHub

Developer intelligence for the open-source world. DevHub is a production-minded Next.js analytics product for researching GitHub developers, repositories, contributors, activity, and technology composition.

## Product highlights

- Live developer and repository search with debouncing, skeletons, and useful failure states
- Developer intelligence: reach, public work, aggregate stars/forks, top repositories, and Technology DNA
- Repository intelligence: languages by real byte counts, contributors, commits, licensing, and core metrics
- Factual developer and repository comparisons without opaque quality scores
- Supabase email/password authentication, persistent SSR sessions, favourites, recent-view schema, and dashboard
- Centralized typed GitHub client with caching and rate-limit-aware errors
- Responsive mobile navigation and data layouts with accessible focus and reduced-motion support

## Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Supabase/PostgreSQL, GitHub REST API, Zod, Lucide, clsx, and tailwind-merge.

## Quick start

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
GITHUB_TOKEN=github_pat_placeholder
```

`GITHUB_TOKEN` is server-only and never reaches browser JavaScript. The Supabase publishable key is safe for browser use because authorization is enforced by RLS. Never add a service-role key to a public variable. Existing deployments using `NEXT_PUBLIC_SUPABASE_ANON_KEY` remain supported as a fallback.

## Supabase setup

1. Create a Supabase project and copy its URL and publishable key.
2. Apply every SQL file in `supabase/migrations/` in filename order using the Supabase CLI or SQL editor.
3. Enable email authentication and configure the production Site URL / redirect URLs.
4. Add the environment variables and restart the development server.

The migration creates profiles, developer favourites, repository favourites, recent views, indexes, uniqueness constraints, an auth profile trigger, and owner-only RLS policies.

## Commands

```bash
npm run dev       # development server
npm run test      # analytics unit tests
npm run lint      # ESLint
npm run build     # production build
npm start         # serve production build
```

## Architecture

The browser talks to Next.js pages and REST route handlers. Route handlers validate inputs and call the server-only GitHub service, which normalizes remote failures and honors cache windows. Personalized data uses cookie-backed Supabase sessions and PostgreSQL RLS. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

Key directories:

```text
src/app/                 pages and REST endpoints
src/components/          shell, UI, search, auth, comparison
src/lib/github/          typed GitHub service and API errors
src/lib/supabase/        browser/server session clients
src/lib/analytics.ts     pure analytics calculations
supabase/migrations/     schema, indexes, trigger, RLS
docs/                    architecture decisions
```

## REST API

- `GET /api/github/users/search?q=`
- `GET /api/github/users/:username`
- `GET /api/github/repositories/search?q=`
- `GET /api/github/repositories/:owner/:repo`
- `GET|POST /api/favourites/developers`
- `GET|POST /api/favourites/repositories`

Successful responses use `{ "ok": true, "data": ... }`; failures use `{ "ok": false, "error": { "code", "message", "rateLimit"? } }`.

## Security and reliability

- GitHub credentials stay in the server-only service.
- Inputs are validated with Zod and path segments are encoded.
- GitHub 401, 403/rate-limit, 404, network, and unavailable states are normalized.
- User identity comes from the Supabase session, never a client-supplied user ID.
- Every personalized table has RLS plus user-scoped uniqueness/indexes.
- External content is rendered as plain text; DevHub does not inject remote HTML.

## Deployment

Deploy to a Next.js-compatible platform, add the three environment variables, apply the database migration, and configure the deployed URL in Supabase Auth. Run `npm run build` in CI before release.

## Competition checklist

- [x] Premium concise landing page
- [x] Authentication foundation and protected personalized dashboard
- [x] GitHub developer/repository search
- [x] Developer and repository intelligence
- [x] Contributors, activity, language analytics
- [x] Developer/repository comparison
- [x] Favourites persistence endpoints and RLS
- [x] Responsive and accessible interaction states
- [x] Tests, production build, architecture and setup docs

Screenshots can be captured from `/`, `/developer/torvalds`, `/repository/facebook/react`, and `/compare` after starting the app with a GitHub token.

## Supabase email OTP configuration

DevHub uses real Supabase Auth codes; it never generates or stores OTP values. In the Supabase dashboard open **Authentication → Email Templates → Confirm signup** and ensure the message body contains the token variable:

```html
<p>Your DevHub verification code is:</p>
<h2>{{ .Token }}</h2>
```

Do not rely only on `{{ .ConfirmationURL }}` because the `/verify-email` experience expects the user-visible numeric token. The UI accepts the 6–8 digit codes Supabase may deliver. Passwordless sign-in codes use the Magic Link template; include `{{ .Token }}` there as well. Add `http://localhost:3000/auth/callback` and the production equivalent to **Authentication → URL Configuration → Redirect URLs** for recovery links.

Authentication routes include `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, and `/auth/callback`. The Next.js proxy refreshes cookie sessions, protects `/dashboard`, `/favourites`, and `/settings`, and redirects authenticated users away from login and registration.


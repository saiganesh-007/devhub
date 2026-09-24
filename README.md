<div align="center">

<img src="./public/brand/devhub-logo.png" alt="DevHub" width="105" />

# DevHub

### Developer intelligence for the open-source world.

Search people. Explore repositories. Compare signals.  
Keep the GitHub research you care about in one clean workspace.

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-861F3D?style=for-the-badge&logo=vercel&logoColor=white)](https://devhub-flame-seven.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-171416?style=for-the-badge&logo=github&logoColor=white)](https://github.com/saiganesh-007/devhub)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](YOUR_LINKEDIN_URL)

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Production-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 👋 What is DevHub?

**DevHub** is a full-stack GitHub intelligence platform I built to make researching developers and open-source projects less scattered.

GitHub already has a huge amount of useful information, but it lives across profiles, repositories, contribution history, language stats, activity feeds and individual project pages.

DevHub brings the important signals together.

You can search a developer, inspect their public work, explore repositories, compare profiles, save useful finds and come back to them later from your own workspace.

> The goal isn't to invent a "developer score". DevHub shows the real signals and lets you make sense of them.

---

## 🚀 Try it live

### **[devhub-flame-seven.vercel.app](https://devhub-flame-seven.vercel.app)**

The production app is currently running with:

- GitHub REST API
- Supabase Auth
- PostgreSQL
- Supabase Storage
- Vercel

---

## ✨ What you can do

### 👨‍💻 Explore Developers

Search a GitHub username and get a much cleaner view of their public activity.

- Followers & following
- Public repositories
- Total repository stars
- Total forks
- Language distribution
- Recent GitHub activity
- Recently updated repositories
- Top repositories
- Developer profile details
- Save profiles for later

---

### 📦 Explore Repositories

Dig into public GitHub repositories without jumping through multiple GitHub tabs.

- Stars
- Forks
- Main language
- Language breakdown
- Contributors
- Recent commits
- Repository activity
- README information
- Releases
- License information
- Save repositories

---

### ⚖️ Compare

Compare:

```text
Developer ↔ Developer
Repository ↔ Repository
```

The comparison view uses actual GitHub signals instead of made-up ratings or hidden formulas.

---

### ❤️ Save what matters

Signed-in users can build their own research workspace.

You can save:

- Developers
- Repositories

Saved items stay connected to your Supabase account, so they remain there after refreshing or signing back in.

---

### 🔎 Search without the chaos

The global search supports both developers and repositories.

It includes:

- Autocomplete
- Keyboard navigation
- Search history
- Debounced API requests
- Request cancellation
- Loading states
- Empty states
- Friendly errors
- GitHub rate-limit handling

The search layer also reduces unnecessary GitHub API calls while the user is typing.

---

### 🖼️ Profile photo editor

I didn't want the profile picture setting to feel like a basic file uploader.

Users can:

- Upload JPG, PNG or WebP
- Drag the image into position
- Zoom in/out
- Preview the circular crop
- Save a 512 × 512 result
- Automatically convert it to WebP
- Store it in Supabase Storage

The cropped image is then used consistently across the DevHub workspace.

---

## 🧱 Tech Stack

| Area | Built With |
| --- | --- |
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Supabase Auth |
| Database | PostgreSQL |
| Storage | Supabase Storage |
| External Data | GitHub REST API |
| Validation | Zod |
| Icons | Lucide React |
| Hosting | Vercel |

---

## 🧠 How it works

```text
                         DEVHUB
                           │
                           ▼
                 ┌──────────────────┐
                 │  Next.js / React │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Next.js App/API  │
                 │ Route Handlers   │
                 └──────┬─────┬─────┘
                        │     │
              ┌─────────┘     └─────────┐
              ▼                         ▼
     ┌─────────────────┐       ┌─────────────────┐
     │ GitHub REST API │       │    Supabase     │
     │                 │       │                 │
     │ Developers      │       │ Auth            │
     │ Repositories    │       │ PostgreSQL      │
     │ Activity        │       │ RLS             │
     │ Contributors    │       │ Storage         │
     └─────────────────┘       └─────────────────┘
```

The GitHub token stays on the server.

The browser talks to DevHub's own API routes, and personalized user data is protected using Supabase **Row Level Security**.

For more detail:

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 📁 Project Structure

```text
devhub/
│
├── public/
│   └── brand/                    # Brand assets
│
├── src/
│   │
│   ├── app/
│   │   ├── api/                  # Server API routes
│   │   ├── dashboard/            # Personal dashboard
│   │   ├── developer/            # Developer profiles
│   │   ├── repository/           # Repository profiles
│   │   ├── search/               # Search
│   │   ├── compare/              # Comparison
│   │   ├── favourites/           # Saved items
│   │   └── settings/             # User settings
│   │
│   ├── components/               # Shared UI
│   │
│   ├── lib/
│   │   ├── github/               # GitHub service layer
│   │   └── supabase/             # Supabase clients
│   │
│   └── types/
│
├── supabase/
│   └── migrations/               # DB + storage migrations
│
├── docs/
├── package.json
└── README.md
```

---

## 🛠️ Run it locally

### 1. Clone DevHub

```bash
git clone https://github.com/saiganesh-007/devhub.git
cd devhub
```

### 2. Install packages

```bash
npm install
```

### 3. Create `.env.local`

On Windows:

```powershell
copy .env.example .env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GITHUB_TOKEN=your_github_personal_access_token
```

> ⚠️ Never commit `.env.local` or expose `GITHUB_TOKEN` in browser code.

### 4. Set up Supabase

Apply the migrations inside:

```text
supabase/migrations/
```

Then configure your authentication URLs from:

```text
Supabase Dashboard
→ Authentication
→ URL Configuration
```

### 5. Start DevHub

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## ⚙️ Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run lint` | Runs ESLint |
| `npm run test` | Runs tests |
| `npm run build` | Creates the production build |
| `npm start` | Runs the production build |

---

## 🔌 API Layer

The browser doesn't call GitHub directly.

DevHub uses its own server-side API layer.

### Developers

```http
GET /api/github/users/search?q=
GET /api/github/users/:username
```

### Repositories

```http
GET /api/github/repositories/search?q=
GET /api/github/repositories/:owner/:repo
```

### Saved Developers

```http
GET    /api/favourites/developers
POST   /api/favourites/developers
DELETE /api/favourites/developers/:username
```

### Saved Repositories

```http
GET    /api/favourites/repositories
POST   /api/favourites/repositories
DELETE /api/favourites/repositories/:id
```

A successful response looks like:

```json
{
  "ok": true,
  "data": {}
}
```

Errors use the same predictable structure:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Something went wrong."
  }
}
```

---

## 🔐 Authentication

Authentication is handled with **Supabase Auth**.

Current auth routes:

```text
/login
/register
/verify-email
/forgot-password
/reset-password
/auth/callback
```

Protected areas such as the dashboard, saved workspace and settings require an authenticated session.

---

## 🛡️ Security

A few things I specifically wanted to keep clean:

- GitHub tokens stay server-side
- User identity comes from the Supabase session
- Personalized tables use RLS
- Avatar uploads are scoped to the logged-in user
- API inputs are validated
- GitHub path values are encoded
- Secrets stay in environment variables
- Service-role keys are never exposed to the browser

---

## ⚡ Reliability

External APIs are never perfect, so DevHub handles the usual failure cases too.

```text
✓ GitHub primary rate limits
✓ GitHub secondary rate limits
✓ Request timeouts
✓ Invalid GitHub authentication
✓ Missing developers
✓ Missing repositories
✓ Network failures
✓ Cancelled/stale searches
✓ Loading states
✓ Empty states
```

Search requests are also debounced to avoid hammering GitHub while somebody is still typing.

---

## 🎨 Design

DevHub uses a **white + wine** visual system.

```text
Background    #FCFAFA
Text          #171416
Wine          #861F3D
Deep Wine     #4A1020
```

The UI is intentionally cleaner than a traditional analytics dashboard.

I focused on:

- readable data
- strong hierarchy
- low visual noise
- quick navigation
- responsive layouts
- keyboard accessibility
- useful interaction feedback

---

## 🌍 Deployment

DevHub is deployed on **Vercel**.

A push to:

```text
main
```

automatically creates a new production deployment.

Production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GITHUB_TOKEN=
```

### 🔗 Live

**https://devhub-flame-seven.vercel.app**

---

## 👨‍🚀 About the Developer

### Sai Ganesh M

Full Stack Developer · AI Developer

I enjoy building products where the UI, backend and actual product logic all connect instead of stopping at a static frontend.

DevHub was built as a full-stack project covering API integration, authentication, protected data, storage, search, analytics-style interfaces and production deployment.

<p>
  <a href="https://github.com/saiganesh-007">
    <img src="https://img.shields.io/badge/GitHub-saiganesh--007-171416?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="YOUR_LINKEDIN_URL">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
</p>

---

## 🔗 Links

| | |
| --- | --- |
| 🚀 **Live App** | [Launch DevHub](https://devhub-flame-seven.vercel.app) |
| 💻 **Source Code** | [GitHub Repository](https://github.com/saiganesh-007/devhub) |
| 🧠 **Architecture** | [Architecture Docs](docs/ARCHITECTURE.md) |
| 💼 **LinkedIn** | [Connect with Sai](https://www.linkedin.com/in/saiganesh00007/) |

---

<div align="center">

### Built to make GitHub research a little less messy. 🚀

<br />

[![Launch DevHub](https://img.shields.io/badge/OPEN_DEVHUB-861F3D?style=for-the-badge&logo=github&logoColor=white)](https://devhub-flame-seven.vercel.app)

<br /><br />

**Next.js · TypeScript · Supabase · GitHub API**

</div>

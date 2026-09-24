<div align="center">

<img src="./public/brand/devhub-logo.png" alt="DevHub" width="105" />

# DevHub

### Developer intelligence for the open-source world.

Search people. Explore repositories. Compare signals.  
Keep the GitHub research you care about in one clean workspace.

<br />

[![Live Demo](https://img.shields.io/badge/Live_Demo-861F3D?style=for-the-badge&logo=vercel&logoColor=white)](https://devhub-flame-seven.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-171416?style=for-the-badge&logo=github&logoColor=white)](https://github.com/saiganesh-007/devhub)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/saiganesh00007/)

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

The production app is running with:

- GitHub REST API
- Supabase Authentication
- PostgreSQL
- Supabase Storage
- Vercel

---

## ✨ What can you do?

### 👨‍💻 Explore Developers

Search a GitHub username and get a cleaner view of their public activity.

- Followers & following
- Public repositories
- Total repository stars
- Total forks
- Language distribution
- Recent public GitHub activity
- Recently updated repositories
- Top repositories
- Developer profile details
- Save developers for later

---

### 📦 Explore Repositories

Dig into public repositories without constantly switching between GitHub tabs.

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

You can save developers and repositories and come back to them later.

Saved data is connected to your Supabase account, so it stays available after refreshing or signing back in.

---

### 🔎 Search without the chaos

The global search supports both developers and repositories.

It includes:

- Developer autocomplete
- Repository autocomplete
- Keyboard navigation
- Search history
- Debounced API requests
- Stale-request cancellation
- Loading states
- Empty states
- Friendly errors
- GitHub rate-limit handling

The search layer also reduces unnecessary GitHub requests while somebody is still typing.

---

### 🖼️ Profile Photo Editor

I didn't want the account photo setting to feel like a basic file upload.

Users can:

- Upload JPG, PNG or WebP
- Drag the image into position
- Zoom in and out
- Preview the circular crop
- Save a 512 × 512 image
- Automatically convert the result to WebP
- Store it using Supabase Storage

The final cropped avatar is then used consistently throughout the DevHub workspace.

---

## 🧱 Tech Stack

| Area | Built With |
| --- | --- |
| Framework | Next.js 16 |
| Frontend | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Supabase Auth |
| Database | PostgreSQL |
| Storage | Supabase Storage |
| External Data | GitHub REST API |
| Validation | Zod |
| Icons | Lucide React |
| Deployment | Vercel |

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

The browser talks to DevHub's own API routes, while user-specific workspace data is protected using Supabase **Row Level Security**.

More details:

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 📁 Project Structure

```text
devhub/
│
├── public/
│   └── brand/                    # DevHub brand assets
│
├── src/
│   │
│   ├── app/
│   │   ├── api/                  # API route handlers
│   │   ├── dashboard/            # Personal dashboard
│   │   ├── developer/            # Developer profiles
│   │   ├── repository/           # Repository profiles
│   │   ├── search/               # Search experience
│   │   ├── compare/              # Comparison tools
│   │   ├── favourites/           # Saved workspace
│   │   └── settings/             # Account settings
│   │
│   ├── components/               # Shared UI components
│   │
│   ├── lib/
│   │   ├── github/               # GitHub service layer
│   │   └── supabase/             # Supabase clients
│   │
│   └── types/                    # TypeScript types
│
├── supabase/
│   └── migrations/               # Database + storage migrations
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

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

On Windows:

```powershell
copy .env.example .env.local
```

Add your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GITHUB_TOKEN=your_github_personal_access_token
```

> ⚠️ Never commit `.env.local` or expose `GITHUB_TOKEN` inside browser-side code.

### 4. Set up Supabase

Apply the migrations inside:

```text
supabase/migrations/
```

Then configure authentication URLs from:

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
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |

---

## 🔌 API Layer

The browser doesn't talk directly to GitHub.

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

Successful responses follow a predictable structure:

```json
{
  "ok": true,
  "data": {}
}
```

Errors follow:

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

Authentication is handled using **Supabase Auth**.

Current authentication routes:

```text
/login
/register
/verify-email
/forgot-password
/reset-password
/auth/callback
```

Protected parts of DevHub require a valid authenticated session.

That includes the dashboard, saved workspace and account settings.

---

## 🛡️ Security

A few things I specifically wanted to keep clean while building DevHub:

- GitHub tokens stay server-side
- User identity comes from the Supabase session
- Personalized tables use Row Level Security
- Avatar uploads are scoped to the signed-in user
- API inputs are validated
- GitHub path values are encoded
- Secrets stay inside environment variables
- Service-role keys are never exposed to the browser

---

## ⚡ Reliability

External APIs are never perfect, so DevHub handles the common failure cases too.

```text
✓ GitHub primary rate limits
✓ GitHub secondary rate limits
✓ Request timeouts
✓ Invalid GitHub authentication
✓ Missing developers
✓ Missing repositories
✓ Network failures
✓ Cancelled / stale searches
✓ Loading states
✓ Empty states
```

Search requests are debounced so the app doesn't hammer GitHub while somebody is still typing.

---

## 🎨 Design

DevHub uses a minimal **white + wine** visual system.

```text
Background     #FCFAFA
Text           #171416
Wine           #861F3D
Deep Wine      #4A1020
```

I wanted it to feel more like a focused developer tool than a generic analytics dashboard.

The interface focuses on:

- readable information
- strong hierarchy
- low visual noise
- quick navigation
- responsive layouts
- keyboard accessibility
- useful interaction feedback
- consistent developer and repository views

---

## 🌍 Deployment

DevHub is deployed on **Vercel**.

Every production push to:

```text
main
```

automatically creates a new deployment.

Required production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GITHUB_TOKEN=
```

### 🔗 Production

**[devhub-flame-seven.vercel.app](https://devhub-flame-seven.vercel.app)**

---

## 🧩 Current Flow

```text
Landing
   ↓
Authentication
   ↓
Dashboard
   ↓
Search
   ↓
Developer / Repository Intelligence
   ↓
Compare
   ↓
Save
   ↓
Personal Workspace
   ↓
Settings + Profile Customization
```

DevHub is currently deployed with live GitHub data and Supabase-backed user accounts.

---

## 👨‍🚀 About Me

### Sai Ganesh M

**Full Stack Developer · AI Developer**

I like building projects where the frontend, backend and actual product logic all work together instead of stopping at a static UI.

DevHub gave me a chance to work across API integration, authentication, databases, protected user data, storage, search, UI/UX and production deployment inside one product.

<p>
  <a href="https://github.com/saiganesh-007">
    <img src="https://img.shields.io/badge/GitHub-saiganesh--007-171416?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://www.linkedin.com/in/saiganesh00007/">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
</p>

---

## 🔗 Links

| | |
| --- | --- |
| 🚀 **Live App** | [Launch DevHub](https://devhub-flame-seven.vercel.app) |
| 💻 **Source Code** | [saiganesh-007/devhub](https://github.com/saiganesh-007/devhub) |
| 🧠 **Architecture** | [Architecture Docs](docs/ARCHITECTURE.md) |
| 💼 **LinkedIn** | [Connect with Sai](https://www.linkedin.com/in/saiganesh00007/) |
| 👨‍💻 **GitHub** | [@saiganesh-007](https://github.com/saiganesh-007) |

---

<div align="center">

### Built to make GitHub research a little less messy. 🚀

<br />

[![Launch DevHub](https://img.shields.io/badge/OPEN_DEVHUB-861F3D?style=for-the-badge&logo=github&logoColor=white)](https://devhub-flame-seven.vercel.app)

<br /><br />

**Next.js · TypeScript · Supabase · GitHub API**

<br />

Made by **Sai Ganesh M**

</div>

# AssetFlow — Frontend

A web application for tracking company assets, managing employees, and generating handover/return protocols.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Authentication](#authentication)
- [Workspace](#workspace)
- [API Integration](#api-integration)
- [Internationalization](#internationalization)
- [Styling](#styling)
- [TypeScript Types](#typescript-types)
- [Backend Endpoint Reference](#backend-endpoint-reference)
- [Security Notes](#security-notes)
- [Known Quirks](#known-quirks)
- [How To Extend](#how-to-extend)

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + PostCSS |
| HTTP | Native `fetch` via shared `apiRequest()` wrapper |
| State | React local state + custom hooks |
| Auth persistence | `sessionStorage` |
| i18n | Custom context provider — EN / BG |
| Linting | ESLint 9 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- AssetFlow backend running (default: `http://localhost:8080`)

### Install

```bash
cd client/asset-flow
npm install
```

### Development

```bash
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create or edit `.env` in `client/asset-flow/`:

```bash
# Used in the browser
NEXT_PUBLIC_API_URL=http://localhost:8080

# Server-side fallback (Next.js API routes)
API_URL=http://localhost:8080
```

---

## Project Structure

```
client/asset-flow/
├── app/
│   ├── lib/
│   │   ├── api.ts              # Central fetch wrapper (apiRequest, buildApiUrl, ApiError)
│   │   ├── session.ts          # Auth session (read / save / clear / subscribe)
│   │   ├── i18n.tsx            # Language context + EN/BG translations
│   │   └── types.ts            # Shared TypeScript DTOs
│   ├── components/
│   │   ├── Pages/User/
│   │   │   ├── AccountPage.tsx             # Workspace shell & layout
│   │   │   └── account/
│   │   │       ├── useAccountWorkspace.ts  # Main orchestration hook
│   │   │       ├── WorkspaceContext.tsx    # Workspace state context
│   │   │       ├── WorkspaceShell.tsx      # Sidebar + content layout
│   │   │       ├── shared.tsx              # Shared workspace UI components
│   │   │       ├── types.ts                # View-model types
│   │   │       ├── utils.ts                # Parsing & formatting helpers
│   │   │       ├── operations/             # API fetch/mutation logic by domain
│   │   │       │   ├── users.ts
│   │   │       │   ├── organizations.ts
│   │   │       │   ├── products.ts
│   │   │       │   ├── protocols.ts
│   │   │       │   └── shared.ts
│   │   │       └── sections/               # Feature sections rendered in workspace
│   │   │           ├── ProfileSection.tsx
│   │   │           ├── UsersSection.tsx
│   │   │           ├── OrganizationsSection.tsx
│   │   │           ├── ProductsSection.tsx
│   │   │           ├── AssignmentsSection.tsx
│   │   │           ├── ProtocolsSection.tsx
│   │   │           └── AiSection.tsx
│   │   └── shared/
│   │       ├── Navigation/Navigation.tsx   # Top nav bar
│   │       ├── Forms/Auth/
│   │       │   ├── LoginForm.tsx
│   │       │   └── RegisterForm.tsx
│   │       └── ui/                         # Primitive UI components
│   │           ├── Button.tsx
│   │           ├── Input.tsx
│   │           ├── Label.tsx
│   │           └── Textarea.tsx
│   ├── user/
│   │   ├── login/page.tsx        # /user/login
│   │   ├── register/page.tsx     # /user/register
│   │   └── account/page.tsx      # /user/account
│   ├── oauth/callback/page.tsx   # /oauth/callback
│   ├── layout.tsx                # Root layout (nav + global styles)
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles + animations
├── public/
├── .env
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Marketing / landing page |
| `/user/login` | Login form + Google OAuth entry |
| `/user/register` | Registration form + Google OAuth entry |
| `/oauth/callback` | OAuth code exchange handler |
| `/user/account` | Main workspace dashboard |

---

## Authentication

Authentication is fully browser-driven — no server-side sessions.

### Registration

1. User fills in name, email, password, role (`LEADER` or `EMPLOYEE`), and age.
2. For employees, the form pre-loads organizations by fetching `/auth/users` (no auth required), filtering leaders, and resolving each via `/org/leader/:leaderId`. Falls back to a numeric company ID input if discovery fails.
3. Submits to `POST /auth/register` → redirects to `/user/login`.

### Login

1. User submits email and password to `POST /auth/login`.
2. Backend returns `{ token, expiresIn, userId, role, issuedAt }`.
3. Session saved via `saveAuthSession()` → redirects to `/user/account`.

### Google OAuth

1. User clicks **Sign in with Google** → browser navigates to `/auth/oauth2/login`.
2. Google redirects back to `/oauth/callback?code=...`.
3. Frontend POSTs code to `/auth/oauth/exchange`, saves returned session, redirects to `/user/account`.

### Session Lifecycle (`app/lib/session.ts`)

- Stored in `sessionStorage` under key `auth` (cleared when the tab/browser closes).
- Malformed and expired sessions are deleted on read.
- Session changes dispatch the custom event `assetflow:auth-change`; the nav bar subscribes to this.
- Any `401` or `403` response from the API automatically clears the session before surfacing the error.

---

## Workspace

The workspace is the core of the application, rendered at `/user/account`.

### Bootstrap Sequence

```
1. Read session → redirect to /user/login if absent
2. Load in parallel:
     current user, all users, all products, all assignments, current assignments
3. Derive leader list from users
4. Resolve organizations (GET /org/leader/:id for each leader)
5. Build name-based selectors
6. Mark workspace ready
```

### State Management

No Redux, Zustand, or React Query. The main hook `useAccountWorkspace.ts` owns all workspace state:

- `feedbackByKey` — per-feature success/error banners
- `pendingByKey` — per-feature loading flags
- `runAction(key, fn, onSuccess?)` — standardizes async error handling, pending state, and feedback display

State is distributed to section components through `WorkspaceContext`.

### Name-First UI Strategy

The workspace resolves human-readable labels from pre-loaded data:

| Entity | Display label |
|---|---|
| User | `Full Name • email@example.com` |
| Organization | `Org Name • led by Leader Name` |
| Product | `Brand Model • AssetTag` |
| Assignment | `Employee Name → Asset Name` |

Forms fall back to numeric ID inputs only if the selector list cannot be built.

### Feature Sections

| Section | Capabilities |
|---|---|
| **Profile** | View/edit account, refresh workspace, sign out |
| **Users** | Browse all users, inspect details, delete accounts |
| **Organizations** | Create company, join user, promote leader, view inventory |
| **Products** | Create, update, delete, search by asset tag or type |
| **Assignments** | Create, update, delete, filter by employee or asset |
| **Protocols** | Generate handover / return protocol PDFs, view saved protocols |
| **AI** | Submit prompt, display AI-generated response and metadata |

#### Protocols

Protocols come in two types:

- `ASSET_ASSIGNMENT` — equipment handover
- `ASSET_RETURN` — equipment return

Generating a protocol creates a PDF on the backend and returns a URI to open it. The raw URI is not exposed in the UI; users open the file through a controlled action.

---

## API Integration

All network calls go through `app/lib/api.ts`:

```typescript
apiRequest<T>(path: string, options?: ApiRequestOptions): Promise<T>
buildApiUrl(path: string, searchParams?: Record<string, string>): string
getErrorMessage(error: unknown): string
```

`apiRequest()` automatically:

- Reads base URL from `NEXT_PUBLIC_API_URL`
- Attaches `Authorization: Bearer <token>` when a session exists
- Handles JSON and plain-text responses
- Parses error responses into `ApiError`
- Disables caching (`cache: "no-store"`)
- Clears session on `401` / `403`

---

## Internationalization

English (`en`) and Bulgarian (`bg`) are both supported.

- Implemented in `app/lib/i18n.tsx` via React context.
- Selected language persisted in `localStorage` under `assetflow-language`.
- Falls back to browser locale if nothing is saved.

```typescript
const { t, language, setLanguage } = useTranslations()

t("workspace.title")   // translated string
setLanguage("bg")      // switch language
```

The language switcher is in the top navigation bar.

---

## Styling

- **Tailwind CSS v4** utilities throughout.
- Global base styles in `app/globals.css`: color scheme, font stack (Avenir Next → Segoe UI → Helvetica Neue), `page-enter` animation, grid background pattern.
- Custom `brand` color scale (indigo-based) in `tailwind.config.ts` drives buttons, focus rings, and accent surfaces.

### Shared UI Primitives

| Component | Location |
|---|---|
| `Button` — `default`, `outline`, `secondary`, `ghost` variants | `shared/ui/Button.tsx` |
| `Input` — with error state | `shared/ui/Input.tsx` |
| `Label` | `shared/ui/Label.tsx` |
| `Textarea` — with error state | `shared/ui/Textarea.tsx` |

### Workspace UI Components (`shared.tsx`)

| Component | Purpose |
|---|---|
| `SectionCard` | Section container |
| `FeedbackMessage` | Success / error banner |
| `StatCard` | Summary stat display |
| `EmptyState` | No-data fallback |
| `SelectField` | Searchable dropdown |
| `FieldHint` | Inline help text |

---

## TypeScript Types

Core DTOs defined in `app/lib/types.ts`:

```typescript
type Role = "ADMIN" | "LEADER" | "EMPLOYEE"
type ProtocolType = "ASSET_ASSIGNMENT" | "ASSET_RETURN"

type AuthSession = {
  token: string
  expiresIn: number
  userId: number
  role: Role | string
  issuedAt?: number
}

type UserDto = {
  id?: number | null
  fullName: string
  email: string
  password?: string | null
  role: Role
  age: number | null
  organizationId: number | null
  assignmentIds?: number[] | null
}

type OrganizationDto = {
  id?: number | null
  organizationName: string
}

type ProductDto = {
  id?: number | null
  productType: string
  productBrand: string
  productModel: string
  assetTag: string
  organizationId: number | null
}

type AssignmentDto = {
  id?: number | null
  employeeId: number | null
  productId: number | null
  dateAssigned: string | null
  dateReturned: string | null
}

type ProtocolDto = {
  id?: number | null
  protocolUri: string
  employeeId: number | null
  organizationId: number | null
  content?: string | null
  type?: ProtocolType | string | null
}

type AiResponseDto = {
  model?: string | null
  created_at?: string | null
  response?: string | null
  done?: boolean | null
  total_duration?: number | null
  eval_count?: number | null
}
```

---

## Backend Endpoint Reference

### Auth

| Method | Path | Used by |
|---|---|---|
| `POST` | `/auth/register` | RegisterForm |
| `POST` | `/auth/login` | LoginForm |
| `GET` | `/auth/oauth2/login` | Google OAuth redirect |
| `POST` | `/auth/oauth/exchange` | OAuth callback |
| `GET` | `/auth/user/:userId` | Bootstrap, profile refresh |
| `PUT` | `/auth/user/edit/:userId` | Profile update |
| `GET` | `/auth/users` | Workspace bootstrap, user management, registration |
| `DELETE` | `/auth/user/delete/:userId` | User deletion |

### Organizations

| Method | Path |
|---|---|
| `GET` | `/org/leader/:leaderId` |
| `POST` | `/org/create/:leaderId` |
| `POST` | `/org/join/:userId/:organizationId` |
| `POST` | `/org/becomeLeader/:userId/:organizationId` |
| `GET` | `/org/inventory/:organizationId` |

### Products

| Method | Path |
|---|---|
| `GET` | `/product/all` |
| `POST` | `/product` |
| `POST` | `/product/add` |
| `GET` | `/product/:productId` |
| `PUT` | `/product/:productId` |
| `DELETE` | `/product/:productId` |
| `GET` | `/product/asset/:assetTag` |
| `GET` | `/product/search/type/:type` |

### Assignments

| Method | Path |
|---|---|
| `POST` | `/assignment/add` |
| `PUT` | `/assignment/update/:assignmentId` |
| `GET` | `/assignment/get/:assignmentId` |
| `GET` | `/assignment/all` |
| `GET` | `/assignment/user/:userId` |
| `GET` | `/assignment/product/:productId` |
| `GET` | `/assignment/current` |
| `DELETE` | `/assignment/delete/:assignmentId` |

### Protocols

| Method | Path |
|---|---|
| `GET` | `/protocol/:protocolId` |
| `POST` | `/protocol/create/:organizationId/user/:userId` |

### AI

| Method | Path |
|---|---|
| `POST` | `/ai/generate?prompt=...` |

---

## Security Notes

- Sessions stored in `sessionStorage` only — not persisted across browser restarts.
- Invalid or expired sessions auto-deleted on read.
- Any `401` / `403` response clears the session before the error surfaces.
- Workspace redirects to login when there is no active session.
- Raw protocol file URIs are not shown in the UI.
- AI thinking traces and internal metadata are not surfaced to users.

---

## Known Quirks

- `Role` in `types.ts` includes `"ADMIN"`, but the registration UI only offers `"LEADER"` and `"EMPLOYEE"`. Admin sessions can still arrive from the backend.
- `axios` is installed in `package.json` but not used — all HTTP goes through the native `fetch` wrapper.
- `Navigation/navigation.css` exists but is empty.
- Company discovery during registration depends on the `/auth/users` endpoint being reachable without auth.
- The workspace eagerly loads all data on mount — not optimized for very large datasets.

---

## How To Extend

### Add a new page

1. Create `app/<path>/page.tsx`.
2. Compose from shared UI primitives.
3. Add a navigation link if needed.

### Add a new backend call

1. Use `apiRequest()` from `app/lib/api.ts`.
2. Define or reuse a DTO in `app/lib/types.ts`.
3. If workspace-related, add the action to `useAccountWorkspace.ts` and expose loading/feedback via `pendingByKey` / `feedbackByKey`.

### Add a new workspace section

1. Create a file in `sections/`.
2. Accept `workspace: AccountWorkspaceState` as a prop.
3. Keep rendering logic inside the section; put fetch/mutation logic in `useAccountWorkspace.ts`.
4. Register the section in `utils.ts` (`workspaceSections`) and render it in `AccountPage.tsx`.

### Add a new form control

Prefer existing primitives (`Button`, `Input`, `Label`, `Textarea`, `SelectField`) before creating new ones.

# LearnSync - AI-Driven Personalized Learning Platform

## Architecture Overview

**Full-Stack Monorepo**: Express backend + React (Vite) frontend with shared TypeScript schemas
- `server/` - Express API with Drizzle ORM (PostgreSQL via Neon)
- `client/` - React SPA with Wouter routing, shadcn/ui components, TanStack Query
- `shared/` - Shared Zod schemas and TypeScript types between client/server

**Key Design Pattern**: Role-based access control with JWT authentication. Three roles: `student`, `teacher`, `admin`. All protected routes use `authenticateToken` middleware, role-specific routes add `authorizeRole()`.

## Database Schema (Drizzle ORM)

Located in `shared/schema.ts` using Drizzle's pgTable declarations:
- **Core entities**: users, courses, lessons, assessments, questions
- **Tracking**: studentProgress, assessmentSubmissions, enrollments
- **Gamification**: badges, userBadges (points/streaks stored on users)
- **Communication**: messages (teacher-student), chatHistory (AI chatbot)
- **Relations**: Cascade deletes via foreign keys (e.g., deleting course removes lessons/assessments)

**Migration workflow**: `npm run db:push` - uses drizzle-kit to sync schema to Neon PostgreSQL

## Authentication Flow

**JWT-based** (no sessions):
1. POST `/api/auth/signup` or `/api/auth/login` returns `{ user, token }`
2. Client stores token in localStorage via `AuthProvider` (`client/src/lib/auth-context.tsx`)
3. All API calls include token via Authorization header (handled by `apiRequest()` utility)
4. Server middleware `authenticateToken()` validates JWT, attaches `req.user` with `{ id, role }`

**Important**: Frontend uses `apiRequest()` from `client/src/lib/queryClient.ts` - NOT raw fetch. It handles JSON serialization and error throwing.

## AI Integration (Azure OpenAI)

**Configuration** in `server/routes.ts`:
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT ? 
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}` : undefined,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: { "api-key": process.env.OPENAI_API_KEY }
});
```

**Chatbot endpoint**: POST `/api/chatbot` (student-only) maintains conversation history in `chatHistory` table. System prompt: "You are a helpful AI tutor."

**AI Feedback**: Assessment submissions generate `aiFeedback`, `weakAreas[]`, `recommendations[]` fields - integration points for future AI-driven adaptive learning paths.

## Frontend Patterns

**Routing**: Wouter (not React Router) - use `<Route path="">` and `useLocation()` hook
**State**: TanStack Query for server state - queries use URL as queryKey (e.g., `["/api/courses"]`)
**Styling**: Tailwind 4 + shadcn/ui components. Design guidelines in `design_guidelines.md` specify Material Design with Inter/Poppins fonts
**Protected Routes**: `ProtectedRoute` component checks `isAuthenticated` and `requiredRole` before rendering

**Component Structure**:
- `pages/` - Route components (landing, dashboards, course views)
- `components/ui/` - shadcn primitives (button, card, dialog, etc.)
- `components/` - App-specific (app-sidebar, chatbot-fab, theme-toggle)

## API Conventions

**All routes** prefixed with `/api/`
**Response pattern**: Return JSON directly, errors handled by Express error middleware
**Authorization layers**:
1. `authenticateToken` - requires valid JWT
2. `authorizeRole(...roles)` - checks req.user.role matches

**Example protected endpoint**:
```typescript
app.get("/api/student/stats", authenticateToken, authorizeRole("student"), async (req, res, next) => {
  // req.user.id and req.user.role available here
});
```

## Storage Layer Abstraction

`server/storage.ts` exports `storage` object implementing `IStorage` interface - all DB queries go through this layer. Never import `db` directly in routes.

**Pattern**: Each entity has CRUD methods like `getCourseById()`, `createCourse()`, `updateCourse()`. Complex queries (leaderboard, teacher stats) get dedicated methods.

## Development Workflow

**Start dev server**: `npm run dev` - runs Express with Vite dev server integration
**Database changes**: 
1. Edit `shared/schema.ts`
2. Run `npm run db:push` to sync to PostgreSQL
3. No manual migrations - Drizzle handles schema diffing

**Environment vars required**:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `OPENAI_API_KEY` - Azure OpenAI key
- `AZURE_OPENAI_ENDPOINT` - Full Azure endpoint URL
- `AZURE_OPENAI_DEPLOYMENT` - Deployment name (e.g., "gpt-4.1")
- `SESSION_SECRET` - JWT signing secret

## Path Aliases

**Vite config** (`vite.config.ts`) defines:
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

Use these in imports - never relative paths across boundaries.

## Common Gotchas

1. **Token in headers**: Frontend must include `Authorization: Bearer <token>` - `apiRequest()` does NOT auto-attach it. Use `useAuth()` hook to access token.
2. **Cascade deletes**: Deleting a course auto-removes lessons, assessments, progress. No need for manual cleanup.
3. **JSONB types**: Use `.$type<T>()` in schema for type-safe JSONB columns (e.g., `options.$type<string[]>()`)
4. **Role redirects**: `ProtectedRoute` sends wrong role to `/dashboard`, not back to login
5. **Query keys**: TanStack Query uses URL strings as keys - invalidate with `queryClient.invalidateQueries(["/api/..."])`

## Project-Specific Notes

- **No offline mode** - all features require internet (Azure OpenAI, Neon DB)
- **Gamification**: Points/streaks on users table, separate badges system for achievements
- **Assessments**: Store `answers` as index array (e.g., `[0, 2, 1]` for selected options), `correctAnswer` is index in options array
- **Progress tracking**: Separate records per lesson per student in `studentProgress` table
- **UI theme**: Dark/light mode via `next-themes` with system preference detection

## Quick Reference

**Create new API endpoint**: Add to `server/routes.ts` → use storage layer → add client query hook
**Add database table**: Edit `shared/schema.ts` → create insertSchema → run `npm run db:push` → add storage methods
**New page**: Create in `client/src/pages/` → add route in `App.tsx` → wrap with `ProtectedRoute` if needed
**UI component**: Check `client/src/components/ui/` first - likely already exists from shadcn

# LP Platform — Internal Landing Page Builder

A production-minded internal platform for media buyers to create, edit, and publish landing pages using a visual block editor and AI-assisted editing.

---

## Architecture

### Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR for published pages, great DX |
| Styling | Tailwind CSS + Radix UI primitives | Fast, accessible, no CSS-in-JS overhead |
| State | Zustand (editor) + TanStack Query (server) | Zustand is simple for complex local state; RQ handles cache/mutations |
| Drag & Drop | @dnd-kit/sortable | Modern, accessible, works without portals |
| Backend | Express + TypeScript | Familiar, fast, easy to extend |
| ORM | Prisma + PostgreSQL | Type-safe queries, great migration story |
| AI | Anthropic API (`claude-opus-4-6`) | Best instruction-following for structured output |
| Monorepo | pnpm workspaces + Turborepo | Fast installs, shared types package |

### Key Design Decisions

**Page Schema is JSON, not HTML.** Every page is stored as a structured `PageSchema` object:
```
{ schemaVersion: 1, blocks: Block[], settings: PageSettings, meta: PageMeta }
```
Each `Block` is a typed discriminated union. The renderer converts this to React components. The AI can only emit structured `AiOperation` objects — never raw HTML or JSX.

**AI is sandboxed.** The Anthropic API returns `AiOperation[]` validated with Zod server-side before any mutations are applied. The AI cannot write code, only mutate the page schema through a fixed set of operations.

**Versions are auto-snapshotted.** Every save creates a `PageVersion` record. The last 50 versions are kept. Restore is one API call.

---

## Project Structure

```
landingpage-platform/
├── packages/
│   └── shared/          # Shared TypeScript types + Zod schemas
├── apps/
│   ├── api/             # Express backend
│   │   ├── prisma/      # Schema + seed
│   │   └── src/
│   │       ├── config/
│   │       ├── middleware/
│   │       ├── routes/
│   │       └── services/  # AI, import, publish, pages
│   └── web/             # Next.js frontend
│       └── src/
│           ├── app/       # Routes (dashboard, editor, published pages)
│           ├── components/
│           │   ├── editor/   # EditorShell, Canvas, BlockItem, AI prompt bar
│           │   ├── blocks/   # Inspector field editors per block type
│           │   └── renderer/ # Block renderers (used in editor + published pages)
│           ├── hooks/     # React Query hooks
│           └── store/     # Zustand stores
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

### 1. Install dependencies

```bash
cd landingpage-platform
pnpm install
```

### 2. Set up environment variables

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — set DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY

# Web
cp apps/web/.env.local.example apps/web/.env.local
# NEXT_PUBLIC_API_URL defaults to http://localhost:3001/api/v1
```

**Minimum required API env vars:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lp_platform"
JWT_SECRET="at-least-32-chars-random-string"
ANTHROPIC_API_KEY="sk-ant-..."   # Set to "mock" to use mock AI responses
PORT=3001
```

### 3. Set up the database

```bash
# Create the database (if it doesn't exist)
createdb lp_platform

# Run migrations
pnpm db:migrate

# Seed with demo data
pnpm db:seed
```

### 4. Start development servers

```bash
# Start both API and web in parallel
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Prisma Studio: `pnpm db:studio`

---

## Demo Accounts

After seeding, these accounts are available:

| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123! | Admin |
| marketer@example.com | marketer123! | Marketer |
| viewer@example.com | viewer123! | Viewer |

Two sample pages are seeded:
1. **Burn Fat Fast** — weight loss offer with hero, questionnaire, testimonials, FAQ, CTA, compliance
2. **ProjectFlow Trial** — SaaS page with comparison table, text+image, form

---

## Testing Key Flows

### Test the Editor

1. Log in as marketer
2. Open either seeded page from the dashboard
3. Click any block to select it — properties appear in the right panel
4. Drag blocks using the grip handle to reorder
5. Click "Add" in the left sidebar to add a new block

### Test the AI Prompt Bar

The AI prompt bar is at the bottom of the editor canvas.

**With a real Anthropic key:**
- Type any natural language request
- Example: `"Add a 3-question quiz about customer goals after the hero section"`
- The system sends the current page schema + prompt to Claude
- Claude returns structured `AiOperation[]` — validated server-side
- Operations are applied to the editor

**Without a key (mock mode — set `ANTHROPIC_API_KEY=mock`):**
- Keywords trigger mock responses:
  - `faq` or `accordion` → adds FAQ block
  - `quiz` or `questionnaire` → adds questionnaire block
  - `testimonial` → adds testimonial block
  - `cta` → adds CTA block
  - Anything else → updates hero subheadline

### Test the Import Flow

1. From the dashboard, click "Import URL"
2. Enter any public URL (e.g. `https://stripe.com/payments`)
3. The system fetches the HTML, extracts structure with cheerio, maps it to blocks
4. You're redirected to the editor with the imported page

**Note:** Import is best-effort. Complex CSS-heavy pages may produce simple results.
Only import pages you are authorized to copy.

### Test Publishing

1. Open a page in the editor
2. Click "Publish" in the top toolbar
3. The page becomes available at `http://localhost:3000/p/{slug}`
4. The API renders it server-side from the stored JSON schema

### Test Version History

1. Make several edits to a page
2. Click "History" in the toolbar
3. Previous versions are listed
4. Click "Restore" on any version to roll back

---

## API Routes

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/pages              ?search=&status=&campaign=&page=&limit=
POST   /api/v1/pages
GET    /api/v1/pages/:id
PATCH  /api/v1/pages/:id
DELETE /api/v1/pages/:id          (archives)
POST   /api/v1/pages/:id/duplicate
GET    /api/v1/pages/:id/versions
POST   /api/v1/pages/:id/versions/:versionId/restore
POST   /api/v1/pages/:id/publish
POST   /api/v1/pages/:id/unpublish
GET    /api/v1/pages/:id/publishes

POST   /api/v1/ai/prompt
POST   /api/v1/ai/prompt/:promptLogId/applied
GET    /api/v1/ai/history/:pageId

POST   /api/v1/import/url
GET    /api/v1/import/job/:jobId

GET    /api/v1/templates
POST   /api/v1/templates          (admin only)

GET    /api/v1/public/pages/:slug  (no auth — for published page rendering)
```

---

## Adding New Block Types

1. **Add the TypeScript type** in `packages/shared/src/types/blocks/<name>.ts`
2. **Export it** from `packages/shared/src/types/block.ts` — add to `Block` union and `BlockPropsMap`
3. **Add Zod schema** in `packages/shared/src/schemas/blocks/`
4. **Add to the discriminated union** in `packages/shared/src/schemas/block.ts`
5. **Add metadata** (label, icon, defaultProps, category) in `packages/shared/src/constants/blocks.ts`
6. **Add renderer** in `apps/web/src/components/renderer/`
7. **Add inspector fields** in `apps/web/src/components/blocks/`
8. **Register in `BlockRenderer`** and `BlockInspector`

The AI service automatically picks up new block types from `BLOCK_META` in its system prompt.

---

## AI Architecture Notes

- **System prompt is cached** — the constant `SYSTEM_PROMPT` in `aiService.ts` never changes per-request and can benefit from Anthropic's prompt caching (attach `cache_control: { type: "ephemeral" }` to the system message in production).
- **Context truncation** — for pages with many blocks, `buildSchemaContext()` sends a compact representation (block ID, type, summary) rather than the full schema, keeping token usage manageable.
- **Validation** — all AI responses are validated with `aiOperationsResponseSchema` (Zod) before any state mutation. Invalid responses throw and are logged with an error flag.
- **Audit trail** — every prompt + response is stored in `PromptLog`. `applied: false` until the frontend confirms operations were applied.

---

## Import Pipeline Notes

The import pipeline (`apps/api/src/services/importService.ts`) uses `cheerio` to parse HTML and applies heuristics:

1. First `<h1>` → hero block
2. `<dt>/<dd>` pairs → FAQ items
3. `<blockquote>` elements → testimonials
4. `<h2>` + following paragraphs → text+image blocks
5. `<form>` inputs → form block

Results are clearly marked as `imported` (via the `campaign` field) and carry a warning that they are approximations. No styling from the source site is carried over — only semantic content.

**Legal note:** Users must only import pages they are authorized to copy.

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random chars)
- [ ] Run `pnpm db:migrate:prod` (not `migrate dev`)
- [ ] Add rate limiting to `/api/v1/ai/prompt` (expensive calls)
- [ ] Add `cache_control` to Anthropic system prompt for caching
- [ ] Set up S3/R2 for asset storage (replace local disk in `storage.service.ts`)
- [ ] Run Next.js behind a CDN for published pages
- [ ] Set `CORS_ORIGIN` to your frontend domain

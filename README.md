# Lumière Studio — Photographer Portfolio & CMS

A production-ready, full-stack photographer portfolio website with a complete admin CMS.
Built with **Next.js 15 (App Router)**, **TypeScript**, **Prisma + MongoDB**, **Auth.js v5**,
**Tailwind CSS**, and **Framer Motion**.

Everything on the public site is driven from the database and editable in the admin panel —
hero slider, portfolio, services, testimonials, clients, awards, packages, pages, journal, SEO,
and site settings. No hardcoded content.

---

## Highlights

- **Cinematic hero slider** — multi-slide, Ken Burns / crossfade transitions, fully CMS-managed.
- **Editorial portfolio system** — asymmetric layouts, per-project galleries with drag ordering,
  captions, alt text, focal points, multiple gallery layouts, lightbox, filtering, SEO per project.
- **Complete admin CMS** at `/admin` — role-based auth, media library with image optimization,
  drag-and-drop ordering, draft/publish workflow, activity log.
- **Contact inquiries** stored in DB with email notifications and an admin inbox.
- **Newsletter** with subscriber management + CSV export.
- **SEO** — dynamic metadata, Open Graph, sitemap.xml, robots.txt, JSON-LD.
- **Performance & a11y** — server components, `next/image` (AVIF/WebP, blur placeholders),
  reduced-motion support, semantic HTML, keyboard-accessible galleries.

---

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 15 (App Router, React 19, Server Actions)  |
| Language       | TypeScript (strict)                                |
| Styling        | Tailwind CSS + custom editorial design tokens      |
| Database       | MongoDB                                            |
| ORM            | Prisma                                             |
| Auth           | Auth.js v5 (credentials, bcrypt, JWT, RBAC)        |
| Validation     | Zod (client + server)                              |
| Animation      | Framer Motion                                      |
| Drag & drop    | dnd-kit                                            |
| Images         | sharp (optimization, blur placeholders)            |
| Email          | Provider abstraction (log / Resend)                |
| Storage        | Provider abstraction (local disk / S3-compatible)  |

---

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up a database

You need a MongoDB database. Pick the easiest option for you:

**Option A — Bundled local MongoDB (zero install, recommended for local dev):**
```bash
npm run db:server
```
This downloads and runs a real MongoDB as a single-node **replica set** on
`localhost:27017` (a replica set is required for Prisma transactions). Leave it running
in its own terminal. Data persists in `~/lumiere-mongodata`. Stop with Ctrl+C.
`DATABASE_URL` is already set to `mongodb://127.0.0.1:27017/lumiere?replicaSet=rs0`.

**Option B — MongoDB Atlas (free cloud, recommended for production):**
1. Create a free M0 cluster at https://www.mongodb.com/atlas
2. Add a database user and allow your IP (or 0.0.0.0/0), then copy the connection string.
3. Put it in `DATABASE_URL`, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/lumiere?retryWrites=true&w=majority`
   (Atlas clusters are replica sets, so transactions work out of the box.)

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:
- `DATABASE_URL` — your PostgreSQL connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the first super-admin login

### 4. Create the schema and seed sample content

```bash
npm run db:push     # sync collections & indexes
npm run db:seed     # seed realistic sample content + admin user
```

### 5. Run

If you used the bundled Postgres (Option A), keep `npm run db:server` running in one
terminal, then in a second terminal:

```bash
npm run dev
```

- Public site → http://localhost:3000
- Admin panel → http://localhost:3000/admin
  (log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` — default
  `admin@lumiere.studio` / `ChangeMe!2026`)

---

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                         |
| `npm run build`     | Production build (runs `prisma generate`)    |
| `npm run start`     | Start the production server                  |
| `npm run db:server` | Run the local MongoDB (dev)                  |
| `npm run db:push`   | Sync collections & indexes to the database   |
| `npm run db:seed`   | Seed sample content                          |
| `npm run db:studio` | Open Prisma Studio                           |
| `npm run db:reset`  | Drop & recreate the database (destructive)   |
| `npm run typecheck` | TypeScript check                             |
| `npm run lint`      | ESLint                                       |

---

## Project structure

```
prisma/
  schema.prisma          # data model
  seed.ts                # sample content + admin user
src/
  app/
    (public)/            # public website (route group)
    admin/
      login/             # sign-in (outside the shell)
      (dashboard)/       # protected admin CMS (route group)
    api/                 # auth, media upload, file serving, CSV export
    sitemap.ts, robots.ts
  components/
    ui/                  # design-system primitives
    public/              # public site components + homepage sections
    admin/               # admin shell, forms, media, per-entity modules
    shared/              # image, reveal, analytics
  config/                # navigation config
  lib/
    auth/                # Auth.js config, RBAC, password hashing
    actions/             # server actions (per entity)
    queries/             # cached data-access
    validation/          # Zod schemas
    storage/             # local + S3 providers
    media/               # upload + sharp processing
    email/               # provider abstraction + templates
    db.ts, env.ts, seo.ts, cache-tags.ts, rate-limit.ts, sanitize.ts, activity.ts
  middleware.ts          # admin route protection (edge)
```

---

## Configuration

### File storage
The upload pipeline optimises images with sharp (resize → WebP + blur placeholder),
then hands the file to the configured provider:

- `STORAGE_PROVIDER=local` (default) writes to `./storage`, served via `/api/files/...`.
- `STORAGE_PROVIDER=cloudinary` uploads to Cloudinary and serves from its CDN.
  Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  (from your Cloudinary dashboard), and optionally `CLOUDINARY_FOLDER`.
  Recommended for production — no extra infrastructure, global CDN, works on Vercel.
- `STORAGE_PROVIDER=s3` uses any S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, B2).
  Set `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`,
  `STORAGE_SECRET_KEY`, and optionally `STORAGE_PUBLIC_URL`.

Local disk is development-only (serverless filesystems are read-only) — use Cloudinary
or S3 in production.

### Email
- `EMAIL_PROVIDER=log` (default) prints emails to the server console.
- `EMAIL_PROVIDER=resend` sends via Resend — set `RESEND_API_KEY` and `EMAIL_FROM`.

### Analytics
Set a Google Analytics ID in **Admin → Settings** (or `NEXT_PUBLIC_GA_ID`). It only loads when set.

---

## Roles

| Role          | Access                                                       |
| ------------- | ------------------------------------------------------------ |
| `SUPER_ADMIN` | Everything, including users                                  |
| `ADMIN`       | Everything except cannot be locked out by editors            |
| `EDITOR`      | Content (no Settings, Users, Activity, SEO)                  |

---

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel.
2. Add environment variables from `.env.example` (use **MongoDB Atlas** for `DATABASE_URL`).
3. **Set `STORAGE_PROVIDER=cloudinary`** (or `s3`) and configure it — Vercel's filesystem
   is read-only, so the local storage provider is for development only.
4. Build command: `npm run build` (runs `prisma generate`). Output: default (`.next`).
5. Point `DATABASE_URL` at your Atlas cluster, then run once against it:
   `npm run db:push` (MongoDB has no migrations) and optionally `npm run db:seed`.

The public site reflects admin changes immediately via tag-based cache revalidation —
no rebuilds required.

---

## Security

- Passwords hashed with bcrypt (cost 12); JWT sessions.
- Server-side authorization on every mutating action (RBAC).
- Admin routes protected by middleware + per-page guards.
- Zod validation on client and server; rich text sanitized (DOMPurify).
- Rate limiting + honeypots on public forms.
- Secure HTTP headers; ORM-parameterized queries; upload type/size validation.

---

Sample images use [Lorem Picsum](https://picsum.photos) placeholders and are meant to be replaced
from the admin Media Library.
# cool_dood_rj

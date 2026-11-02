# Project audit — 2 November 2026

## Follow-up: journal save failure after deployment

The authenticated Vercel runtime logs showed `ERR_REQUIRE_ESM` on
`/admin/journal/new` at 15:34:50 on 2 November, with the same failure on `/`.
`isomorphic-dompurify` loaded jsdom, whose `html-encoding-sniffer` dependency tried
to require the ES module `@exodus/bytes/encoding-lite.js`. This was reproduced
locally with `node --no-experimental-require-module`.

- Replaced the production DOM sanitizer with `sanitize-html`, retaining the
  editorial HTML allowlist and blocking scripts, unsafe URL schemes and event
  handlers. New-tab links receive `noopener noreferrer`.
- Kept jsdom only as a development dependency for the HTTP test harness. Neither
  the homepage nor journal editor production file traces include the incompatible
  dependency chain.
- Journal saves now return recoverable feedback for duplicate slugs, missing
  covers/posts and unexpected persistence errors, with a reference for server logs.
  Admin forms show persistent error messages and prevent automatic input resets.
- `npm test`: 14 tests passed; type checking and lint passed.
- `node tests/admin-integration.mjs --production`: production build and 106 HTTP
  integration checks passed with CommonJS-to-ESM loading disabled in the server.
  Journal coverage includes create/edit, publishing with a cover and sanitized
  content, public rendering, duplicate slugs and deleted covers.

This follow-up is implemented locally and still requires a new deployment,
including `package.json` and `package-lock.json`. No production content was
created or modified. No database migration is needed. The initial audit below
records the earlier pass and its verification limits.

## Outcome and scope

Code changes are implemented locally. The live domain returned HTTP 200 and its
headers identify Vercel. No production deployment or production database writes
were performed. Existing changes to `package.json` and `scripts/create-admin.ts`
were preserved.

This audit reviewed the admin media workflow, shared admin controls, content forms,
permissions, public content rendering, storage paths, validation and build tooling.
It is not a certification that every production configuration or browser interaction
has been verified. The signed-in Chrome session could not be inspected because the
native browser-control tool repeatedly timed out.

## Fixed findings

| Area | Finding | Change |
| --- | --- | --- |
| Media picker | Dialog could be cut off and its actions become hard to reach | Viewport-bounded dialog, explicit shrinking scroll area, non-shrinking header/footer, focus trap and focus restoration |
| Media discovery | API returns 24 images, but both clients exposed only the first page | Previous/next controls, counts, stable ordering and validated/clamped page numbers |
| Gallery selection | Search/page changes lose selected media objects | Selection persists independently from the visible page |
| Image previews | Cropped thumbnails make it difficult to identify full photographs | Contained previews, filenames and visible selection indicators |
| Uploads | Every chosen file sent in one request; originals can exceed Vercel's body limit | Individual requests; raster images over 4 MB resized before transfer; 15 MB original limit; per-file progress/errors |
| Upload failures | HTML hosting errors, damaged files and network failures produced poor feedback | Shared response parser and actionable validation; retryable library loading |
| Upload input | Selecting the same file again could do nothing | Reset native file input after each choice |
| Metadata | Editing alt text reset captions to empty | Existing captions loaded, retained and updated; server validates lengths; related caches revalidated |
| Deletion | Storage removed before DB checks; referenced files could disappear | Check relations plus URL-only references before deleting DB record; remove storage afterwards |
| Upload cleanup | DB failure after successful storage write left untracked assets | Best-effort removal of failed upload assets |
| SVG | Unsanitized SVG passed through on the site's origin | Rasterise accepted SVG into WebP; sandbox local file responses |
| Storage | Local path prefix check admitted sibling directories; failed S3 PUT 404 treated as success | Enforce root path boundaries on read/write/delete; only DELETE may ignore 404 |
| Admin menus | Row actions clipped by table containers | Render menus in a viewport-positioned portal with outside-click/Escape handling |
| Mobile admin | Portfolio spans created implicit columns; image controls relied on hover | Responsive column spans and touch-visible image controls |
| Ordering | Pointer-only drag controls; failed reorder requests could leave wrong visual order | Keyboard sensors, touch-safe handles and rollback/error feedback |
| Social links | Unchecking visibility did not hide a link | Explicit checkbox parsing and duplicate-platform validation |
| Content saving | Duplicate category/service/journal slugs caused uncaught errors | Field validation with clear duplicate-slug feedback |
| Gallery/features | Multi-step replacement could erase existing content when save failed | Nested atomic writes for portfolio galleries, service and package features |
| Public gallery | Saved aspect preferences ignored | Honour original, portrait, landscape, square and panoramic settings; alt-text fallback |
| Account access | Existing JWTs retained old role and disabled-account access | Revalidate current account state in server authentication; prevent stale-cookie login loop |
| User management | Admin could promote to or alter a super-admin account | Super-admin role guards and self-lockout protection |
| Authentication | Login endpoint lacked throttling; email case could prevent sign-in | In-process login rate limiting and normalized emails |
| CMS pages | Several pages ignored editable headings, descriptions, content and SEO | Connect services, packages, testimonials, contact, journal and portfolio to CMS fields |
| CMS sections | Added generic sections did not render | Render visible custom sections on supported pages, About, legal pages and home |
| CMS visibility | Hidden pages fell back to public content; hiding all home sections restored defaults | Respect explicit hidden-page state and distinguish empty configuration from all-hidden sections |
| Frontend cleanup | About page contained `Test message`; empty hero exposed admin instructions | Remove debug text; public-facing portfolio fallback; honour reduced-motion preference |
| Public forms | Invalid dates could reach DB; newsletter setting not enforced by action; duplicate subscription races | Validate dates, enforce disabled sign-ups, use subscriber upsert and check honeypots before parsing |
| Exports | CSV fields could execute spreadsheet formulas | Escape CSV and neutralise formula prefixes |
| Request validation | Invalid IDs, fractional/infinite page values and invalid portfolio status could reach Prisma | Validate IDs and query values before querying |
| Build tooling | `next lint` script unsupported by the installed Next.js version | ESLint flat config and working lint/test scripts |

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings or errors.
- `npm test`: 10 regression tests passed.
- `node tests/admin-integration.mjs --build`: 102 integration checks passed; production build passed.
- `git diff --check`: passed.

Integration coverage uses a disposable local MongoDB replica set, local files,
synthetic accounts and the log email provider. It exercises actual HTTP requests,
credential login, authenticated APIs, multipart form submissions, 30-media
pagination, search, upload/optimisation/file serving, metadata changes, deletion
protection, CSV exports, public/admin page rendering, create/edit for 12 admin
modules, settings/page saves, CMS frontend output, inquiry submission, role changes,
disabled accounts and privilege-escalation guards. It does not send real email or
upload test images to production Cloudinary.

## Operational notes and remaining verification

- Changes require deployment before they affect `https://www.rjadaun.com`.
- After deployment, visually check the picker at desktop and mobile sizes in the
  user's signed-in browser, including scrolling to the last row and confirming a
  selection. Browser rendering/layout was not verified by automation in this session.
- Confirm one real Cloudinary upload with a small image and a 5–15 MB photograph,
  then select images across multiple library pages. Production credentials, quotas,
  CDN delivery and hosting logs were not independently exercised.
- Large raster originals are web-optimised. SVG files above 4 MB are rejected with a
  specific message. GIF upload uses the first frame; this matches the existing
  image-only processing pipeline. Video, RAW and HEIC are not supported formats.
- In-process rate limiting is best effort across Vercel instances. A shared rate
  limiter remains appropriate if abuse resistance across instances is required.
- A storage-provider failure after DB deletion can leave an unreferenced asset;
  cleanup is logged. Database/storage operations cannot be one atomic transaction.
- Preview links for unpublished projects/articles still use public routes, which
  intentionally exclude drafts. A dedicated authenticated draft-preview workflow
  was not implemented.
- No database schema changes, destructive reset, seeding of live content, or storage
  migration are required for these fixes.

# Rjadaun public website design

## About-page direction — 4 November 2026

An artist profile, anchored by the photographer's own images. The current About
page still contains the original seed biography and a Picsum placeholder, so those
defaults must not masquerade as a personal portrait or a finished biography.

- Palette: gallery white `#fafafa`, white `#ffffff`, ink `#161616`, secondary grey
  `#636363`, pale silver `#e4e4e4`; photographs carry the colour.
- Type: existing Georgia for the opening title and biography lead; Inter for body,
  captions and actions. One expressive opening, restrained supporting typography.
- Layout: a left-aligned title and introduction paired with an uncropped photograph;
  a smaller, distinctly captioned portfolio image creates the second beat. A readable
  biography follows, then compact credentials and a direct invitation to enquire.

```text
About / name              [ large photograph ]
Behind the                [                  ]
photographs.              [                  ]
Introduction / location   [                  ]
Enquiry / work links      caption
[ smaller work image ]    Biography
caption                   Experience
Clients                   Recognition
                 Enquiry invitation
```

Plan critique: a standard portrait/text split followed by repeated homepage modules
would reproduce the generic page. Use a connected opening and biography composition,
with photographs and their captions in the reading flow; make credentials quieter.
Do not invent a personal history or generate a substitute photographer portrait.
Use a real published portfolio cover until a genuine About image is configured.
Preserve all custom CMS content, sections, visibility and metadata. Starter copy gets
a restrained presentation fallback without writing to the database.

About implementation review:

- Uses the existing published Beauty and Product & Lifestyle images with accurate
  portfolio captions. The configured About portrait takes priority when supplied;
  the original Picsum seed image is excluded. Seed client images render as client
  names instead of random photographs. Custom imagery and copy are retained.
- The existing admin image picker is labelled “Photographer portrait” for About,
  with guidance for full-image display and the portfolio fallback. No schema or
  upload changes are required.
- Dedicated CSS module isolates the responsive composition from other pages.
  Biography, experience, clients, recognition and enquiry use the same aligned grid.
- Verification: TypeScript, production build, 24 unit/component tests and 114 isolated
  production integration checks passed. Added checks verify custom About copy/SEO,
  portrait saving and removal with portfolio fallback. Lint has no errors; two existing
  warnings remain in the unrelated `hero-picture.tsx` component.
- Confirmed HTTP 200 and server-rendered real CMS content, correct portfolio image
  references and absence of starter instructions. Final browser visual review was
  deferred at the user's request to finish with code checks. No production content
  was edited and no deployment was made.

## Direction

A photographic contact sheet, with the scale and clarity of an exhibition catalogue.
The original photographs supply the colour and personality. The interface stays quiet.

- Palette: gallery white `#fafafa`, pure white `#ffffff`, black `#161616`, secondary grey `#636363`, silver `#e4e4e4`, focus blue `#375a70`.
- Typography: retain Inter for the navigation, captions and body; use a restrained classic Georgia display face for public titles instead of the current soft, decorative Fraunces treatment. Admin typography remains unchanged.
- Layout: consistent fluid outer margins (20–56px), 12–20px image gutters, 48–80px section spacing, compact page introductions. Left alignment connects titles, images and captions.
- Portfolio index: naturally proportioned covers grouped into justified rows, titles outside the images. Balanced two- and three-image rows on desktop; single generous images on phones.
- Project gallery: source aspect ratios determine row widths. CMS gallery layout still controls grouping; no forced cropping. Portraits share a row, wide photographs can stand alone. Mobile reads in the original image order.
- Hero: restored the original full-width, full-height photograph with overlaid copy at the user's request.
- Navigation: a compact serif wordmark, evenly spaced sans-serif links and an outlined Contact action. The header overlaps the homepage hero with white text, then becomes a light sticky bar on scroll; inner pages retain the light bar in normal flow. Mobile uses the existing native dialog menu.
- Interaction: images open a native modal lightbox with keyboard, swipe, focus restoration and visible navigation. Navigation and filters use small, clear state changes.

## Plan review

The existing warm palette, large centered serif statements, repeated eyebrows, offset cards,
curtain reveals and oversized section spacing already resemble common portfolio templates.
Replace those patterns with image-driven proportions and a neutral canvas. Avoid ornamental
numbering and repetitive reveal animation. Preserve configured text, media, links, order,
visibility, SEO and all backend actions. No new production dependencies.

## Initial audit

- Cover parallax overscales every photograph, cropping even before hover.
- Fixed portrait card frames obscure landscape/product compositions.
- Equal-column gallery rows leave uneven bottoms when source aspect ratios differ.
- Project cover, description and gallery each add large independent vertical gaps.
- The existing lightbox lacks dialog semantics, focus containment/restoration and touch navigation.
- Mobile menu lacks focus containment and Escape handling; desktop navigation starts too early for its width.
- Repeated section paddings reach 128–160px; inner page headings consume most of the first viewport.
- Reveal wrappers hide SSR content until hydration and do not actually honour reduced motion.

## Implementation and verification

- Unified public typography, neutral colours, navigation, footer, page introductions, service and package layouts, contact forms, journal and CMS content presentation.
- Source-ratio gallery rows preserve the image order and CMS grouping. Unique project covers appear once. Gallery and card photographs use contained images without zoom cropping.
- Native dialog viewers support keyboard navigation, touch swipes, visible controls, scroll locking and focus restoration. An interaction test caught and verified the fix for focus returning to a hidden close button.
- Responsive breakpoints adapt gallery columns, navigation, hero, packages, services and metadata. Adjacent white sections share one spacing interval.
- `npm test`: 19 passing checks, including layout order, mixed ratios, lightbox keyboard navigation, touch gestures, close/cancel, focus and scrolling.
- `npm run lint`: passed without warnings. Type checking and the production build passed.
- Production integration audit: 106 checks passed against an isolated disposable database, including public/admin routes, media upload, journal publishing, CMS editing and inquiry submission. No production records were modified.
- Desktop portfolio screenshot reviewed; row balancing and footer spacing refined from that result. Remaining mobile/tablet and full-page visual QA could not be completed: native browser controls timed out or returned inconsistent screenshots and accessibility state. Automated component tests do not verify rendered geometry or native dialog focus containment.
- Changes are local and have not been deployed. No dependencies, database models, API handlers or admin components changed in this redesign.

## Mobile hero and portfolio refinements — 4 November 2026

- Added an optional mobile portrait relation and independent focal position to each hero slide, with separate upload controls in the CMS. Responsive picture sources select portraits below 768px and preserve desktop fallback for existing slides. Kept the full-width hero; removed additional zoom cropping on phones.
- Reduced enquiries to four fields and unified local contact actions as “Enquire about a shoot.” Added named social links on the contact page and footer and an enquiry action after project galleries.
- Standardized public title, section and card type scales around Georgia headings and Inter body/UI text. Reduced hero label tracking and CTA capitalization; shortened authored defaults without overwriting CMS copy.
- Preserved natural gallery ratios and image order; normalized mobile gaps, made project titles more prominent, added keyboard focus outlines and project context in the fullscreen viewer, and corrected single-project image sizing.
- Verification: TypeScript, 24 tests and the production build passed. All 112 isolated production integration checks passed, including portrait upload/save/reload, missing-image feedback, removal/fallback, legacy documents, referenced-media protection and the four-field enquiry submission.
- Visual review with existing content was blocked by a DNS/network error connecting to the configured database. No production data was changed, no portraits were added to real slides, and these changes have not been deployed.

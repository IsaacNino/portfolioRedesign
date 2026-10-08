# Isaac Nino — portfolio

A static HTML/CSS/JavaScript portfolio. This motion experiment lives on
`codex/portfolio-motion-experiment`, based on `codex/portfolio-redesign`.
It adds opposing project rows, a rotating contact invitation, a capabilities
banner, and a light animated atmosphere. Production deployment requires an
explicit request; this branch is for review. The agreed direction is recorded
in [EXPERIMENT_BRIEF.md](EXPERIMENT_BRIEF.md).

## Run locally

From the repository root:

```sh
python3 -m http.server 5173
```

Open port 5173 in your browser. Use an HTTP server rather than opening
`index.html` directly: the showcase reads a JSON content file.
Clone or download the **whole repository branch**, keeping its folders intact.
Downloading only `index.html` leaves out `styles.css`, `showcase.css`, the
JavaScript, images, and project data, so it will appear largely unstyled.
There is no application build step. Tailwind's CDN, Lucide, and Google Fonts
remain external dependencies inherited from the original site.

## Add, remove, or reorder a project

All project content, including the existing detail stories, lives in
[`data/projects.json`](data/projects.json). The order of the array is the display
order: the first half goes in the top row, and the remainder in the bottom row.
Neither `index.html` nor the rendering code needs editing for content changes.

1. Put an authentic project capture in `assets/projects/`. A WebP around
   1600 × 1000 pixels is a useful starting point. Optimize the file before adding it.
   Images are contained within a stable frame rather than distorted or cropped;
   crop the source image deliberately if you need to emphasize a particular detail.
2. Copy an existing record in `data/projects.json`, give it a unique `id`, and
   update the fields below. Keep summaries to roughly 15–30 words when possible.
3. Move the record to the desired position, or delete it to remove the project.
   Reload the local site and check the card on a narrow phone and a desktop.

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | Yes | Unique, stable project identifier. |
| `title` | Yes | Full project title; long titles wrap without truncation. |
| `summary` | Yes | Short explanation of what the project does. |
| `image` | Yes | Image URL relative to the site root page, e.g. `./assets/projects/my-project.webp`. |
| `imageAlt` | Yes | A concise description of what the image actually shows. |
| `category` | Yes | A short category such as “Generative interaction”. |
| `tags` | No | Array of short text tags; omit or use `[]` when not needed. |
| `caseStudyUrl` | No | Existing case-study page or external URL. Adds “Explore project”. |
| `liveUrl` | No | Working project URL. Adds “Visit live site”. |
| `details` | No | Optional text fields: `role`, `status`, `focus`, `tools`, `problem`, `approach`, `outcome`. When no `caseStudyUrl` is supplied, these power the project dialog. |

Only supply links that exist; omit optional links rather than using `#`.
With no links or details, the project remains an informative card without empty
buttons. Links use ordinary browser navigation, including the option to open in
another tab. All displayed text is inserted as text, not HTML.

The current project images are **clearly labeled, uniformly neutral placeholders**.
All tiles use the same charcoal surface; project imagery supplies the color.
Replace them
with genuine screenshots or output from each project before publication. No
project footage or generated product screenshots are implied by the prototype.

## Interaction and responsive behavior

- The top row drifts left and the bottom row right at 16 pixels per second.
  Pointer interaction pauses both. Drag, swipe, wheel, and arrow navigation
  reset a five-second idle delay, then drift eases back in over 800 milliseconds.
- Native touch scrolling preserves vertical page scrolling and pinch zoom.
  Mouse users can drag; each row also has previous/next buttons.
- Keyboard focus and open dialogs keep the gallery still. Focus a project list
  and use Left/Right or Home/End; Tab reaches the original project actions.
  Repeated visual copies are hidden from assistive technology and tab order.
- The Motion on/off toggle is persistent for the current page visit. Explicit
  pause never times out. Reduced-motion preferences disable automatic movement
  and visual loop copies, while retaining manual browsing.
- The contact card cycles Talk, Plan, Think, Build every 3.6 seconds; all words
  use the same contact link and accessible name. Hover or focus pauses the words.
- The background uses 3.5% grain opacity and half-strength ambient light, matching
  the approved reduction. Hidden tabs suspend motion and offscreen rows stop.
- Titles and actions stay on the compact cards; summaries and project stories
  remain in the detail dialog. Real images replace the neutral placeholders.
- A row with one project stays still. An empty array hides the showcase. New
  records require no layout edits; broken images fall back to the neutral
  placeholder, and failed content requests offer retry.

## Files

- `index.html`: page structure and supporting sections.
- `styles.css`: original supporting-section styles.
- `showcase.css`: Direction B foundation, carousel, dialogs, and responsive rules.
- `portfolio-motion.css`: the experimental atmosphere and compact gallery styling.
- `motion.js`: shared motion preferences, contact invitation, and background grain.
- `script.js`: mobile navigation and the existing contact form.
- `projects.js`: content loading, safe rendering, carousel controls, and project details.
- `data/projects.json`: the single project-content source.

## Verify changes

Application use needs no npm packages. Browser regression tests use Playwright:

```sh
npm ci
npx playwright install chromium
npm test
```

The tests use `/usr/bin/chromium` when available; set `CHROMIUM_PATH` to choose
another executable. Otherwise they use Playwright's installed Chromium. The test
runner starts and stops its own local server. In HTTPS proxy environments, its
asset helper uses `curl` with TLS verification to retrieve the existing CDN
assets when the browser does not share the proxy's certificate trust store.

The suite covers 320–1920 px widths and landscape, enlarged text, long content,
0/1/2/3/8 projects, uniform surfaces, image and content-load failures, opposing
drift, the idle delay, explicit pause, keyboard navigation, dialog focus,
mobile-menu dismissal, reduced motion, native touch swipes, and vertical
scrolling. Contact messages are not
sent by these tests. This is browser emulation; final review on actual iOS and
Android devices remains useful, especially after real media is added.

# Isaac Nino — portfolio

A static HTML/CSS/JavaScript portfolio. The Direction B prototype lives on
`codex/portfolio-redesign`: a dark, cinematic presentation with a responsive,
user-controlled project showcase. Production deployment requires an explicit
request; this branch is for review.

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
order. Neither `index.html` nor the rendering code needs editing for content changes.

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

The current project images are **clearly labeled placeholders**. Replace them
with genuine screenshots or output from each project before publication. No
project footage or generated product screenshots are implied by the prototype.

## Interaction and responsive behavior

- Native horizontal scrolling supports touch and trackpads without intercepting
  normal vertical scrolling or pinch zoom. There is no automatic rotation.
- Previous/next buttons and a visible portion of the following card indicate
  more work. Controls disable at the ends and disappear when unnecessary.
- Focus the project list and use Left/Right or Home/End; Tab reaches normal
  project links and buttons. Focused cards scroll into view.
- Reduced-motion preferences use immediate carousel navigation. Native dialogs
  contain focus, close with Escape, and restore focus on dismissal.
- Card content controls its height. One project fills the available width with
  no navigation; an empty array hides the showcase. Additional records need no
  layout changes. Failed image loads show the labeled fallback. A failed content
  request offers retry instead of leaving a blank section.

## Files

- `index.html`: page structure and supporting sections.
- `styles.css`: original supporting-section styles.
- `showcase.css`: Direction B foundation, carousel, dialogs, and responsive rules.
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

Coverage includes 320–1920 px widths and landscape, enlarged text, next-card
visibility, long content, 0/1/2/8 projects, optional fields, image and content-load
failures, keyboard navigation, dialog focus, mobile-menu dismissal, reduced
motion, native touch swipes, and vertical scrolling. Contact messages are not
sent by these tests. This is browser emulation; final review on actual iOS and
Android devices remains useful, especially after real media is added.

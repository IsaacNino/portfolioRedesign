# Isaac Nino — Imagination, backed by expertise.

An original cyberpunk portfolio in graphite and icy blue with restrained red accents, IBM Plex Mono typography, an angular portrait composition, a selectable signal switchboard, scroll-driven project imagery, and case studies powered by one content file. Built with HTML, CSS, and JavaScript; no runtime packages.

## Preview and publish

Use Node.js 20 or later. There is nothing to install.

```sh
npm run dev
npm test
npm run build
npm run preview
```

The local preview is at `http://127.0.0.1:5177`. The production output is `dist/`. For Vercel, use **Other**, build command `npm run build`, and output directory `dist`. Any ordinary static host works. Use an HTTP server rather than opening the HTML file directly, since projects load from JSON.

## Add or edit work

Edit `content/projects.json`. Its array order controls the portfolio order. Titles, counts, filters, the moving hero backdrop, project stories, showcase images, and case studies are generated from these records.

1. Duplicate an existing project and give it a unique lowercase `id`.
2. Update the title, category, summary, tags, role, focus, status, and case-study text.
3. Add a screenshot in `assets/images/projects/`, then set `image.src` and meaningful `image.alt` text. A 1280 × 900 screenshot suits the preview frame.
4. Set `image.fit` to `contain` for portrait media or artwork that should remain uncropped. Add an optional `credit` for agency and collaboration context, separate from your role.
5. Optionally add a `video` with `src` pointing to an MP4 in `assets/videos/` and descriptive `alt` text. Keep `image` as its still poster. Original project films play only while visible and respect the motion preference; each also has its own play/pause control.
6. Add HTTPS project links, or use `"links": []` for work without a public destination.
7. Run `npm run check` and preview before publishing.

Example (replace the illustrative copy with real project details):

```json
{
  "id": "new-project",
  "title": "New project",
  "category": "Interactive experiences",
  "summary": "A short description of the work.",
  "tags": ["JavaScript", "Interaction design"],
  "image": {
    "src": "./assets/images/projects/new-project.jpg",
    "alt": "Describe the interface shown in the screenshot."
  },
  "role": "Your role",
  "focus": "The area of work",
  "status": "Prototype",
  "problem": "What needed to change?",
  "approach": "What did you design and build?",
  "outcome": "What happened? Use verified results.",
  "links": []
}
```

Remove `image` if no screenshot is ready; a simple typographic placeholder appears automatically. Categories create their own filters; `All work` is reserved. Keep IDs stable after sharing case-study URLs such as `/#project/intrust`. The optional legacy `featured` and `accent` fields remain accepted for compatibility but do not control this layout.

The JSON schema provides editor guidance. Runtime and build validation reject missing fields, duplicate IDs, unsafe URLs, and missing local images.

To edit the switchboard, update `content/practice-data.js`. Keep each `projectId` matched to a project record, and keep layer IDs aligned with the corresponding SVG groups in `content/discipline-visuals.js`. Adding portfolio work does not require a new switchboard channel.

## Where things live

- `index.html`: biography, contact copy, metadata, portrait, résumé, and discipline controls.
- `styles.css`: palette, layout, responsive styling, and transitions.
- `script.js`: scroll choreography, switchboard selection, filters, dialogs, and contact handling.
- `assets/boot.js`: independent loading sequence, readiness checks, skip behavior, and fail-open timeout.
- `content/practice-data.js`: switchboard layer titles, explanations, detail rows, tools, and related project IDs. Each practice has four editable layers.
- `content/project-visuals.js`: image/video renderer and automatic placeholder.
- `content/discipline-visuals.js`: original SVG practice maps for the four switchboard channels.
- `content/project-media.js`: lazy video loading, visibility, motion preferences, and playback controls.
- `content/brand-data.js`: selected brand logos, alt text, and display treatment.
- `assets/images/brands/sources.json`: official artwork sources and provenance.
- `assets/videos/`: optimized original project loops.
- The six “Working across” capability tags are editable in `index.html`.
- `assets/images/projects/`: website screenshots and campaign imagery from Isaac’s cleared Subvrsive deck.
- `assets/docs/Isaac-Nino-Resume.pdf`: existing résumé.

## Motion and interaction

A brief ISAAC NINO boot sequence precedes the hero on full page loads. Four checks follow interface setup, typography, the portrait, and project content; failures settle as fallbacks. Each check gets a short visual beat, followed by a clipped reveal after about two seconds on a normal load. A separate 4.5-second watchdog releases the page even if the app module or an asset stalls. Skip intro and Escape exit immediately and restore keyboard access. Direct section/case-study links, saved motion pause, and system reduced motion bypass the intro. With JavaScript unavailable the overlay stays hidden.

The opening typography, scan line, portrait, and project-name ticker move with normal page scrolling. The practice banner loops continuously through two matching groups, pausing on hover, when offscreen, or when motion is disabled. Four selectable switchboard channels contain distinct process studies: InTrust document assembly, the CES prompt workbench, Dell gallery interface states, and Dogwood responsive content. Each has four selectable layers that highlight the diagram and explain its inputs, decisions, and intent. Selections persist when moving between channels. A related-project button opens the matching case study. These are editorial illustrations grounded in the project descriptions, rather than live telemetry or exact architecture documentation. On small screens the detailed drawing scrolls horizontally and pans to the selected layer; the text and controls stay within the screen. The work section keeps a preview alongside the current story, then changes images as each project comes into view. Numbered controls jump between stories; filters narrow the collection. Smaller screens display each image within its story. Pointer movement adds a small perspective shift to the portrait and desktop preview. A persistent motion control and system reduced-motion preference disable decorative movement.

Brief color-split glitches appear on the opening headline, headline hover, switchboard changes, and visible project transitions. The hero also repeats a brief glitch every 3.2 seconds while visible; the timer stops offscreen, during the intro, when the tab is hidden, or when motion is paused. Interaction-triggered glitches retain a cooldown; the original text remains present and visual copies are hidden from assistive technology. Motion pause cancels active glitches, and system reduced-motion settings suppress them.

Native dialogs support keyboard focus containment, Escape, and focus return. The page includes a skip link, visible focus outlines, labeled form fields, loading-error fallback, and project links for visitors without JavaScript. Motion uses scheduled animation frames on scroll instead of a permanent rendering loop.

The existing Formspree endpoint remains `https://formspree.io/f/xqenwere`. The form preserves input on failure and times out after 15 seconds. No test message was sent; actual email delivery depends on the owner’s Formspree configuration. Google Fonts has local font fallbacks.

## Validation

`npm test` covers loader bypasses, timeout recovery, Escape cleanup, asset failure completion, project validation, filters, adding work without layout edits, image validation, escaping, and unsafe URLs. `npm run build` checks content and local assets before creating production output. `npm run check` runs those checks without building.

## Agency portfolio content

The selected agency work leads the collection: Heinz Make It Shake, Funko Pop! Yourself, Coca-Cola Product Concepts, and Espolòn at the Latin Grammys. Existing independent projects and switchboard references remain available. Individual roles follow Isaac’s supplied attribution; agency credits appear separately.

Heinz (slide 32), Funko (slide 60), and Espolòn (slide 24) now use the original embedded GIFs recovered losslessly from individual SVG slide exports. The GIFs were converted to silent H.264 MP4 loops without cropping or interpolation, preserving every source frame. Still posters were extracted from the same animations. Coca-Cola retains a faithful capture of the product concept grid on slide 29. All source-deck work was cleared by Isaac for portfolio use.

Brand marks are authentic assets from official brand sites, stored locally with provenance in `assets/images/brands/sources.json`. CSS provides a subdued monochrome treatment while preserving proportions. Toyota retains its internal tonal contrast.

Project films load only when playback starts. Offscreen, inactive, hidden-tab, and background-modal videos pause; desktop and mobile copies never intentionally play together. The global motion switch and reduced-motion preference disable automatic playback. An explicit clip play action remains available for visitors who prefer to control motion themselves.

Heinz uses the Make It Shake material, not the separate Ketchup Tournament campaign or the unrelated copied text on slide 31. Coca-Cola images are explicitly speculative product concepts. The Funko outcome attributes the deck’s 21.3K+ user-generated video figure to Subvrsive. Espolòn view counts are omitted because the deck contains conflicting figures.

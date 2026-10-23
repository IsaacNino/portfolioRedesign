# Isaac Nino — creative technology, human by nature

An original cyberpunk portfolio in graphite and icy blue with restrained red accents, an angular portrait composition, a selectable signal switchboard, scroll-driven project imagery, and case studies powered by one content file. Built with HTML, CSS, and JavaScript; no runtime packages.

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
4. Add HTTPS project links, or use `"links": []` for work without a public destination.
5. Run `npm run check` and preview before publishing.

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

## Where things live

- `index.html`: biography, contact copy, metadata, portrait, résumé, and discipline controls.
- `styles.css`: palette, layout, responsive styling, and transitions.
- `script.js`: scroll choreography, discipline descriptions, filters, dialogs, and contact handling.
- `content/project-visuals.js`: image renderer and automatic placeholder.
- `content/discipline-visuals.js`: original SVG practice maps for the four switchboard channels.
- `assets/images/projects/`: screenshots of Isaac’s own live project websites.
- `assets/docs/Isaac-Nino-Resume.pdf`: existing résumé.

## Motion and interaction

The opening typography, scan line, portrait, and project-name ticker move with normal page scrolling. Four selectable switchboard channels redraw an original practice map with a short tracing animation; these diagrams illustrate a process rather than live statistics. The work section keeps a preview alongside the current story, then changes images as each project comes into view. Numbered controls jump between stories; filters narrow the collection. Smaller screens display each image within its story. Pointer movement adds a small perspective shift to the portrait and desktop preview. A persistent motion control and system reduced-motion preference disable decorative movement.

Native dialogs support keyboard focus containment, Escape, and focus return. The page includes a skip link, visible focus outlines, labeled form fields, loading-error fallback, and project links for visitors without JavaScript. Motion uses scheduled animation frames on scroll instead of a permanent rendering loop.

The existing Formspree endpoint remains `https://formspree.io/f/xqenwere`. The form preserves input on failure and times out after 15 seconds. No test message was sent; actual email delivery depends on the owner’s Formspree configuration. Google Fonts has local font fallbacks.

## Validation

`npm test` covers project validation, filters, adding work without layout edits, image validation, escaping, and unsafe URLs. `npm run build` checks content and local assets before creating production output. `npm run check` runs those checks without building.

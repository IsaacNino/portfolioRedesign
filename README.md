# Isaac Nino — industrial portfolio

A dependency-free, static portfolio with an original industrial hero image, scroll reveals, project filters, accessible case-study dialogs, and a single project data file. The existing project stories, résumé, portrait, social links, and Formspree contact endpoint are retained.

## Preview and publish

Use Node.js 20 or later. There are no packages to install.

```sh
npm run dev
```

Open `http://127.0.0.1:5177`. The source can also be served with any ordinary static HTTP server. ES modules and JSON loading require HTTP; opening `index.html` directly as a file will not work.

```sh
npm test
npm run build
npm run preview
```

The production output is `dist/`. On Vercel, select **Other** as the framework, `npm run build` as the build command, and `dist` as the output directory. A static host that serves the repository root also works. The canonical URL remains `https://www.isaacnino.com/`.

## Add or edit a project

**Edit only `content/projects.json` for project content.** The array order is the display order. Cards, filters, counts, project tools, and case studies all use the same record.

1. Duplicate a project object in the `projects` array.
2. Give it a unique lowercase `id`, such as `interactive-installation`.
3. Update its title, category, summary, tags, and case-study text. Set `featured` to `true` for a full-width card.
4. Optionally add a screenshot to `assets/images/` and include `image` with a relative `src` and meaningful `alt` text.
5. Add HTTPS links, or use `"links": []` for work without a public destination.
6. Run `npm run check` and preview. Commit and deploy using your normal workflow.

Example record (replace the illustrative text with your real project):

```json
{
  "id": "new-project",
  "title": "New project",
  "category": "Interactive experiences",
  "summary": "A short, honest description of the work.",
  "featured": false,
  "accent": "acid",
  "tags": ["JavaScript", "Interaction design"],
  "image": {
    "src": "./assets/images/new-project.webp",
    "alt": "Describe the interface shown in your screenshot."
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

Remove the entire `image` property if you do not have a screenshot yet. New projects automatically get abstract artwork; no component or layout change is required. The original four projects have bespoke CSS visual studies, explicitly labeled as studies rather than screenshots. `accent` accepts `acid`, `amber`, `blue`, or `sage`.

The category label creates its filter automatically; `All work` is reserved. Project IDs power direct links such as `/#project/intrust`, so keep an ID stable after sharing it. The editor schema in `content/projects.schema.json` supplies field guidance; runtime and build checks catch missing fields, duplicate IDs, unsafe URLs, and missing local images.

## Other content

- `index.html`: biography, approach, contact copy, metadata, and résumé link.
- `styles.css`: colors, typography, responsive layouts, and transitions.
- `content/project-visuals.js`: optional custom artwork. Normal content edits do not require this file.
- `assets/images/industrial-chamber.png`: original generated hero artwork. Its prompt and design notes are in `ART_DIRECTION.md`.
- `script.js`: filters, dialogs, scroll effects, menu, and form submission.
- `assets/docs/Isaac-Nino-Resume.pdf`: retained résumé.

## Interaction and accessibility

- Native dialog focus containment, Escape dismissal, and focus return.
- Keyboard-operable filters and menu, labeled form fields, skip link, and visible focus rings.
- System reduced-motion support and a persistent animation pause control.
- Scroll-driven background movement uses a single scheduled animation frame and stops with the motion control. There is no continuously running canvas animation.
- No scroll hijacking, fake loading screen, custom cursor, analytics, or runtime package dependencies.
- Responsive layouts down to 320px; local images load lazily.
- Project-load errors show a useful fallback. Without JavaScript, the biography, email, résumé, and project destination links remain available.

Google Fonts is the only presentation dependency and has local font fallbacks. The contact form uses the existing `https://formspree.io/f/xqenwere` endpoint. It reports success only after an accepted response, preserves text on errors, and has a 15-second timeout. End-to-end email delivery requires the owner's configured Formspree account and has not been tested by sending a message.

## Validation

`npm test` checks data validation, automatic filters, adding a new project without component edits, screenshot validation, URL safety, and escaping. `npm run build` validates content and local assets before copying the static output. `npm run check` runs content checks without building.

# Isaac Nino Portfolio Redesign

Local static portfolio site based on the stronger Deepsite redesign direction.

## Structure

```txt
portfolioRedesign/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Local Preview

From inside the project folder:

```bash
python3 -m http.server 5173
```

Then open:

```txt
http://localhost:5173
```

You can also use the VS Code Live Server extension.

## What Changed From Deepsite

- Split inline CSS and JavaScript into separate files.
- Removed the Deepsite badge script.
- Removed placeholder/fake projects.
- Replaced stock image URLs with CSS-generated abstract visuals.
- Removed the fake contact form submit behavior.
- Updated location from Los Angeles to Colorado.
- Added real project framing:
  - InTrust
  - CES AI Postcard Generator
  - Dell Foundation Digital Gallery
  - NFC Identity System
  - AI Video Experiments
  - Dogwood Counseling Website
- Added Systems and Lab Notes sections.
- Added basic SEO/meta tags.
- Added dynamic footer year.
- Added Denver/Colorado time zone handling.

## Suggested Next Pass

1. Replace `hello@isaacnino.com` with the preferred contact email.
2. Confirm LinkedIn and GitHub URLs.
3. Add real screenshots or short videos for each project.
4. Decide whether project cards should open modals or link to individual case-study pages.
5. Add `favicon.ico` and social preview image.
6. Push to GitHub.
7. Deploy with Vercel.

## Optional Future Upgrade

This can stay as a simple static site, but a future Vite version would make it easier to componentize project cards, add case study routes, and manage content from a data file.

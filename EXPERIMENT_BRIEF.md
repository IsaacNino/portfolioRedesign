# Portfolio motion experiment

Develop this direction on `codex/portfolio-motion-experiment`, based on
`codex/portfolio-redesign`. Keep the clearer typography and structure of the
redesign while bringing back the original site's sense of depth and movement.

- Build two compact project rows. The top slowly pans left and the bottom pans
  right, with continuous loops and no visible jumps. Preserve the real project
  links and detail stories.
- Pause both rows during interaction. Support native swipe/trackpad scrolling,
  mouse dragging, per-row arrows, and keyboard navigation. Resume gently after
  five seconds of inactivity; never resume during an active drag, keyboard
  focus, or an open project dialog.
- Keep a discreet global motion toggle. Explicitly turning motion off stays
  off for the page visit. Honor reduced-motion preferences, including the
  background, contact invitation, and banner.
- Replace availability dots with one stable-size contact invitation cycling
  “Let’s Talk”, “Let’s Plan”, “Let’s Think”, and “Let’s Build”. Use a restrained
  vertical card transition and the same contact destination for every phrase.
- Restore the running capabilities banner as a slower supporting movement.
- Use half the grain and texture intensity of the first motion study: 3.5%
  grain opacity and half-strength ambient lighting. Keep background drift subtle.
- Give **every placeholder tile the same neutral charcoal color**. Future
  project screenshots should supply the color; do not assign decorative
  project-specific colors or fabricate project images.
- Keep adding projects simple through the existing JSON content file. Preserve
  mobile layouts, accessible dialogs, real contact paths, and clear image fallbacks.
- Keep the work isolated on this experimental branch until reviewed. Do not
  merge into production or deploy without an explicit request.

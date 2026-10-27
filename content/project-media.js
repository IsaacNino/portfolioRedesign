// Original project films load only when played. CSS-hidden and inactive copies stay paused.
export function createProjectMedia({ motionAllowed }) {
  let videos = [];
  const visible = new WeakMap();
  const manuallyPlaying = new WeakSet();
  const manuallyPaused = new WeakSet();
  const pending = new WeakSet();
  function updateButton(video) {
    const button = video.nextElementSibling;
    if (!button) return;
    const playing = !video.paused;
    button.innerHTML = `<span aria-hidden="true">${playing ? 'Ⅱ' : '▷'}</span> ${playing ? 'Pause preview' : 'Play preview'}`;
    button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${button.dataset.filmTitle} preview`);
    button.setAttribute('aria-pressed', String(playing));
  }
  function sync() {
    const modalOpen = Boolean(document.querySelector('dialog[open]'));
    const candidates = videos.filter(video => {
      const active = video.isConnected && video.getClientRects().length > 0 &&
        !video.closest('.showcase-card[aria-hidden="true"]') &&
        (!modalOpen || video.closest('dialog[open]'));
      return active && visible.get(video) && !document.hidden &&
        !manuallyPaused.has(video) && (motionAllowed() || manuallyPlaying.has(video));
    });
    // At a story boundary, give the clip nearest the viewport center the focus.
    const primary = candidates.sort((a, b) => {
      if (manuallyPlaying.has(a) !== manuallyPlaying.has(b)) return manuallyPlaying.has(a) ? -1 : 1;
      const center = video => { const rect = video.getBoundingClientRect(); return Math.abs(rect.top + rect.height / 2 - innerHeight / 2); };
      return center(a) - center(b);
    })[0];
    for (const video of videos) {
      const play = video === primary;
      if (!play) { video.pause(); continue; }
      if (!video.paused || pending.has(video) || video.error) continue;
      video.muted = true;
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      pending.add(video);
      video.play().catch(() => {}).finally(() => { pending.delete(video); updateButton(video); });
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) visible.set(entry.target, entry.isIntersecting && entry.intersectionRatio >= .2);
    sync();
  }, { threshold: [0, .2] });
  function refresh() {
    observer.disconnect();
    for (const video of videos) if (!video.isConnected) video.pause();
    videos = [...document.querySelectorAll('[data-project-video]')];
    for (const video of videos) {
      const rect = video.getBoundingClientRect();
      visible.set(video, rect.height > 0 && rect.top < innerHeight * .8 && rect.bottom > innerHeight * .2);
      observer.observe(video);
      if (video.dataset.mediaBound) continue;
      video.dataset.mediaBound = 'true';
      video.addEventListener('play', () => updateButton(video));
      video.addEventListener('pause', () => updateButton(video));
      video.addEventListener('error', () => { video.nextElementSibling.hidden = true; });
      video.nextElementSibling.addEventListener('click', () => {
        if (video.paused) { manuallyPaused.delete(video); manuallyPlaying.add(video); }
        else { manuallyPaused.add(video); manuallyPlaying.delete(video); }
        sync();
      });
      updateButton(video);
    }
    sync();
  }
  function resetManualPlayback() { for (const video of videos) manuallyPlaying.delete(video); sync(); }
  document.addEventListener('visibilitychange', sync);
  return { refresh, sync, resetManualPlayback };
}

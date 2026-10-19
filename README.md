# BuildWeek speaker overlay

Animated "who's speaking" lower third for the BuildWeek Jacksonville stream on CreatorHive.

- **Control page:** https://sscottdev.github.io/buildweek-speaker-overlay/ — click a speaker (or press 1–3) to animate their banner in; Esc hides it.
- **Browser source:** https://sscottdev.github.io/buildweek-speaker-overlay/overlay.html — 1920×1080, transparent.

## OBS setup

1. Add a **Browser** source with the overlay URL above, 1920 × 1080.
2. **Docks → Custom Browser Docks**, add the control page URL. Clicking Show in the dock plays the banner on the browser source (same origin, so they talk over BroadcastChannel/localStorage).

No dock? Use one browser source per speaker — `overlay.html?speaker=lucas-wyman&hold=10` — with "Refresh browser when scene becomes active" ticked, and show/hide it with a hotkey. The banner animates every time it's shown.

## Speakers

Edit `speakers.js` (name, role, one-liner, photo in `assets/speakers/`). "Someone else is speaking" on the control page shows an unlisted speaker without editing anything.

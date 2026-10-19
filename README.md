# BuildWeek speaker overlay

Animated "who's speaking" lower third for the BuildWeek Jacksonville stream on CreatorHive.

1. Open the **control page**: https://sscottdev.github.io/buildweek-speaker-overlay/ — it gives itself a private room code (`?room=…`). Bookmark that address.
2. Copy the **OBS browser source URL** shown at the top (`overlay.html?room=…`) into a Browser source in OBS, 1920 × 1080.
3. Click a speaker (or press 1–3); Esc hides. Works from any browser or device to OBS on any machine — clicks go through the [ntfy.sh](https://ntfy.sh) relay to that room.

Same machine and offline? Add the control page as an OBS custom dock; it also talks to the browser source directly.

No relay at all: one browser source per speaker — `overlay.html?speaker=lucas-wyman&hold=10` — with "Refresh browser when scene becomes active", toggled by a hotkey.

## Speakers

Edit `speakers.js` (name, role, one-liner, photo in `assets/speakers/`). "Someone else is speaking" on the control page shows an unlisted speaker without editing anything.

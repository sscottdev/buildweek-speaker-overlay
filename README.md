# BuildWeek speaker overlay

Animated "who's speaking" lower third for the BuildWeek Jacksonville stream on CreatorHive.

### Local (recommended — no internet needed)

1. On the streaming computer, download and unzip https://github.com/sscottdev/buildweek-speaker-overlay/archive/refs/heads/main.zip
2. OBS → **Tools → WebSocket Server Settings**: tick *Enable WebSocket server*, click *Show Connect Info* for the password.
3. Add a **Browser** source, tick **Local file**, choose `overlay.html`, 1920 × 1080.
4. Open `index.html` in Chrome on the same computer, enter `localhost:4455` and the password, **Connect** → "Connected to OBS ✓".
5. Click a speaker (or press 1–3); Esc hides. The status says `OBS ✓` when OBS took it.

From another computer on the same network: open its own copy of `index.html` and use the streaming computer's IP instead of `localhost`.

### Over the internet

Open https://sscottdev.github.io/buildweek-speaker-overlay/ (it adds a private `?room=…`; bookmark it), put the **OBS browser source URL** shown at the top into OBS, and click. "OBS overlay connected ✓" appears once OBS has loaded it. Clicks go through the [ntfy.sh](https://ntfy.sh) relay.

## Speakers

Edit `speakers.js` (name, role, one-liner, photo in `assets/speakers/`). "Someone else is speaking" on the control page shows an unlisted speaker without editing anything.

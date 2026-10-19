// Edit this list to add or change speakers. `id` goes in URLs (?speaker=id).
window.SPEAKERS = [
  {
    id: "lucas-wyman",
    name: "Lucas Wyman",
    role: "Founder · Duval Software",
    line: "Industrial-grade engineering, built in Jacksonville. Never outsourced.",
    photo: "assets/speakers/lucas-wyman.jpg",
  },
  {
    id: "kady-yellow",
    name: "Kady Yellow",
    role: "VP of Placemaking · Downtown Vision Inc.",
    line: "Social architect, TEDx speaker and global expert in people planning.",
    photo: "assets/speakers/kady-yellow.jpg",
  },
  {
    id: "brendan-lammond",
    name: "Brendan Lammond",
    role: "Founder · ProofSites",
    line: "Building the evidence layer for fractional executives.",
    photo: "assets/speakers/brendan-lammond.jpg",
  },
];

// Control page → overlay messages, three ways so it works wherever each page runs:
// - ntfy.sh relay keyed by a private room id (?room=…): control in any browser, overlay in OBS on any machine;
// - BroadcastChannel / localStorage: same browser or same OBS (custom dock + browser source).
window.LowerThirdBus = {
  room: new URLSearchParams(location.search).get("room") || "",
  topic() {
    return this.room ? `https://ntfy.sh/bw-lower-third-${this.room}` : "";
  },
  async send(msg) {
    const payload = { ...msg, id: crypto.randomUUID(), at: Date.now() };
    try {
      new BroadcastChannel("bw-lower-third").postMessage(payload);
    } catch {}
    try {
      localStorage.setItem("bw-lower-third", JSON.stringify(payload));
    } catch {}
    if (!this.topic()) return true;
    try {
      const res = await fetch(this.topic(), { method: "POST", body: JSON.stringify(payload) });
      return res.ok;
    } catch {
      return false;
    }
  },
  listen(handler) {
    const seen = new Set();
    const once = (msg) => {
      if (!msg || !msg.id || seen.has(msg.id)) return;
      seen.add(msg.id);
      // Ignore stale relay messages (e.g. replayed after a reconnect).
      if (Date.now() - msg.at > 120000) return;
      handler(msg);
    };
    try {
      new BroadcastChannel("bw-lower-third").onmessage = (e) => once(e.data);
    } catch {}
    window.addEventListener("storage", (e) => {
      if (e.key !== "bw-lower-third" || !e.newValue) return;
      try {
        once(JSON.parse(e.newValue));
      } catch {}
    });
    if (this.topic()) {
      // EventSource reconnects on its own if the connection drops.
      new EventSource(`${this.topic()}/sse`).onmessage = (e) => {
        try {
          once(JSON.parse(JSON.parse(e.data).message));
        } catch {}
      };
    }
  },
};

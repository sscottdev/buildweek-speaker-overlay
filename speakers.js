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
  async send(msg, { relayOnly = false } = {}) {
    const payload = { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, at: Date.now() };
    if (!relayOnly) {
      try {
        new BroadcastChannel("bw-lower-third").postMessage(payload);
      } catch {}
      try {
        localStorage.setItem("bw-lower-third", JSON.stringify(payload));
      } catch {}
    }
    const results = [];
    if (this.obs && !relayOnly) {
      const status = await this.obs.emit(payload);
      if (status) results.push(status.result ? "OBS ✓" : `OBS ✗ ${status.comment || ""}`);
    }
    if (this.topic()) {
      try {
        const res = await fetch(this.topic(), { method: "POST", body: JSON.stringify(payload) });
        results.push(res.ok ? "relay ✓" : "relay ✗");
      } catch {
        results.push("relay ✗");
      }
    }
    return results.join(" · ") || "sent";
  },
  listen(handler) {
    const seen = new Set();
    const once = (msg) => {
      if (!msg || !msg.id || seen.has(msg.id)) return;
      seen.add(msg.id);
      handler(msg);
    };
    // OBS WebSocket → obs-browser "emit_event" arrives as a window event inside OBS browser sources.
    window.addEventListener("bw-lower-third", (e) => once(e.detail));
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
      // EventSource reconnects on its own. Skip anything the relay sent before this subscription
      // opened (replays after a reconnect), using the relay's clock so machine clocks don't matter.
      const es = new EventSource(`${this.topic()}/sse`);
      let openedAt = 0;
      es.addEventListener("open", (e) => {
        try {
          if (e.data && !openedAt) openedAt = JSON.parse(e.data).time;
        } catch {}
      });
      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (openedAt && event.time < openedAt) return;
          once(JSON.parse(event.message));
        } catch {}
      };
    }
  },
};

// Minimal OBS WebSocket (v5) client for the control page: authenticate, then emit an event into every
// OBS browser source through obs-browser's "emit_event" vendor request. Needs OBS 28+.
window.ObsLink = class {
  constructor(onStatus) {
    this.onStatus = onStatus;
    this.pending = new Map();
  }
  async connect(address, password) {
    this.close();
    const url = /^wss?:\/\//.test(address) ? address : `ws://${address}`;
    return new Promise((resolve) => {
      const ws = new WebSocket(url, "obswebsocket.json");
      this.ws = ws;
      const fail = (why) => {
        this.onStatus(false, why);
        resolve(false);
      };
      ws.onerror = () => fail("Couldn't reach OBS. Is Tools → WebSocket Server Settings enabled?");
      ws.onclose = (e) => {
        if (e.code === 4009) fail("Wrong OBS WebSocket password.");
        else if (this.ready) this.onStatus(false, "OBS disconnected.");
        this.ready = false;
      };
      ws.onmessage = async (e) => {
        const { op, d } = JSON.parse(e.data);
        if (op === 0) {
          const identify = { rpcVersion: 1 };
          if (d.authentication) {
            const sha = async (text) =>
              btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))));
            identify.authentication = await sha((await sha(password + d.authentication.salt)) + d.authentication.challenge);
          }
          ws.send(JSON.stringify({ op: 1, d: identify }));
        } else if (op === 2) {
          this.ready = true;
          this.onStatus(true, "Connected to OBS ✓");
          resolve(true);
        } else if (op === 7) {
          const done = this.pending.get(d.requestId);
          this.pending.delete(d.requestId);
          if (done) done(d.requestStatus);
        }
      };
    });
  }
  emit(payload) {
    if (!this.ready) return Promise.resolve(null);
    const requestId = `${payload.id}`;
    return new Promise((resolve) => {
      this.pending.set(requestId, resolve);
      this.ws.send(
        JSON.stringify({
          op: 6,
          d: {
            requestType: "CallVendorRequest",
            requestId,
            requestData: {
              vendorName: "obs-browser",
              requestType: "emit_event",
              requestData: { event_name: "bw-lower-third", event_data: payload },
            },
          },
        }),
      );
      setTimeout(() => this.pending.has(requestId) && (this.pending.delete(requestId), resolve({ result: false, comment: "OBS didn't answer" })), 4000);
    });
  }
  close() {
    this.ready = false;
    if (this.ws) this.ws.close();
  }
};

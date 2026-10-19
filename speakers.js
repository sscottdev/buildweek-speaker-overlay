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

// Control page → overlay messages. BroadcastChannel reaches other tabs and OBS docks/sources on
// the same origin; the localStorage write is a fallback for engines where the channel doesn't cross.
window.LowerThirdBus = {
  send(msg) {
    const payload = { ...msg, at: Date.now() };
    try {
      new BroadcastChannel("bw-lower-third").postMessage(payload);
    } catch {}
    try {
      localStorage.setItem("bw-lower-third", JSON.stringify(payload));
    } catch {}
  },
  listen(handler) {
    let last = 0;
    const once = (msg) => {
      if (!msg || msg.at === last) return;
      last = msg.at;
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
  },
};

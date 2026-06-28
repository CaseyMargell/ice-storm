(() => {
  "use strict";

  const api = globalThis.browser || globalThis.chrome;
  const ASSET_URL = api.runtime.getURL("assets/ice-dancer.webp");

  // Icy, non-lyric flavor text for the frosty speech bubble.
  const LINES = ["Stay frosty", "Ice cold", "Too cool", "Chill out", "Sub-zero", "Brrr"];

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Every dancer currently on screen, so the popup can dismiss them / report state.
  const active = new Set();

  function dismissAll() {
    for (const w of Array.from(active)) {
      w.__viStop = true;
      active.delete(w);
      const a = w.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 240,
        easing: "ease-in",
        fill: "forwards",
      });
      a.finished.then(() => w.remove(), () => w.remove());
    }
  }

  function makeBubble(text) {
    const b = document.createElement("div");
    b.className = "vi-bubble";
    b.textContent = text;
    return b;
  }

  // One full appearance: dance-glide in from off-screen right, hold (the GIF
  // loops his dance in place), then glide off-screen.
  async function performOnce({ restX, bottom, scale, danceMs, exitLeft }) {
    if (!document.body) return;

    const wrap = document.createElement("div");
    wrap.className = "vi-wrap";
    wrap.style.bottom = bottom + "px";
    wrap.style.setProperty("--vi-scale", scale);

    const img = document.createElement("img");
    img.className = "vi-img";
    img.src = ASSET_URL;
    img.alt = "Ice dancer";
    img.decoding = "async";
    wrap.appendChild(img);

    const vw = window.innerWidth;
    const startX = vw + 220;          // off-screen right
    const exitX = exitLeft ? -260 : vw + 260;

    document.body.appendChild(wrap);
    active.add(wrap);

    const opts = { easing: "ease-out", fill: "forwards" };
    const dur = (a, b) => Math.max(700, Math.abs(a - b) * 1.8);

    try {
      // Glide in
      wrap.style.transform = `translateX(${startX}px)`;
      await wrap.animate(
        [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${restX}px)` }],
        { duration: dur(startX, restX), ...opts }
      ).finished;
      if (wrap.__viStop) return;
      wrap.style.transform = `translateX(${restX}px)`;

      // Dance in place (the clip loops on its own)
      const bubble = makeBubble(LINES[Math.floor(Math.random() * LINES.length)]);
      wrap.appendChild(bubble);
      requestAnimationFrame(() => bubble.classList.add("vi-bubble-show"));
      await wait(danceMs);
      if (wrap.__viStop) return;
      bubble.classList.remove("vi-bubble-show");

      // Glide off
      await wrap.animate(
        [{ transform: `translateX(${restX}px)` }, { transform: `translateX(${exitX}px)` }],
        { duration: dur(restX, exitX), easing: "ease-in", fill: "forwards" }
      ).finished;
    } finally {
      active.delete(wrap);
      if (!wrap.__viStop) wrap.remove(); // if dismissed, the fade-out handles removal
    }
  }

  // A single calm cameo.
  function summonOne() {
    const vw = window.innerWidth;
    performOnce({ restX: vw - 260, bottom: 0, scale: 1, danceMs: 4200, exitLeft: true });
  }

  // The Ice Storm: a crew floods the screen and dances together.
  function iceStorm() {
    const vw = window.innerWidth;
    const count = Math.min(7, Math.max(4, Math.round(vw / 280)));
    for (let i = 0; i < count; i++) {
      const scale = 0.6 + Math.random() * 0.6;
      const restX = Math.round((vw - 160) * (i / count) + (Math.random() * 60 - 30));
      const bottom = Math.round(Math.random() * 90);
      setTimeout(
        () =>
          performOnce({
            restX,
            bottom,
            scale,
            danceMs: 5200 + Math.random() * 1500,
            exitLeft: Math.random() < 0.5,
          }),
        i * 220
      );
    }
  }

  api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === "VI_STORM") iceStorm();
    else if (msg.type === "VI_ONE") summonOne();
    else if (msg.type === "VI_DISMISS") dismissAll();
    else if (msg.type === "VI_STATUS") {
      sendResponse({ active: active.size });
      return true;
    }
  });
})();

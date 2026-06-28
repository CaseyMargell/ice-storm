"use strict";

const api = globalThis.browser || globalThis.chrome;

const btn = document.getElementById("toggle");
const hint = document.getElementById("hint");
const ambient = document.getElementById("ambient");

let tabId = null;
let mode = "summon";

function setMode(m) {
  mode = m;
  if (m === "dismiss") {
    btn.dataset.mode = "dismiss";
    btn.innerHTML = "✕&nbsp;&nbsp;Dismiss now";
  } else {
    btn.dataset.mode = "summon";
    btn.innerHTML = "❄&nbsp;&nbsp;Summon now";
  }
}

function disable(text) {
  btn.disabled = true;
  hint.textContent = text || "";
}

async function activeTab() {
  const tabs = await api.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0];
}

async function init() {
  const { viAmbientTier = "often" } = await api.storage.local.get("viAmbientTier");
  ambient.value = viAmbientTier;

  const tab = await activeTab();
  if (!tab || !tab.id) {
    disable("No active tab.");
    return;
  }
  tabId = tab.id;

  // Ask the page whether any dancers are already on screen.
  try {
    const res = await api.tabs.sendMessage(tabId, { type: "VI_STATUS" });
    setMode(res && res.active > 0 ? "dismiss" : "summon");
  } catch (e) {
    disable("Open a normal web page,\nthen summon him from here.");
  }
}

btn.addEventListener("click", async () => {
  if (!tabId || btn.disabled) return;
  try {
    if (mode === "summon") {
      await api.tabs.sendMessage(tabId, { type: "VI_STORM" });
      setMode("dismiss");
    } else {
      await api.tabs.sendMessage(tabId, { type: "VI_DISMISS" });
      setMode("summon");
    }
  } catch (e) {
    disable("Can't reach this page.");
  }
});

ambient.addEventListener("change", () => {
  api.storage.local.set({ viAmbientTier: ambient.value });
});

init();

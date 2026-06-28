"use strict";

const api = globalThis.browser || globalThis.chrome;

const ALARM_NAME = "vi-ambient";
const DEFAULT_TIER = "often";

// Random cameo cadence tiers — [minMinutes, maxMinutes]. "off" disables them.
const TIERS = {
  off: null,
  frequent: [5, 10],
  often: [10, 30],
  occasionally: [30, 180],
  rarely: [180, 2880],
};

function tierFor(name) {
  return Object.prototype.hasOwnProperty.call(TIERS, name) ? name : DEFAULT_TIER;
}

async function getTier() {
  const { viAmbientTier } = await api.storage.local.get("viAmbientTier");
  return tierFor(viAmbientTier);
}

async function scheduleAmbient() {
  const range = TIERS[await getTier()];
  api.alarms.clear(ALARM_NAME);
  if (!range) return; // "off" — no cameos scheduled
  const [min, max] = range;
  api.alarms.create(ALARM_NAME, { delayInMinutes: min + Math.random() * (max - min) });
}

async function sendToActiveTab(type) {
  try {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab || !tab.id) return;
    await api.tabs.sendMessage(tab.id, { type });
  } catch (e) {
    // No content script on this page (e.g. about:, addons, PDF viewer) — that's fine.
  }
}

// The toolbar icon opens popup.html — summon / dismiss is driven from there.

// Random, low-key solo appearances.
api.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  await sendToActiveTab("VI_ONE");
  scheduleAmbient(); // re-arm with a fresh random delay
});

// Changing the tier in the popup re-arms immediately, so a long pending timer
// doesn't keep you waiting after you bump the frequency up.
api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.viAmbientTier) scheduleAmbient();
});

api.runtime.onInstalled.addListener(scheduleAmbient);
api.runtime.onStartup.addListener(scheduleAmbient);

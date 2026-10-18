/**
 * Browser persistence boundary. The UI talks only to this interface; this
 * implementation is intentionally local until an authenticated Supabase
 * adapter is configured by the host application.
 */
const KEY = 'bio-calculator.workspace.v1';
const defaults = { meal: [], supplements: [], biomarkers: [], overrides: {}, history: [], settings: { language: 'en', gastricAcid: 'normal', energyKcal: 2500 } };
const clone = value => JSON.parse(JSON.stringify(value));

export function createWorkspaceRepository(storage = globalThis.localStorage) {
  let current = clone(defaults);
  try {
    const saved = storage?.getItem(KEY);
    if (saved) current = { ...current, ...JSON.parse(saved), settings: { ...current.settings, ...JSON.parse(saved).settings } };
  } catch { /* A blocked/corrupt storage area remains a usable in-memory workspace. */ }

  const save = () => {
    try { storage?.setItem(KEY, JSON.stringify(current)); storage?.setItem(KEY + '.updatedAt', new Date().toISOString()); } catch { /* keep the in-memory workspace */ }
    // Lets the host page copy the workspace to the signed-in user's account (same-origin only).
    try { if (globalThis.parent && globalThis.parent !== globalThis) globalThis.parent.postMessage({ type: 'bio-calculator:saved' }, globalThis.location.origin); } catch { /* standalone */ }
  };
  return {
    kind: 'local',
    load: () => clone(current),
    replace(next) { current = { ...defaults, ...clone(next), settings: { ...defaults.settings, ...next.settings } }; save(); return this.load(); },
    reset() { current = clone(defaults); save(); return this.load(); }
  };
}

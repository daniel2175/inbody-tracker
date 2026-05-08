// Connection config: localStorage `sb_cfg` (user override) > .env defaults.
// Preserves the original "users can override the connection at runtime" behavior
// while introducing build-time defaults via Vite env vars.
// See implementation-considerations §2.

import { DEFAULT_PIN } from './constants.js';

export function getCfg() {
  // 1. localStorage takes precedence (user-customized connection)
  try {
    const stored = JSON.parse(localStorage.getItem('sb_cfg') || 'null');
    if (stored && stored.url && stored.key) return stored;
  } catch {
    // fall through
  }
  // 2. Fall back to .env defaults (build-time config)
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) return { url, key };
  return null;
}

export function getPin() {
  return localStorage.getItem('mgr_pin') || DEFAULT_PIN;
}

export function showCfgErr(m) {
  const e = document.getElementById('cfgError');
  e.textContent = m;
  e.style.display = 'block';
}

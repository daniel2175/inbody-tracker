// Application entry. Imports modules, wires DOM events, and boots the app.

import { getCfg } from './config.js';
import { initSb } from './supabase-client.js';
import { hideSplash } from './splash.js';
import { bindEvents } from './event-bindings.js';

function init() {
  const cfg = getCfg();
  document.getElementById('splashScreen').style.display = 'flex';
  if (!cfg) {
    hideSplash(() => document.getElementById('configScreen').classList.add('show'))();
    return;
  }
  initSb(cfg);
}

bindEvents();
init();

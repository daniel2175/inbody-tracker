import { state } from './state.js';
import { MONTHS } from './constants.js';
import { isOwnPage } from './auth.js';
import { esc, showToast } from './utils.js';
import { localRefresh } from './supabase-client.js';

export function monthStatusIcon(type) {
  if (type === 'done')
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>`;
  if (type === 'warn')
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 20h20L12 2z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.8" fill="#f97316"/></svg>`;
  if (type === 'miss')
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>`;
  return `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--text3)" stroke-width="1.5"/></svg>`;
}

export function makeMonthSection(m, key, label, statusType, own, md, openSet) {
  const d = md[key] || {};
  const sec = document.createElement('div');
  sec.className = 'month-section' + (openSet.has(key) ? ' open' : '');
  sec.dataset.key = key;
  sec.innerHTML = `
    <div class="month-head" data-action="toggle-month">
      <div class="month-head-left">
        <div class="month-status">${monthStatusIcon(statusType)}</div>
        <div class="month-name">${label}</div>
      </div>
      <svg class="month-chevron" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
    </div>
    <div class="month-body">
      ${
        d.photoUrl
          ? `<div id="ps-${key}" style="position:relative">
             <img src="${d.photoUrl}" alt="InBody report"
               style="width:100%;height:auto;display:block;border-radius:var(--radius-sm);">
           </div>`
          : `<div id="ps-${key}" class="photo-slot" style="cursor:default;">
             <div class="photo-add-icon"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
             <div class="photo-add-label">${own ? 'No report uploaded yet' : 'No report uploaded'}</div>
           </div>`
      }
      ${
        own
          ? `<div class="report-photo-btns">
        <button class="report-upload-btn" data-action="upload-report" data-mid="${esc(String(m.id))}" data-key="${esc(key)}">⬆ Upload Report</button>
        ${d.photoUrl ? `<button class="report-delete-btn" data-action="delete-photo" data-mid="${esc(String(m.id))}" data-key="${esc(key)}">✕ Delete Report</button>` : ''}
      </div>`
          : ''
      }
      ${overallScoreBox(m.id, key, d.overall)}
      <div class="metrics-grid">
        ${mBox(m.id, key, 'wt', 'WT', 'Weight · 體重', 'kg', d.wt)}
        ${mBoxDual(m.id, key, 'smm', 'SMM', 'Skeletal Muscle · 骨骼肌重', d.smm, d.smm_pct)}
        ${mBoxDual(m.id, key, 'bfm', 'BFM', 'Body Fat Mass · 體脂肪重', d.bfm, d.bfm_pct)}
        ${mBox(m.id, key, 'pbf', 'PBF', 'Body Fat % · 體脂肪率', '%', d.pbf)}
      </div>
      ${own ? `<button class="month-submit-btn" id="sub-${key}" data-action="submit-month" data-mid="${esc(String(m.id))}" data-key="${esc(key)}">Submit</button>` : ''}
    </div>`;
  return sec;
}

export function renderMonths(m) {
  const w = document.getElementById('monthsWrapper');
  const own = isOwnPage(m.id);
  const openSet = new Set([...w.querySelectorAll('.month-section.open')].map((e) => e.dataset.key));
  w.innerHTML = '';
  const md = m.monthData || {};
  const now = new Date();
  const curIdx = MONTHS.findIndex(
    (mo) => mo.year === now.getFullYear() && mo.month === now.getMonth(),
  );
  if (curIdx < 0) {
    MONTHS.forEach(({ key, label }) =>
      w.appendChild(makeMonthSection(m, key, label, 'future', own, md, openSet)),
    );
    return;
  }
  const cur = MONTHS[curIdx];
  w.appendChild(
    makeMonthSection(
      m,
      cur.key,
      cur.label,
      (md[cur.key] || {}).photoUrl ? 'done' : 'warn',
      own,
      md,
      openSet,
    ),
  );
  for (let i = curIdx + 1; i < Math.min(curIdx + 6, MONTHS.length); i++) {
    const mo = MONTHS[i];
    w.appendChild(makeMonthSection(m, mo.key, mo.label, 'future', own, md, openSet));
  }
  if (curIdx > 0) {
    const ph = document.createElement('div');
    ph.style.cssText =
      'font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;padding:8px 2px 2px;';
    ph.textContent = 'Past Months';
    w.appendChild(ph);
    for (let i = curIdx - 1; i >= 0; i--) {
      const mo = MONTHS[i];
      w.appendChild(
        makeMonthSection(
          m,
          mo.key,
          mo.label,
          (md[mo.key] || {}).photoUrl ? 'done' : 'miss',
          own,
          md,
          openSet,
        ),
      );
    }
  }
}

export function mBox(mid, key, field, abbr, name, unit, val) {
  const own = isOwnPage(mid);
  const dataAttrs = own
    ? `data-action="track-inbody" data-mid="${esc(String(mid))}" data-key="${esc(key)}" data-field="${esc(field)}"`
    : 'readonly';
  return `<div class="metric-box">
    <div class="metric-abbr">${abbr}</div>
    <div class="metric-full-name">${name}</div>
    <div class="metric-row">
      <input class="metric-input" type="number" step="0.1" inputmode="decimal"
        placeholder="—" value="${val != null ? val : ''}"
        ${dataAttrs}
        style="${own ? '' : 'color:var(--text3)'}" >
      <span class="metric-unit">${unit}</span>
    </div></div>`;
}

export function mBoxDual(mid, key, field, abbr, name, valKg, valPct) {
  const own = isOwnPage(mid);
  const fieldPct = field + '_pct';
  const dKg = own
    ? `data-action="track-inbody" data-mid="${esc(String(mid))}" data-key="${esc(key)}" data-field="${esc(field)}"`
    : 'readonly';
  const dPct = own
    ? `data-action="track-inbody" data-mid="${esc(String(mid))}" data-key="${esc(key)}" data-field="${esc(fieldPct)}"`
    : 'readonly';
  return `<div class="metric-box">
    <div class="metric-abbr">${abbr}</div>
    <div class="metric-full-name">${name}</div>
    <div class="metric-row">
      <input class="metric-input" type="number" step="0.1" inputmode="decimal"
        placeholder="—" value="${valKg != null ? valKg : ''}"
        ${dKg}
        style="${own ? '' : 'color:var(--text3)'}">
      <span class="metric-unit">kg</span>
    </div>
    <div class="metric-row" style="margin-top:5px">
      <input class="metric-input" type="number" step="0.1" inputmode="decimal"
        placeholder="—" value="${valPct != null ? valPct : ''}"
        ${dPct}
        style="${own ? '' : 'color:var(--text3)'}">
      <span class="metric-unit">%</span>
    </div></div>`;
}

export function overallScoreBox(mid, key, val) {
  const own = isOwnPage(mid);
  const v = val != null ? val : '';
  const pct = val != null ? Math.min(100, Math.max(0, val)) : 0;
  const numHtml =
    val != null
      ? `<span class="score-num">${val}</span><span class="score-denom">/100</span>`
      : `<span class="score-denom">—/100</span>`;
  const dataAttrs = own
    ? `data-action="track-overall" data-mid="${esc(String(mid))}" data-key="${esc(key)}"`
    : 'readonly';
  return `<div class="overall-score-box">
    <div class="overall-score-label">Overall Score</div>
    <div class="overall-score-row">
      <input class="overall-score-input" type="number" min="1" max="100" inputmode="numeric"
        placeholder="—" value="${v}"
        ${dataAttrs}
        style="${own ? '' : 'color:var(--text3)'}">
      <div class="overall-score-display" id="osd-${key}">${numHtml}</div>
      <div class="overall-score-bar-wrap">
        <div class="overall-score-bar" id="osb-${key}" style="width:${pct}%"></div>
      </div>
    </div>
  </div>`;
}

export function trackInBodyChange(memberId, monthKey, field, value) {
  if (!state.pendingInBody[memberId]) state.pendingInBody[memberId] = {};
  if (!state.pendingInBody[memberId][monthKey]) state.pendingInBody[memberId][monthKey] = {};
  const v = value.trim();
  const n = parseFloat(v);
  state.pendingInBody[memberId][monthKey][field] = isNaN(n) ? null : n;
}

export function trackOverallScore(memberId, monthKey, input) {
  let v = parseInt(input.value);
  if (isNaN(v) || v < 1) v = null;
  if (v > 100) {
    v = 100;
    input.value = 100;
  }
  const disp = document.getElementById('osd-' + monthKey);
  const bar = document.getElementById('osb-' + monthKey);
  if (disp)
    disp.innerHTML =
      v != null
        ? `<span class="score-num">${v}</span><span class="score-denom">/100</span>`
        : `<span class="score-denom">—/100</span>`;
  if (bar) bar.style.width = (v || 0) + '%';
  if (!state.pendingInBody[memberId]) state.pendingInBody[memberId] = {};
  if (!state.pendingInBody[memberId][monthKey]) state.pendingInBody[memberId][monthKey] = {};
  state.pendingInBody[memberId][monthKey]['overall'] = v;
}

export async function submitMonthData(memberId, monthKey, btn) {
  if (!isOwnPage(memberId)) {
    showToast('You can only edit your own page.');
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Submitting…';
  btn.classList.add('saving');
  try {
    const { data: row, error: fe } = await state.sb
      .from('members')
      .select('data')
      .eq('id', memberId)
      .single();
    if (fe) throw fe;
    const blob = row.data || {};
    if (!blob.monthData) blob.monthData = {};
    const monthPending = (state.pendingInBody[memberId] || {})[monthKey] || {};
    blob.monthData[monthKey] = { ...(blob.monthData[monthKey] || {}), ...monthPending };
    const { error } = await state.sb.from('members').update({ data: blob }).eq('id', memberId);
    if (error) throw error;
    localRefresh(memberId, blob);
    showToast('Submitted ✓');
  } catch (err) {
    showToast('Submit failed: ' + err.message);
  }
  btn.disabled = false;
  btn.textContent = 'Submit';
  btn.classList.remove('saving');
}

export async function saveMonthField(memberId, monthKey, field, value) {
  // Only used for photo URLs (auto-save on upload)
  const { data: row, error: fe } = await state.sb
    .from('members')
    .select('data')
    .eq('id', memberId)
    .single();
  if (fe) throw fe;
  const blob = row.data || {};
  if (!blob.monthData) blob.monthData = {};
  if (!blob.monthData[monthKey]) blob.monthData[monthKey] = {};
  blob.monthData[monthKey][field] = value;
  if (!state.pendingInBody[memberId]) state.pendingInBody[memberId] = {};
  if (!state.pendingInBody[memberId][monthKey]) state.pendingInBody[memberId][monthKey] = {};
  state.pendingInBody[memberId][monthKey][field] = value;
  const { error } = await state.sb.from('members').update({ data: blob }).eq('id', memberId);
  if (error) throw error;
  localRefresh(memberId, blob);
}

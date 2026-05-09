import { state } from './state.js';
import { COLORS } from './constants.js';
import { esc, ini, showToast } from './utils.js';
import { getPin } from './config.js';

// ── PIN gate ──
export function openManagerEntry() {
  document.getElementById('pinInput').value = '';
  document.getElementById('pinError').textContent = '';
  document.getElementById('pinModal').classList.add('open');
  setTimeout(() => document.getElementById('pinInput').focus(), 200);
}

export function closePinModal() {
  document.getElementById('pinModal').classList.remove('open');
}

export function pinInputChanged() {
  document.getElementById('pinError').textContent = '';
}

export function submitPin() {
  const entered = document.getElementById('pinInput').value.trim();
  if (entered === getPin()) {
    closePinModal();
    openManager();
  } else {
    document.getElementById('pinError').textContent = 'Incorrect PIN. Try again.';
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
  }
}

export function openManager() {
  document.getElementById('memberListPage').classList.remove('active');
  document.getElementById('memberDetailPage').classList.remove('active');
  document.getElementById('managerPage').classList.add('active');
  renderManagerPage();
}

export function closeManager() {
  document.getElementById('managerPage').classList.remove('active');
  document.getElementById('memberListPage').classList.add('active');
}

export function renderManagerPage() {
  const list = document.getElementById('mgrMemberList');
  if (!list) return;
  list.innerHTML = '';
  state.members.forEach((m, i) => {
    const fallbackColor = COLORS[i % COLORS.length].bg;
    const row = document.createElement('div');
    row.className = 'mgr-member-row';
    const bgStyle = m.cardBgUrl
      ? `background-image:url('${m.cardBgUrl}');background-color:${fallbackColor};background-size:cover;background-position:center`
      : `background-color:${fallbackColor}`;

    const avatarHtml = m.avatarUrl
      ? `<img src="${m.avatarUrl}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.4)">`
      : `<span style="width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#fff">${ini(m.name)}</span>`;
    row.innerHTML = `
      <div class="mgr-card-preview" style="${bgStyle}" id="mgr-preview-${m.id}">
        <div style="position:relative;z-index:2;display:flex;align-items:center;gap:8px;">
          ${avatarHtml}
          <div class="mgr-card-preview-name" style="color:rgba(255,255,255,0.95);text-shadow:0 1px 4px rgba(0,0,0,0.5)">${esc(m.name || '')}</div>
        </div>
      </div>
      <div class="mgr-card-controls">
        <div class="mgr-btns-row">
          <button class="mgr-photo-btn" data-action="pick-card-bg" data-mid="${esc(String(m.id))}">🖼 Card background<br><span style="font-size:10px;opacity:0.6">750 × 390 px</span></button>
          <button class="mgr-photo-btn" data-action="pick-avatar" data-mid="${esc(String(m.id))}">👤 Profile photo<br><span style="font-size:10px;opacity:0.6">400 × 400 px</span></button>
        </div>
        <div style="font-size:12px;color:var(--text3);padding:4px 0 2px;">
          ${m.google_email ? `🔗 ${esc(m.google_email)}` : '⚠ Not linked to a Google account yet'}
        </div>
      </div>`;
    list.appendChild(row);
  });
  if (!state.members.length)
    list.innerHTML =
      '<p style="color:var(--text3);font-size:14px;padding:8px 0;">No members yet.</p>';
  renderAchMgrList();
  renderAchMemberUnlocks();
}

export function pickCardBg(memberId) {
  state.avatarTargetMemberId = 'bg:' + memberId;
  document.getElementById('avatarInput').value = '';
  document.getElementById('avatarInput').click();
}

export function pickAvatar(memberId) {
  state.avatarTargetMemberId = memberId;
  document.getElementById('avatarInput').value = '';
  document.getElementById('avatarInput').click();
}

export function savePin() {
  const val = document.getElementById('newPinInput').value.trim();
  if (!/^\d{4,8}$/.test(val)) {
    showToast('PIN must be 4–8 digits');
    return;
  }
  localStorage.setItem('mgr_pin', val);
  document.getElementById('newPinInput').value = '';
  showToast('PIN updated!');
}

// ── Achievement manager UI (rendering) ──
export function renderAchMgrList() {
  const list = document.getElementById('achListMgr');
  if (!list) return;
  if (!state.achievements.length) {
    list.innerHTML =
      '<p style="color:var(--text3);font-size:13px;padding:4px 0 12px">No achievements yet.</p>';
    return;
  }
  list.innerHTML = state.achievements
    .map(
      (a) => `
    <div class="ach-mgr-row">
      <div class="ach-mgr-row-icon">${a.iconUrl ? `<img src="${a.iconUrl}" style="width:28px;height:28px;object-fit:contain;" alt="">` : '🏅'}</div>
      <div class="ach-mgr-row-info">
        <div class="ach-mgr-row-title">${esc(a.title || '')}</div>
        <div class="ach-mgr-row-sub rarity-${a.rarity || 'common'}">${a.rarity || 'common'}${a.narrative ? ' · ' + esc(a.narrative) : ''}</div>
      </div>
      <button class="ach-delete-btn" data-action="delete-achievement" data-aid="${esc(String(a.id))}">Delete</button>
    </div>`,
    )
    .join('');
}

export function renderAchMemberUnlocks() {
  const container = document.getElementById('achMemberUnlocks');
  if (!container || !state.achievements.length || !state.members.length) {
    if (container) container.innerHTML = '';
    return;
  }
  let html = '<div class="mgr-section-title" style="margin-top:24px;">Member Achievements</div>';
  state.members.forEach((m) => {
    const unlocked = m.unlockedAchievements || {};
    html += `<div class="ach-member-section">
      <div class="ach-member-section-title">${esc(m.name || '')}</div>`;
    state.achievements.forEach((a) => {
      const isOn = !!unlocked[a.id];
      html += `<div class="ach-toggle-row">
        <div class="ach-toggle-icon">${a.iconUrl ? `<img src="${a.iconUrl}" style="width:24px;height:24px;object-fit:contain;" alt="">` : '🏅'}</div>
        <div class="ach-toggle-info">
          <div class="ach-toggle-title">${esc(a.title || '')}</div>
          <div class="ach-toggle-sub rarity-${a.rarity || 'common'}">${a.rarity || 'common'}</div>
        </div>
        <button class="ach-toggle-btn ${isOn ? 'on' : 'off'}" data-action="toggle-ach" data-mid="${esc(String(m.id))}" data-aid="${esc(String(a.id))}"></button>
      </div>`;
    });
    html += '</div>';
  });
  container.innerHTML = html;
}

import { state } from './state.js';
import { COLORS, MONTHS } from './constants.js';
import { esc, ini, calcAge, fmtD, showToast, closeModal } from './utils.js';
import { renderMonths } from './inbody.js';
import { renderCalendar } from './calendar.js';
import { renderAchievements } from './achievements.js';
import { localRefresh } from './supabase-client.js';

export function getLatestOverall(m) {
  const md = m.monthData || {};
  for (let i = MONTHS.length - 1; i >= 0; i--) {
    const d = md[MONTHS[i].key];
    if (d && d.overall != null) return d.overall;
  }
  return null;
}

export function renderMemberList() {
  const scroll = document.getElementById('memberListScroll');
  const empty = document.getElementById('memberListEmpty');
  scroll.innerHTML = '';
  if (!state.members.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  const sorted = [...state.members].sort((a, b) => {
    const sa = getLatestOverall(a),
      sb = getLatestOverall(b);
    if (sa == null && sb == null) return 0;
    if (sa == null) return 1;
    if (sb == null) return -1;
    return sb - sa;
  });
  sorted.forEach((m, i) => {
    const fallbackColor = COLORS[i % COLORS.length].bg;
    const hasImg = !!m.cardBgUrl;
    const textColor = 'rgba(255,255,255,0.95)';
    const tagBg = 'rgba(0,0,0,0.25)';

    const el = document.createElement('div');
    el.className = 'member-card';

    const age = m.birthday ? calcAge(m.birthday) : null;
    const latestScore = getLatestOverall(m);
    const tags = [age ? `${age} yrs` : '', m.height ? `${m.height} cm` : '']
      .filter(Boolean)
      .map((t) => `<span class="member-card-tag" style="background:${tagBg}">${t}</span>`)
      .join('');
    const scoreBadge =
      latestScore != null
        ? `<span class="member-card-tag" style="background:rgba(200,245,90,0.25);color:#c8f55a;font-weight:700">${latestScore}/100</span>`
        : '';

    const now = new Date();
    const curKey = now.getFullYear() + '-' + String(now.getMonth()).padStart(2, '0');
    const curMonthName = now.toLocaleDateString('en-US', { month: 'long' });
    const hasPhoto = !!((m.monthData || {})[curKey] || {}).photoUrl;
    const inbodyBadge = `<div class="member-card-inbody ${hasPhoto ? 'submitted' : 'awaiting'}">
      ${
        hasPhoto
          ? `<svg fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>`
          : `<svg fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 20h20L12 2z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.8" fill="#f97316"/></svg>`
      }
      ${hasPhoto ? 'Submitted' : 'Awaiting'} · ${curMonthName}
    </div>`;

    const bgStyle = hasImg
      ? `background-image:url('${m.cardBgUrl}');background-color:${fallbackColor}`
      : `background-color:${fallbackColor}`;

    el.innerHTML = `
      <div class="member-card-bg" style="${bgStyle}"></div>
      <div class="member-card-content" style="color:${textColor}">
        <div>
          <div class="member-card-name">${esc(m.name || '')}</div>
          ${inbodyBadge}
        </div>
        <div class="member-card-meta">${tags}${scoreBadge}</div>
      </div>`;
    el.onclick = () => openMember(m.id);
    scroll.appendChild(el);
  });
}

export function openMember(id) {
  state.currentMemberId = id;
  const m = state.members.find((x) => x.id === id);
  if (!m) return;
  state.pendingInBody[id] = JSON.parse(JSON.stringify(m.monthData || {}));
  state.pendingWorkouts[id] = JSON.parse(JSON.stringify(m.workouts || {}));
  document.getElementById('memberListPage').classList.remove('active');
  document.getElementById('memberDetailPage').classList.add('active');
  switchTab('inbody');
  renderMemberDetail(m);
}

export function renderMemberDetail(m) {
  const i = state.members.findIndex((x) => x.id === m.id);
  const c = COLORS[i % COLORS.length];
  document.getElementById('detailTitle').textContent = m.name || '';
  const avatarHtml = m.avatarUrl ? `<img src="${m.avatarUrl}" alt="">` : ini(m.name);
  document.getElementById('profileHero').innerHTML = `
    <div class="profile-avatar" style="${m.avatarUrl ? '' : 'background:' + c.bg + ';color:' + c.fg}">${avatarHtml}</div>
    <div><div class="profile-name">${esc(m.name || '')}</div>
    <div class="profile-tags">
      ${m.birthday ? `<div class="profile-tag">🎂 <span>${fmtD(m.birthday)}</span></div>` : ''}
      <div class="profile-tag">Age <span>${calcAge(m.birthday)}</span></div>
      ${m.height ? `<div class="profile-tag">Height <span>${m.height} cm</span></div>` : ''}
    </div></div>`;
  if (state.currentTab === 'inbody') renderMonths(m);
  else renderCalendar(m);
}

export function switchTab(tab) {
  state.currentTab = tab;
  document.getElementById('tabInBodyBtn').classList.toggle('active', tab === 'inbody');
  document.getElementById('tabCalBtn').classList.toggle('active', tab === 'calendar');
  document.getElementById('tabAchBtn').classList.toggle('active', tab === 'achievements');
  document.getElementById('tabInBody').classList.toggle('active', tab === 'inbody');
  document.getElementById('tabCalendar').classList.toggle('active', tab === 'calendar');
  document.getElementById('tabAch').classList.toggle('active', tab === 'achievements');
  const m = state.members.find((x) => x.id === state.currentMemberId);
  if (!m) return;
  if (tab === 'inbody') renderMonths(m);
  else if (tab === 'achievements') renderAchievements(m);
  else {
    const now = new Date();
    const idx = MONTHS.findIndex(
      (mo) => mo.year === now.getFullYear() && mo.month === now.getMonth(),
    );
    state.calMonthIdx = idx >= 0 ? idx : 0;
    renderCalendar(m);
  }
}

// ── Member CRUD ──
export function openAddMember() {
  state.editingMemberId = null;
  document.getElementById('memberModalTitle').textContent = 'Add member';
  document.getElementById('memberSaveBtn').textContent = 'Add';
  document.getElementById('fName').value = '';
  document.getElementById('fBirthday').value = '';
  document.getElementById('fHeight').value = '';
  document.getElementById('deleteRow').classList.add('hidden');
  document.getElementById('memberModal').classList.add('open');
  setTimeout(() => document.getElementById('fName').focus(), 150);
}

export function openEditMember() {
  const m = state.members.find((x) => x.id === state.currentMemberId);
  if (!m) return;
  state.editingMemberId = m.id;
  document.getElementById('memberModalTitle').textContent = 'Edit member';
  document.getElementById('memberSaveBtn').textContent = 'Save';
  document.getElementById('fName').value = m.name || '';
  document.getElementById('fBirthday').value = m.birthday || '';
  document.getElementById('fHeight').value = m.height || '';
  document.getElementById('deleteRow').classList.remove('hidden');
  document.getElementById('memberModal').classList.add('open');
}

export async function saveMember() {
  const name = document.getElementById('fName').value.trim();
  if (!name) {
    document.getElementById('fName').focus();
    return;
  }
  const birthday = document.getElementById('fBirthday').value;
  const height = document.getElementById('fHeight').value;
  closeModal('memberModal');
  try {
    if (state.editingMemberId) {
      const { data: row } = await state.sb
        .from('members')
        .select('data')
        .eq('id', state.editingMemberId)
        .single();
      const blob = row ? row.data || {} : {};
      blob.name = name;
      blob.birthday = birthday;
      blob.height = height;
      await state.sb.from('members').update({ data: blob }).eq('id', state.editingMemberId);
      localRefresh(state.editingMemberId, blob);
      showToast('Profile updated');
    } else {
      await state.sb
        .from('members')
        .insert({ data: { name, birthday, height, monthData: {}, workouts: {} } });
      showToast('Member added!');
    }
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

export async function deleteMember() {
  if (!state.editingMemberId) return;
  if (!confirm('Delete this member? This cannot be undone.')) return;
  closeModal('memberModal');
  try {
    await state.sb.from('members').delete().eq('id', state.editingMemberId);
    goBack();
    showToast('Member deleted');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

// ── Navigation ──
export function goBack() {
  state.currentMemberId = null;
  document.getElementById('memberDetailPage').classList.remove('active');
  document.getElementById('memberListPage').classList.add('active');
}

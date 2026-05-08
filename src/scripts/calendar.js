import { state } from './state.js';
import { MONTHS } from './constants.js';
import { isOwnPage } from './auth.js';
import { showToast } from './utils.js';
import { localRefresh } from './supabase-client.js';

export function calPrev() {
  if (state.calMonthIdx > 0) {
    state.calMonthIdx--;
    const m = state.members.find((x) => x.id === state.currentMemberId);
    if (m) renderCalendar(m);
  }
}

export function calNext() {
  if (state.calMonthIdx < MONTHS.length - 1) {
    state.calMonthIdx++;
    const m = state.members.find((x) => x.id === state.currentMemberId);
    if (m) renderCalendar(m);
  }
}

export function renderCalendar(m) {
  if (!state.pendingWorkouts[m.id])
    state.pendingWorkouts[m.id] = JSON.parse(JSON.stringify(m.workouts || {}));
  renderCalendarFromPending(m);
}

export function renderCalendarFromPending(m) {
  const container = document.getElementById('calContainer');
  const workouts = state.pendingWorkouts[m.id] || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { year, month, label } = MONTHS[state.calMonthIdx];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  let workedCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (d <= today) {
      const dk = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (workouts[dk]) workedCount++;
    }
  }

  document.getElementById('calNavMonth').textContent = label;
  const countEl = document.getElementById('calNavCount');
  countEl.textContent = `${workedCount}/${daysInMonth}`;
  countEl.className = 'cal-nav-count' + (workedCount === 0 ? ' zero' : '');

  document.querySelector('.cal-nav-btn:first-child').style.opacity =
    state.calMonthIdx === 0 ? '0.3' : '1';
  document.querySelector('.cal-nav-btn:last-child').style.opacity =
    state.calMonthIdx === MONTHS.length - 1 ? '0.3' : '1';

  let html = '<div class="cal-grid">';
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d) => {
    html += `<div class="cal-day-label">${d}</div>`;
  });
  for (let e = 0; e < firstDow; e++) html += `<div class="cal-day empty"></div>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const d = new Date(year, month, day);
    const isFuture = d > today;
    const isToday = d.getTime() === today.getTime();
    const workedOut = workouts[dateKey] === 1;
    const inbodyDay = workouts[dateKey] === 2;
    let cls = 'cal-day';
    if (isFuture) cls += ' future';
    else if (inbodyDay) cls += ' inbody-day';
    else if (workedOut) cls += ' worked-out';
    else cls += ' past-none';
    if (isToday) cls += ' today';
    const dataAttrs =
      isFuture || !isOwnPage(m.id)
        ? ''
        : `data-action="cal-day" data-mid="${m.id}" data-date="${dateKey}" data-day="${day}"`;
    html += `<div class="${cls}" ${dataAttrs}>${day}</div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

// ── Check-in popup ──
export function showCheckinPopup(memberId, dateKey, day, el) {
  state.checkinCtx = { memberId, dateKey, el };
  const parts = dateKey.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  document.getElementById('checkinDateLabel').textContent = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  document.getElementById('checkinPopup').classList.add('open');
}

export function closeCheckinPopup() {
  document.getElementById('checkinPopup').classList.remove('open');
  state.checkinCtx = null;
}

export async function applyCheckin(action) {
  if (!state.checkinCtx) return;
  const { memberId, dateKey, el } = state.checkinCtx;
  closeCheckinPopup();
  if (!state.pendingWorkouts[memberId]) state.pendingWorkouts[memberId] = {};
  if (action === 'checkin') {
    state.pendingWorkouts[memberId][dateKey] = 1;
    el.classList.remove('past-none', 'inbody-day');
    el.classList.add('worked-out');
  } else if (action === 'inbody') {
    state.pendingWorkouts[memberId][dateKey] = 2;
    el.classList.remove('past-none', 'worked-out');
    el.classList.add('inbody-day');
  } else {
    delete state.pendingWorkouts[memberId][dateKey];
    el.classList.remove('worked-out', 'inbody-day');
    el.classList.add('past-none');
  }
  updateCalCount(memberId);
  try {
    const { data: row, error: fe } = await state.sb
      .from('members')
      .select('data')
      .eq('id', memberId)
      .single();
    if (fe) throw fe;
    const blob = row.data || {};
    blob.workouts = state.pendingWorkouts[memberId] || {};
    const { error } = await state.sb.from('members').update({ data: blob }).eq('id', memberId);
    if (error) throw error;
    localRefresh(memberId, blob);
  } catch (err) {
    showToast('Save failed: ' + err.message);
  }
}

export function updateCalCount(memberId) {
  const workouts = state.pendingWorkouts[memberId] || {};
  const { year, month } = MONTHS[state.calMonthIdx];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workedCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (d <= today) {
      const dk = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (workouts[dk]) workedCount++;
    }
  }
  const countEl = document.getElementById('calNavCount');
  if (countEl) {
    countEl.textContent = `${workedCount}/${daysInMonth}`;
    countEl.className = 'cal-nav-count' + (workedCount === 0 ? ' zero' : '');
  }
}

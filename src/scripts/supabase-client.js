import { createClient } from '@supabase/supabase-js';
import { state } from './state.js';
import { showCfgErr } from './config.js';
import { showToast } from './utils.js';
import { hideSplashNow } from './splash.js';
import { showLoginPage, openBindMemberModal } from './auth.js';
import { renderMemberList, renderMemberDetail } from './members.js';
import { renderAchievements } from './achievements.js';
import { renderAchMgrList, renderAchMemberUnlocks } from './manager.js';
import { renderMonths } from './inbody.js';
import { renderCalendarFromPending } from './calendar.js';

export function connectSupabase() {
  const url = document.getElementById('cfgUrl').value.trim();
  const key = document.getElementById('cfgKey').value.trim();
  document.getElementById('cfgError').style.display = 'none';
  if (!url || !key) {
    showCfgErr('Both fields are required.');
    return;
  }
  if (!url.startsWith('https://')) {
    showCfgErr('Project URL must start with https://');
    return;
  }
  localStorage.setItem('sb_cfg', JSON.stringify({ url, key }));
  initSb({ url, key });
}

export function initSb(cfg) {
  document.getElementById('configScreen').classList.remove('show');
  const splashStatus = document.getElementById('splashStatus');
  if (splashStatus) splashStatus.textContent = 'Connecting…';
  const splashStart = Date.now();

  const t = setTimeout(() => {
    hideSplashNow(() => {
      showCfgErr('Timed out. Check your URL/key and internet.');
      document.getElementById('configScreen').classList.add('show');
    });
  }, 10000);

  try {
    state.sb = createClient(cfg.url, cfg.key);
    state.sb
      .from('members')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        clearTimeout(t);
        if (error) {
          hideSplashNow(() => {
            let msg = 'Error: ' + error.message;
            if (error.message.includes('relation') || error.message.includes('does not exist')) {
              msg += ' — Make sure you created the "members" table.';
            }
            showCfgErr(msg);
            document.getElementById('configScreen').classList.add('show');
          });
          return;
        }
        if (splashStatus) splashStatus.textContent = 'Loading data…';
        loadMembers().then(async () => {
          await loadAchievements();
          subscribeRT();
          subscribeAchievementsRT();

          // Resolve auth state from existing Supabase session (PWA reopen,
          // OAuth redirect-back). SDK auto-persists session via localStorage.
          let pendingBindSession = null;
          const {
            data: { session },
          } = await state.sb.auth.getSession();
          if (session?.user) {
            const matched = state.members.find((m) => m.auth_user_id === session.user.id);
            if (matched) {
              state.loggedInMemberId = matched.id;
              applyLoggedInUI();
            } else {
              pendingBindSession = session;
            }
          }

          // Listen for future auth events (post-OAuth-redirect SIGNED_IN, SIGNED_OUT).
          state.sb.auth.onAuthStateChange(async (event, sess) => {
            if (event === 'SIGNED_IN' && sess?.user) {
              const matched = state.members.find((m) => m.auth_user_id === sess.user.id);
              if (matched) {
                state.loggedInMemberId = matched.id;
                applyLoggedInUI();
              } else {
                openBindMemberModal(sess);
              }
            }
          });

          hideSplashNow(() => {
            if (!state.loggedInMemberId) {
              showLoginPage();
              if (pendingBindSession) openBindMemberModal(pendingBindSession);
            }
          }, splashStart);
        });
      });
  } catch (err) {
    clearTimeout(t);
    hideSplashNow(() => {
      showCfgErr('Init error: ' + err.message);
      document.getElementById('configScreen').classList.add('show');
    });
  }
}

export async function loadMembers() {
  const { data, error } = await state.sb.from('members').select('*').order('created_at');
  if (error) {
    showToast('Load error: ' + error.message);
    return;
  }
  state.members = (data || []).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    ...(r.data || {}),
  }));

  // If already logged in (e.g., realtime update), keep current view in sync.
  if (state.loggedInMemberId) {
    applyLoggedInUI();
  }
  return true;
}

function applyLoggedInUI() {
  document.getElementById('loginPage').classList.remove('show');
  document.getElementById('app').classList.add('visible');
  renderMemberList();
  if (state.currentMemberId) {
    const m = state.members.find((x) => x.id === state.currentMemberId);
    if (m) renderMemberDetail(m);
  }
}

export async function loadAchievements() {
  try {
    const { data, error } = await state.sb.from('achievements').select('*').order('created_at');
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) return;
      console.warn('Achievements load error:', error.message);
      return;
    }
    state.achievements = (data || []).map((r) => ({ id: r.id, ...(r.data || {}) }));
  } catch (e) {
    console.warn('loadAchievements:', e);
  }
}

export function subscribeAchievementsRT() {
  if (state.realtimeAchCh) state.realtimeAchCh.unsubscribe();
  state.realtimeAchCh = state.sb
    .channel('ach-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, async () => {
      await loadAchievements();
      if (state.currentMemberId && state.currentTab === 'achievements') {
        const m = state.members.find((x) => x.id === state.currentMemberId);
        if (m) renderAchievements(m);
      }
      renderAchMgrList();
      renderAchMemberUnlocks();
    })
    .subscribe();
}

export function subscribeRT() {
  if (state.realtimeCh) state.realtimeCh.unsubscribe();
  state.realtimeCh = state.sb
    .channel('members-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadMembers())
    .subscribe();
}

// Apply a saved blob to local state and re-render immediately, no network round-trip
export function localRefresh(memberId, newBlob) {
  const idx = state.members.findIndex((x) => x.id === memberId);
  if (idx < 0) return;
  Object.assign(state.members[idx], newBlob);
  renderMemberList();
  if (state.currentMemberId === memberId) {
    const m = state.members[idx];
    if (state.currentTab === 'inbody') renderMonths(m);
    else renderCalendarFromPending(m);
  }
}

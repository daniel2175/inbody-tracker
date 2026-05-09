import { state } from './state.js';
import { renderMemberList } from './members.js';
import { closeModal } from './utils.js';

export function showLoginPage() {
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  errEl.classList.remove('show');
  document.getElementById('loginPage').classList.add('show');
}

export async function loginWithGoogle() {
  const errEl = document.getElementById('loginError');
  errEl.classList.remove('show');
  if (!state.sb) {
    errEl.textContent = 'Not connected to Supabase yet.';
    errEl.classList.add('show');
    return;
  }
  const { error } = await state.sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) {
    errEl.textContent = 'Google login failed: ' + error.message;
    errEl.classList.add('show');
  }
}

export function openBindMemberModal(session) {
  state.pendingAuthSession = session;
  const sel = document.getElementById('bindMemberSelect');
  sel.innerHTML = '<option value="">Select your name…</option>';
  state.members
    .filter((m) => !m.auth_user_id)
    .forEach((m) => {
      const opt = document.createElement('option');
      opt.value = String(m.id);
      opt.textContent = m.name || '(unnamed)';
      sel.appendChild(opt);
    });
  const sub = document.getElementById('bindMemberSub');
  if (sub && session?.user?.email) {
    sub.textContent = `Signed in as ${session.user.email}. Select your name to link this account.`;
  }
  const errEl = document.getElementById('bindMemberError');
  errEl.textContent = '';
  errEl.classList.remove('show');
  document.getElementById('bindMemberModal').classList.add('open');
}

export async function confirmBindMember() {
  const errEl = document.getElementById('bindMemberError');
  function showErr(msg) {
    errEl.textContent = msg;
    errEl.classList.add('show');
  }
  errEl.classList.remove('show');

  const memberId = document.getElementById('bindMemberSelect').value;
  if (!memberId) {
    showErr('Please select your name.');
    return;
  }
  const session = state.pendingAuthSession;
  if (!session?.user?.id) {
    showErr('Session expired. Please sign in again.');
    return;
  }
  try {
    const { data: row, error: selErr } = await state.sb
      .from('members')
      .select('data')
      .eq('id', memberId)
      .single();
    if (selErr) throw selErr;
    const blob = (row && row.data) || {};
    blob.auth_user_id = session.user.id;
    blob.google_email = session.user.email || null;
    const { error: upErr } = await state.sb
      .from('members')
      .update({ data: blob })
      .eq('id', memberId);
    if (upErr) throw upErr;
    const localM = state.members.find((x) => String(x.id) === String(memberId));
    if (localM) Object.assign(localM, blob);
    state.pendingAuthSession = null;
    closeModal('bindMemberModal');
    enterApp(memberId);
  } catch (err) {
    showErr('Error: ' + err.message);
  }
}

export async function cancelBindMember() {
  state.pendingAuthSession = null;
  closeModal('bindMemberModal');
  if (state.sb) await state.sb.auth.signOut();
}

function enterApp(memberId) {
  state.loggedInMemberId = memberId;
  document.getElementById('loginPage').classList.remove('show');
  document.getElementById('app').classList.add('visible');
  renderMemberList();
}

export async function logout() {
  if (state.sb) await state.sb.auth.signOut();
  state.loggedInMemberId = null;
  state.currentMemberId = null;
  document.getElementById('memberDetailPage').classList.remove('active');
  document.getElementById('managerPage').classList.remove('active');
  document.getElementById('memberListPage').classList.add('active');
  document.getElementById('app').classList.remove('visible');
  showLoginPage();
}

export function isOwnPage(memberId) {
  if (!state.loggedInMemberId) return false;
  return String(state.loggedInMemberId).trim() === String(memberId).trim();
}

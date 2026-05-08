import { state } from './state.js';
import { renderMemberList } from './members.js';

export function showLoginPage() {
  const sel = document.getElementById('loginSelect');
  sel.innerHTML = '<option value="">Select your name…</option>';
  state.members.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = String(m.id);
    opt.textContent = m.name || '(unnamed)';
    sel.appendChild(opt);
  });
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginPage').classList.add('show');
}

export function togglePwVisibility() {
  const inp = document.getElementById('loginPassword');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML =
      '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    inp.type = 'password';
    icon.innerHTML =
      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

export function attemptLogin() {
  const sel = document.getElementById('loginSelect');
  const memberId = sel.value;
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  function showErr(msg) {
    errEl.textContent = msg;
    errEl.classList.add('show');
  }
  errEl.classList.remove('show');
  if (!memberId) {
    showErr('Please select your name.');
    return;
  }
  const m = state.members.find((x) => String(x.id) === String(memberId));
  if (!m) {
    showErr('Account not found. Please try again.');
    return;
  }
  const correctPw = String(m.password || '1234');
  if (String(password) !== correctPw) {
    showErr('Incorrect password.');
    return;
  }
  state.loggedInMemberId = m.id;
  document.getElementById('loginPage').classList.remove('show');
  document.getElementById('app').classList.add('visible');
  renderMemberList();
}

export function logout() {
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

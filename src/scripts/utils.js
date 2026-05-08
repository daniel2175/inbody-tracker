// Generic helpers — pure functions, no DOM/Supabase deps except showToast.

export function ini(n) {
  return (n || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function calcAge(b) {
  if (!b) return '—';
  const bd = new Date(b + 'T00:00:00');
  const t = new Date();
  let a = t.getFullYear() - bd.getFullYear();
  if (t < new Date(t.getFullYear(), bd.getMonth(), bd.getDate())) a--;
  return a;
}

export function fmtD(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// IMPORTANT: month/date logic preserved verbatim from original index.html.
// Do NOT modify in Phase 1 — see implementation-considerations §3.

export const COLORS = [
  { bg: '#c8f55a', fg: '#0e0e0f' }, // lime green
  { bg: '#b8a9f0', fg: '#1a1040' }, // soft purple
  { bg: '#f0c87a', fg: '#2a1a00' }, // warm yellow
  { bg: '#7ad4f0', fg: '#001a28' }, // sky blue
  { bg: '#f09ab0', fg: '#2a0010' }, // rose pink
  { bg: '#7af0c8', fg: '#002a1a' }, // mint
  { bg: '#f0a87a', fg: '#2a1000' }, // peach
];

export const MONTHS = [];
for (let i = 0; i < 36; i++) {
  const d = new Date(2026, 3 + i, 1);
  MONTHS.push({
    key: d.getFullYear() + '-' + String(d.getMonth()).padStart(2, '0'),
    label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    year: d.getFullYear(),
    month: d.getMonth(),
  });
}

export const DEFAULT_PIN = '1234';
export const CAL_START = new Date(2026, 3, 1); // April 2026

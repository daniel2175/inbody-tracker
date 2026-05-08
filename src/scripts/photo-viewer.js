import { state } from './state.js';

function applyTransform() {
  const img = document.getElementById('viewerImg');
  const canvas = document.getElementById('viewerCanvas');
  if (!img || !canvas) return;
  const cw = canvas.clientWidth,
    ch = canvas.clientHeight;
  const iw = img.naturalWidth || img.clientWidth,
    ih = img.naturalHeight || img.clientHeight;
  const scaledW = Math.min(cw, iw) * state.vScale,
    scaledH = Math.min(ch, ih) * state.vScale;
  const maxX = Math.max(0, (scaledW - cw) / 2);
  const maxY = Math.max(0, (scaledH - ch) / 2);
  state.vTransX = Math.max(-maxX, Math.min(maxX, state.vTransX));
  state.vTransY = Math.max(-maxY, Math.min(maxY, state.vTransY));
  img.style.transform = `translate(${state.vTransX}px,${state.vTransY}px) scale(${state.vScale})`;
  const label = document.getElementById('viewerZoomLabel');
  if (label) label.textContent = state.vScale.toFixed(1) + '×';
}

export function viewerZoom(delta) {
  state.vScale = Math.max(state.vMinScale, Math.min(state.vMaxScale, state.vScale + delta));
  if (state.vScale === state.vMinScale) {
    state.vTransX = 0;
    state.vTransY = 0;
  }
  applyTransform();
}

function resetZoom() {
  state.vScale = state.vMinScale;
  state.vTransX = 0;
  state.vTransY = 0;
  const img = document.getElementById('viewerImg');
  if (img) img.style.transform = '';
  const label = document.getElementById('viewerZoomLabel');
  if (label) label.textContent = '1×';
}

function dist(t) {
  return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
}

export function setupViewer() {
  const canvas = document.getElementById('viewerCanvas');
  if (!canvas || canvas._viewerReady) return;
  canvas._viewerReady = true;

  canvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 2) {
        state.vIsPinching = true;
        state.vLastDist = dist(e.touches);
        e.preventDefault();
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - state.vLastTap < 300) {
          state.vScale === state.vMinScale ? viewerZoom(2) : resetZoom();
        }
        state.vLastTap = now;
        state.vIsDragging = true;
        state.vDragStartX = e.touches[0].clientX;
        state.vDragStartY = e.touches[0].clientY;
        state.vDragOriginX = state.vTransX;
        state.vDragOriginY = state.vTransY;
      }
    },
    { passive: false },
  );

  canvas.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
      if (e.touches.length === 2 && state.vIsPinching) {
        const d = dist(e.touches);
        const ratio = d / state.vLastDist;
        state.vScale = Math.max(state.vMinScale, Math.min(state.vMaxScale, state.vScale * ratio));
        state.vLastDist = d;
        applyTransform();
      } else if (e.touches.length === 1 && state.vIsDragging && state.vScale > 1) {
        state.vTransX = state.vDragOriginX + (e.touches[0].clientX - state.vDragStartX);
        state.vTransY = state.vDragOriginY + (e.touches[0].clientY - state.vDragStartY);
        applyTransform();
      }
    },
    { passive: false },
  );

  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) state.vIsPinching = false;
    if (e.touches.length === 0) state.vIsDragging = false;
  });

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      viewerZoom(delta);
    },
    { passive: false },
  );

  canvas.addEventListener('mousedown', (e) => {
    state.vIsDragging = true;
    state.vDragStartX = e.clientX;
    state.vDragStartY = e.clientY;
    state.vDragOriginX = state.vTransX;
    state.vDragOriginY = state.vTransY;
    canvas.classList.add('grabbing');
  });
  window.addEventListener('mousemove', (e) => {
    if (!state.vIsDragging) return;
    state.vTransX = state.vDragOriginX + (e.clientX - state.vDragStartX);
    state.vTransY = state.vDragOriginY + (e.clientY - state.vDragStartY);
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    state.vIsDragging = false;
    canvas.classList.remove('grabbing');
  });
}

export function closePhotoViewer() {
  document.getElementById('photoViewer').classList.remove('open');
  resetZoom();
}

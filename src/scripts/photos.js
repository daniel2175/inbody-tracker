import { state } from './state.js';
import { isOwnPage } from './auth.js';
import { showToast } from './utils.js';
import { saveMonthField, renderMonths } from './inbody.js';
import { localRefresh } from './supabase-client.js';
import { renderManagerPage } from './manager.js';
import { closePhotoViewer } from './photo-viewer.js';

export function triggerUploadReport(memberId, monthKey) {
  if (!isOwnPage(memberId)) {
    showToast('You can only edit your own page.');
    return;
  }
  state.photoCtx = { memberId, monthKey };
  document.getElementById('fileInput').value = '';
  document.getElementById('fileInput').click();
}

export async function deletePhoto(memberId, monthKey) {
  if (!isOwnPage(memberId)) {
    showToast('You can only edit your own page.');
    return;
  }
  if (!confirm('Delete this report photo?')) return;
  try {
    const { data: row, error: fe } = await state.sb
      .from('members')
      .select('data')
      .eq('id', memberId)
      .single();
    if (fe) throw fe;
    const blob = row.data || {};
    if (!blob.monthData) blob.monthData = {};
    if (!blob.monthData[monthKey]) blob.monthData[monthKey] = {};
    blob.monthData[monthKey].photoUrl = null;
    if (state.pendingInBody[memberId] && state.pendingInBody[memberId][monthKey])
      state.pendingInBody[memberId][monthKey].photoUrl = null;
    const { error } = await state.sb.from('members').update({ data: blob }).eq('id', memberId);
    if (error) throw error;
    localRefresh(memberId, blob);
    showToast('Photo deleted');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

export function photoClick() {
  // Tap on photo preview is a no-op — use the buttons to upload/delete
}

export function triggerChangePhoto() {
  closePhotoViewer();
  if (state.viewerCtx) {
    state.photoCtx = { ...state.viewerCtx };
    setTimeout(() => {
      document.getElementById('fileInput').value = '';
      document.getElementById('fileInput').click();
    }, 300);
  }
}

export async function handleFileSelected(e) {
  const file = e.target.files[0];
  if (!file || !state.photoCtx) return;
  const { memberId, monthKey } = state.photoCtx;
  const slot = document.getElementById('ps-' + monthKey);
  if (slot)
    slot.innerHTML = `<div class="photo-uploading"><div class="spinner"></div><span>Uploading…</span></div>`;
  try {
    const blob = await compressImage(file, 1200, 0.82);
    const path = `${memberId}/${monthKey}_${Date.now()}.jpg`;
    const { error: upErr } = await state.sb.storage
      .from('inbody-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (upErr) throw upErr;
    const { data: urlData } = state.sb.storage.from('inbody-photos').getPublicUrl(path);
    await saveMonthField(memberId, monthKey, 'photoUrl', urlData.publicUrl);
    showToast('Photo saved!');
  } catch (err) {
    console.error(err);
    showToast('Upload failed: ' + err.message);
    const m = state.members.find((x) => x.id === memberId);
    if (m) renderMonths(m);
  }
  state.photoCtx = null;
}

export async function handleAvatarSelected(e) {
  const file = e.target.files[0];
  if (!file || !state.avatarTargetMemberId) return;
  const target = String(state.avatarTargetMemberId);
  let memberId, fieldName, maxPx, prefix, label;
  if (target.startsWith('bg:')) {
    memberId = target.slice(3);
    fieldName = 'cardBgUrl';
    maxPx = 1200;
    prefix = 'cardbg';
    label = 'Card background updated!';
  } else {
    memberId = target;
    fieldName = 'avatarUrl';
    maxPx = 400;
    prefix = 'avatars';
    label = 'Profile photo updated!';
  }
  showToast('Uploading…');
  try {
    const blob = await compressImage(file, maxPx, 0.88);
    const path = `${prefix}/${memberId}_${Date.now()}.jpg`;
    const { error: upErr } = await state.sb.storage
      .from('inbody-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (upErr) throw upErr;
    const { data: urlData } = state.sb.storage.from('inbody-photos').getPublicUrl(path);
    const { data: row } = await state.sb.from('members').select('data').eq('id', memberId).single();
    const blobData = row ? row.data || {} : {};
    blobData[fieldName] = urlData.publicUrl;
    await state.sb.from('members').update({ data: blobData }).eq('id', memberId);
    localRefresh(memberId, blobData);
    showToast(label);
    renderManagerPage();
  } catch (err) {
    showToast('Failed: ' + err.message);
  }
  state.avatarTargetMemberId = null;
}

export function compressImage(file, maxPx, quality) {
  return new Promise((res, rej) => {
    const img = new Image(),
      url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width: w, height: h } = img;
      if (w > maxPx || h > maxPx) {
        if (w > h) {
          h = Math.round((h * maxPx) / w);
          w = maxPx;
        } else {
          w = Math.round((w * maxPx) / h);
          h = maxPx;
        }
      }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob((b) => (b ? res(b) : rej(new Error('Compress failed'))), 'image/jpeg', quality);
    };
    img.onerror = rej;
    img.src = url;
  });
}

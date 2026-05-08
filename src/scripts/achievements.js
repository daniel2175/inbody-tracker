import { state } from './state.js';
import { esc, showToast } from './utils.js';
import { renderAchMgrList, renderAchMemberUnlocks } from './manager.js';
import { loadAchievements } from './supabase-client.js';

export function renderAchievements(m) {
  const wrapper = document.getElementById('achWrapper');
  if (!wrapper) return;
  if (!state.achievements.length) {
    wrapper.innerHTML =
      '<div class="ach-empty">No achievements yet.<br>The manager can add them in the manager page.</div>';
    return;
  }
  const unlocked = m.unlockedAchievements || {};
  const rarityOrder = { mythic: 0, legendary: 1, epic: 2, rare: 3, uncommon: 4, common: 5 };
  const sorted = [...state.achievements].sort((a, b) => {
    const au = !!unlocked[a.id],
      bu = !!unlocked[b.id];
    if (au && !bu) return -1;
    if (!au && bu) return 1;
    return (rarityOrder[a.rarity] || 5) - (rarityOrder[b.rarity] || 5);
  });
  wrapper.innerHTML = '';
  sorted.forEach((a) => {
    const isUnlocked = !!unlocked[a.id];
    const card = document.createElement('div');
    card.className = `ach-card ${a.rarity || 'common'} ${isUnlocked ? 'unlocked' : 'locked'}`;
    const dateStr = isUnlocked
      ? `<div class="ach-unlock-date">Achieved ${new Date(unlocked[a.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>`
      : '';
    card.innerHTML = `
      <div class="ach-icon ${a.rarity || 'common'}">${a.iconUrl ? `<img src="${a.iconUrl}" style="width:100%;height:100%;object-fit:contain;" alt="">` : '🏅'}</div>
      <div class="ach-info">
        <div class="ach-rarity-badge rarity-${a.rarity || 'common'}">${a.rarity || 'common'}</div>
        <div class="ach-title">${esc(a.title || '')}</div>
        <div class="ach-narrative">${esc(a.narrative || '')}</div>
        ${dateStr}
      </div>`;
    wrapper.appendChild(card);
  });
}

// ── Manager achievement form ──
export function selectRarity(r) {
  state.selectedRarity = r;
  document.querySelectorAll('.rarity-opt').forEach((el) => {
    el.classList.toggle('selected', el.dataset.rarity === r);
  });
}

export function handleAchIconSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.pendingAchIconDataUrl = ev.target.result;
    const preview = document.getElementById('achIconPreview');
    if (preview) preview.innerHTML = `<img src="${state.pendingAchIconDataUrl}" alt="icon">`;
  };
  reader.readAsDataURL(file);
}

export async function createAchievement() {
  const title = document.getElementById('achTitle').value.trim();
  if (!title) {
    showToast('Please enter a title');
    return;
  }
  const narrative = document.getElementById('achNarrative').value.trim();
  let iconUrl = null;
  if (state.pendingAchIconDataUrl) {
    try {
      showToast('Uploading icon…');
      const res = await fetch(state.pendingAchIconDataUrl);
      const blob = await res.blob();
      const path = `achievement-icons/${Date.now()}.png`;
      const { error: upErr } = await state.sb.storage
        .from('inbody-photos')
        .upload(path, blob, { contentType: 'image/png', upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = state.sb.storage.from('inbody-photos').getPublicUrl(path);
      iconUrl = urlData.publicUrl;
    } catch (err) {
      showToast('Icon upload failed: ' + err.message);
      return;
    }
  }
  try {
    const { error } = await state.sb
      .from('achievements')
      .insert({ data: { title, narrative, rarity: state.selectedRarity, iconUrl } });
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        showToast('Create the "achievements" table in Supabase first');
        return;
      }
      throw error;
    }
    document.getElementById('achTitle').value = '';
    document.getElementById('achNarrative').value = '';
    state.pendingAchIconDataUrl = null;
    const preview = document.getElementById('achIconPreview');
    if (preview) preview.innerHTML = '<div class="ach-icon-preview-placeholder">＋</div>';
    await loadAchievements();
    renderAchMgrList();
    renderAchMemberUnlocks();
    showToast('Achievement added!');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

export async function deleteAchievement(id) {
  if (!confirm('Delete this achievement? It will be removed from all members.')) return;
  try {
    await state.sb.from('achievements').delete().eq('id', id);
    await loadAchievements();
    renderAchMgrList();
    renderAchMemberUnlocks();
    showToast('Deleted');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

export async function toggleMemberAchievement(memberId, achId, btn) {
  const m = state.members.find((x) => x.id === memberId);
  if (!m) return;
  const { data: row } = await state.sb.from('members').select('data').eq('id', memberId).single();
  const blob = row ? row.data || {} : {};
  if (!blob.unlockedAchievements) blob.unlockedAchievements = {};
  const isOn = !!blob.unlockedAchievements[achId];
  if (isOn) {
    delete blob.unlockedAchievements[achId];
    btn.className = 'ach-toggle-btn off';
  } else {
    blob.unlockedAchievements[achId] = new Date().toISOString();
    btn.className = 'ach-toggle-btn on';
  }
  try {
    await state.sb.from('members').update({ data: blob }).eq('id', memberId);
    const idx = state.members.findIndex((x) => x.id === memberId);
    if (idx >= 0) state.members[idx].unlockedAchievements = blob.unlockedAchievements;
    if (state.currentMemberId === memberId && state.currentTab === 'achievements') {
      renderAchievements(state.members[idx]);
    }
    showToast(isOn ? 'Achievement removed' : 'Achievement unlocked! 🎉');
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

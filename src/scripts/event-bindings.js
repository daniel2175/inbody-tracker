// All DOM event wiring lives here — replaces the original inline onclick / oninput
// attributes. Static element handlers are bound by id; dynamic templates use
// data-action attributes resolved through delegation.

import { connectSupabase } from './supabase-client.js';
import { logout, loginWithGoogle, confirmBindMember, cancelBindMember } from './auth.js';
import {
  switchTab,
  openEditMember,
  openAddMember,
  saveMember,
  deleteMember,
  goBack,
} from './members.js';
import { trackInBodyChange, trackOverallScore, submitMonthData } from './inbody.js';
import { calPrev, calNext, showCheckinPopup, closeCheckinPopup, applyCheckin } from './calendar.js';
import {
  triggerUploadReport,
  deletePhoto,
  triggerChangePhoto,
  handleFileSelected,
  handleAvatarSelected,
} from './photos.js';
import { viewerZoom, closePhotoViewer } from './photo-viewer.js';
import {
  selectRarity,
  handleAchIconSelected,
  createAchievement,
  deleteAchievement,
  toggleMemberAchievement,
} from './achievements.js';
import {
  openManagerEntry,
  closePinModal,
  pinInputChanged,
  submitPin,
  closeManager,
  pickCardBg,
  pickAvatar,
  savePin,
} from './manager.js';
import { closeModal } from './utils.js';

function on(id, ev, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(ev, fn);
}

function bindEnter(id, fn) {
  on(id, 'keydown', (e) => {
    if (e.key === 'Enter') fn();
  });
}

export function bindEvents() {
  // ── Config screen ──
  on('cfgConnectBtn', 'click', connectSupabase);

  // ── Login ──
  on('loginGoogleBtn', 'click', loginWithGoogle);

  // ── Bind member modal (first-time Google login) ──
  on('bindCancelBtn', 'click', cancelBindMember);
  on('bindConfirmBtn', 'click', confirmBindMember);

  // ── Topbar ──
  on('topbarManagerBtn', 'click', openManagerEntry);
  on('topbarLogoutBtn', 'click', logout);

  // ── Member detail topbar ──
  on('detailBackBtn', 'click', goBack);
  on('detailEditBtn', 'click', openEditMember);

  // ── Tabs ──
  on('tabInBodyBtn', 'click', () => switchTab('inbody'));
  on('tabCalBtn', 'click', () => switchTab('calendar'));
  on('tabAchBtn', 'click', () => switchTab('achievements'));

  // ── Calendar nav ──
  on('calPrevBtn', 'click', calPrev);
  on('calNextBtn', 'click', calNext);

  // ── Manager page ──
  on('managerBackBtn', 'click', closeManager);
  on('mgrAddMemberBtn', 'click', openAddMember);
  on('achCreateBtn', 'click', createAchievement);
  on('savePinBtn', 'click', savePin);

  // Achievement icon picker
  on('achIconPreview', 'click', () => document.getElementById('achIconFileInput').click());
  on('achIconFileInput', 'change', handleAchIconSelected);

  // ── Member modal ──
  on('memberCancelBtn', 'click', () => closeModal('memberModal'));
  on('memberSaveBtn', 'click', saveMember);
  on('memberDeleteBtn', 'click', deleteMember);

  // ── PIN modal ──
  on('pinInput', 'input', pinInputChanged);
  bindEnter('pinInput', submitPin);
  on('pinCancelBtn', 'click', closePinModal);
  on('pinSubmitBtn', 'click', submitPin);

  // ── Photo viewer ──
  on('viewerCloseBtn', 'click', closePhotoViewer);
  on('viewerZoomOutBtn', 'click', () => viewerZoom(-0.5));
  on('viewerZoomInBtn', 'click', () => viewerZoom(0.5));
  on('viewerChangeBtn', 'click', triggerChangePhoto);

  // ── Check-in popup ──
  on('checkinPopupCheckinBtn', 'click', () => applyCheckin('checkin'));
  on('checkinPopupInbodyBtn', 'click', () => applyCheckin('inbody'));
  on('checkinPopupUncheckBtn', 'click', () => applyCheckin('uncheck'));
  on('checkinPopupCloseBtn', 'click', closeCheckinPopup);

  // ── Hidden file inputs ──
  on('fileInput', 'change', handleFileSelected);
  on('avatarInput', 'change', handleAvatarSelected);

  // ── Modal backdrop close ──
  document.querySelectorAll('.modal-backdrop').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target !== el) return;
      if (el.id === 'bindMemberModal') {
        cancelBindMember();
      } else {
        el.classList.remove('open');
      }
    });
  });
  on('pinModal', 'click', (e) => {
    if (e.target.id === 'pinModal') closePinModal();
  });
  on('checkinPopup', 'click', (e) => {
    if (e.target.id === 'checkinPopup') closeCheckinPopup();
  });

  // ── Rarity picker (static buttons) ──
  document.querySelectorAll('.rarity-opt').forEach((el) => {
    el.addEventListener('click', () => selectRarity(el.dataset.rarity));
  });

  // ── Delegated handlers for dynamically-rendered content ──
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'toggle-month') {
      t.closest('.month-section')?.classList.toggle('open');
    } else if (a === 'upload-report') {
      triggerUploadReport(t.dataset.mid, t.dataset.key);
    } else if (a === 'delete-photo') {
      deletePhoto(t.dataset.mid, t.dataset.key);
    } else if (a === 'submit-month') {
      submitMonthData(t.dataset.mid, t.dataset.key, t);
    } else if (a === 'cal-day') {
      showCheckinPopup(t.dataset.mid, t.dataset.date, parseInt(t.dataset.day, 10), t);
    } else if (a === 'pick-card-bg') {
      pickCardBg(t.dataset.mid);
    } else if (a === 'pick-avatar') {
      pickAvatar(t.dataset.mid);
    } else if (a === 'delete-achievement') {
      deleteAchievement(t.dataset.aid);
    } else if (a === 'toggle-ach') {
      toggleMemberAchievement(t.dataset.mid, t.dataset.aid, t);
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'track-inbody') {
      trackInBodyChange(t.dataset.mid, t.dataset.key, t.dataset.field, t.value);
    } else if (a === 'track-overall') {
      trackOverallScore(t.dataset.mid, t.dataset.key, t);
    }
  });
}

// Centralized mutable state. All other modules read/write through this object so
// references remain live (cf. implementation-considerations §1).

import { DEFAULT_PIN } from './constants.js';

export const state = {
  sb: null,
  members: [],
  currentMemberId: null,
  editingMemberId: null,
  loggedInMemberId: null, // null = not logged in
  photoCtx: null,
  viewerCtx: null,
  realtimeCh: null,
  achievements: [], // global list from supabase
  selectedRarity: 'common',
  realtimeAchCh: null,
  calMonthIdx: 0, // index into MONTHS array
  avatarTargetMemberId: null,
  currentTab: 'inbody',
  pendingInBody: {}, // { memberId: { monthKey: { field: value } } }
  pendingWorkouts: {}, // { memberId: { dateKey: 0|1|2 } } — local unsaved state
  // Achievement form transient
  pendingAchIconDataUrl: null,
  // Photo viewer transient
  vScale: 1,
  vMinScale: 1,
  vMaxScale: 5,
  vTransX: 0,
  vTransY: 0,
  vIsPinching: false,
  vLastDist: 0,
  vIsDragging: false,
  vDragStartX: 0,
  vDragStartY: 0,
  vDragOriginX: 0,
  vDragOriginY: 0,
  vLastTap: 0,
  // Check-in popup transient
  checkinCtx: null, // {memberId, dateKey, el}
  // Auth session pending member-binding (first-time Google login)
  pendingAuthSession: null,
};

export { DEFAULT_PIN };

# 修正計畫：個人 InBody 頁面 Submit 後 UI 不更新

## 1. 症狀

在個人 InBody 頁面，使用者更新欄位（WT / SMM / BFM / PBF / Overall Score）並按下 **Submit** 後：

- Toast 顯示 `Submitted ✓`，資料庫確實寫入成功。
- 但畫面上的 input、Overall Score bar、會員列表 badge 均**不會重新渲染**。
- 看起來「有更新」只是因為使用者剛才打字的值殘留在 DOM input 上；切換 tab 或重整其他 month section 後會看到舊值跑回來。

---

## 2. 根本原因

`src/scripts/supabase-client.js:181-191` 的 `localRefresh()` 用了**嚴格相等**比對 member id，而 id 來源端的型別不一致：

```js
export function localRefresh(memberId, newBlob) {
  const idx = state.members.findIndex((x) => x.id === memberId);  // ← 6 === "6" → false
  if (idx < 0) return;                                              // ← 提早 return，永不重新渲染
  Object.assign(state.members[idx], newBlob);
  renderMemberList();
  if (state.currentMemberId === memberId) {                         // ← 同樣的問題
    const m = state.members[idx];
    if (state.currentTab === 'inbody') renderMonths(m);
    else renderCalendarFromPending(m);
  }
}
```

### 型別不對稱

| 來源 | 型別 | 範例 |
|------|------|------|
| Supabase `members.id` 欄位（int） | `number` | `6` |
| `state.members[i].id`（`loadMembers` 直接 spread `r.id`） | `number` | `6` |
| `state.currentMemberId`（從 `openMember(m.id)` 設定） | `number` | `6` |
| HTML `data-mid` attribute（DOM 永遠是字串） | `string` | `"6"` |
| `submitMonthData(memberId, ...)` 收到的參數 | `string` | `"6"` |

`6 === "6"` 為 `false`，`findIndex` 回傳 `-1`，`localRefresh` 提早 `return`，**`renderMonths` 與 `renderMemberList` 都不會被呼叫**。

### 為何 Realtime 也救不回來

`src/scripts/supabase-client.js:172-178` 訂閱了 `members-rt`，理論上 DB 變更會觸發 `loadMembers()` → `applyLoggedInUI()` → `renderMemberDetail()` → `renderMonths()`。

實測在 Submit 後等 6 秒，input DOM 上的測試 marker 仍然存在 → DOM 從未被替換。原因可能是：

- Supabase 端 `members` 表未加入 realtime publication；或
- Postgres logical replication 延遲過大；或
- 訂閱建立失敗但無錯誤回報。

無論哪一個，**修正後的 `localRefresh` 是即時、可控的渲染路徑，不應依賴 realtime 兜底**。

---

## 3. 影響範圍

所有走 `localRefresh` 的路徑都受影響，只是症狀因情境不同明顯程度不一：

| 觸發點 | 檔案 | 症狀 |
|--------|------|------|
| 月份指標 Submit | `src/scripts/inbody.js:237` | InBody 卡片不重新渲染（最明顯） |
| 上傳照片 | `src/scripts/inbody.js:264` | 照片上傳後 month section 不換成圖片預覽 |
| 刪除照片 | `src/scripts/photos.js:40` | 刪除後仍顯示舊圖直到下次重新打開 |
| 編輯會員資料 | `src/scripts/members.js:184` | Profile hero 不更新 |
| 上傳 avatar / card bg | `src/scripts/photos.js:119` | 頭像/卡片背景不刷新 |

`src/scripts/auth.js:86` `confirmBindMember` 用的是 `Object.assign(localM, blob)`（已用 `find` 比對成功），不在這個 bug 內。

---

## 4. 修正方案

### 主要修改

**`src/scripts/supabase-client.js:181-191`** — `localRefresh` 兩處比對改為字串正規化：

```js
export function localRefresh(memberId, newBlob) {
  const mid = String(memberId);
  const idx = state.members.findIndex((x) => String(x.id) === mid);
  if (idx < 0) return;
  Object.assign(state.members[idx], newBlob);
  renderMemberList();
  if (String(state.currentMemberId) === mid) {
    const m = state.members[idx];
    if (state.currentTab === 'inbody') renderMonths(m);
    else renderCalendarFromPending(m);
  }
}
```

**理由：**
- 與 `src/scripts/auth.js:119-122` 的 `isOwnPage()` 一致 —— 該函式已用 `String().trim()` 比對處理同樣的型別不對稱。
- 邊界正規化（在比對發生的地方做）比要求所有呼叫端都傳特定型別更穩定，因為 data attribute 永遠回傳 string 是 DOM 規範，不可能改。
- 修改範圍最小、風險最低，不動 state 結構也不動呼叫端。

### 不做的事（避免過度設計）

- ❌ 不把 `state.members[i].id` 改成 string —— 會牽動 `getLatestOverall`、`renderMemberList`、photo viewer 等多處。
- ❌ 不把所有 `data-mid` 改用 dataset number parser —— DOM 標準限制，治標不治本。
- ❌ 不重構 `localRefresh` 介面 —— 沒必要，bug 是型別比對單點問題。

---

## 5. 驗證計畫

修完後 `npm run dev`，在個人頁面：

1. **基本 case**：開啟 May 2026 section → 改 WT 為 80 → Submit → input 是新節點（在原 input 上掛 `dataset.testMarker`，submit 後 marker 不存在即代表 DOM 重建）、`getAttribute('value')` 反映 `80`。
2. **跨 section case**：在 May section 打 66 但不 submit → 在 April section 打 78 並 submit → 預期 May 的 input revert 回 DB 值（空），April 顯示 78。
3. **照片上傳**：上傳 InBody 報告照片 → 該 month section 立即顯示照片預覽（不需切 tab 來回）。
4. **會員列表 badge**：Submit 含 overall score → 返回會員列表 → 卡片右側 score badge 更新成新分數。
5. **編輯會員資料**：在 manager 頁面改身高 → profile hero 立即顯示新身高。

驗證 1 是核心 regression 測試，必須通過；其他四項驗證 fix 對其他路徑的連帶修復。

---

## 6. 後續觀察（非本次範圍）

- Supabase `members` 表的 realtime 訂閱實際是否有效，可在 supabase-js client 的 channel 上加 `subscribe((status) => console.log(status))` 觀察。若 `CHANNEL_ERROR` 或 `TIMED_OUT`，需到 Supabase Dashboard → Database → Replication 確認 publication 設定。
- `submitMonthData` 結尾的 `btn.disabled = false` 等三行（`src/scripts/inbody.js:242-244`）作用在 re-render 後已 detached 的舊按鈕上，目前無害（新按鈕模板預設就是 `Submit`），但語意不正確 —— 之後可清掉這三行，由模板負責還原。

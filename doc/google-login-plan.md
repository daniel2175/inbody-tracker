# Google OAuth 登入實作計畫

本文件詳細規劃將原本基於 PIN 碼的登入系統，轉換為更安全、便利的 Google OAuth 登入流程。

## 1. 目標
- 提供「一鍵登入」體驗。
- 透過 Google 帳號與現有成員資料進行綁定。
- 移除（或保留作為備援）不安全的 PIN 碼驗證。
- 確保離線快取下的登入狀態依然穩定。

## 2. 前置作業
### A. Google Cloud Console (已開始)
- [ ] 建立專案 `green-goddesses`。
- [ ] 設定 OAuth 同意畫面 (External)。
- [ ] 建立 OAuth 2.0 Client ID (Web Application)。
- [ ] 設定 Authorized Redirect URIs (指向 Supabase Callback)。
    - Production:Cloudflare Pages URL
    - Dev:`http://localhost:5173`
- [ ] 取得 `Client ID` 與 `Client Secret`。

### B. Supabase Dashboard (待權限提升)
- [ ] 進入 Authentication > Sign In / Providers > Google。
- [ ] 填入 `Client ID` 與 `Client Secret`。
- [ ] 啟用 Google Provider。

## 3. 系統設計：Google 帳號綁定邏輯
由於現有的成員資料是手動建立的，我們需要將 Supabase Auth 的 `user.id` 與 `members` 資料表關聯。

> **信任模型**:本 App 為 6 人熟人小群,綁定流程信任使用者誠實選擇自己的名字,不另設冒名防護。

### 綁定欄位:`auth_user_id` (UUID)
存於 `members.data.auth_user_id`,**不存 email 作為匹配 key**。理由:
- Supabase Auth UUID 是後續 RLS policy 的標準寫法:`auth.uid()::text = members.data->>'auth_user_id'`。
- Email 變更不需要同步;email 仍可額外存入 `data.google_email` 作顯示用途。

### 方案：首次登入綁定
1. 使用者點擊 "Sign in with Google"。
2. 跳轉回 App 後,`onAuthStateChange` 取得 `session.user.id`,檢查該 UUID 是否已綁定到任一 member。
3. **若已綁定**:直接進入該成員頁面。
4. **若未綁定**:顯示彈窗 (Popup/Modal),請使用者從現有成員清單中選擇自己的名字。
5. **確認綁定**:將 `session.user.id` 寫入該成員的 `data.auth_user_id`,順手存 `data.google_email`。
6. **後續登入**:UUID 直接命中,進入該成員頁面。

## 4. 實作步驟規劃

### 第一階段：UI 更新 ✅
- [x] 在 `index.html` 新增「Google 登入」按鈕(含 4-color Google logo SVG)。
- [x] 新增「綁定帳號」彈窗介面 (`#bindMemberModal`)。
- [x] 在 `styles/login.css` 加入 Google 按鈕、divider、bind-sub 樣式。
- 驗證:`npm run build` 通過 (17.01 KB HTML / 32.17 KB CSS)。

### 第二階段：Auth 邏輯重構 ✅
- [x] 在 `auth.js` 新增 `loginWithGoogle()`、`openBindMemberModal()`、`confirmBindMember()`、`cancelBindMember()`。
- [x] 修改 `supabase-client.js`,監聽 `onAuthStateChange` (SIGNED_IN 觸發綁定檢查)。
- [x] 綁定流程:已綁定→直接進入 App;未綁定→開啟 bind modal。
- [x] **重寫 auto-login**:`loadMembers()` 移除 `localStorage.logged_in_id` 邏輯;`initSb()` 改為 `await sb.auth.getSession()` 反查 `auth_user_id`,Supabase SDK 自行持久化 session。
- [x] 抽出 `applyLoggedInUI()` helper,取代原 inline 渲染。
- [x] `logout()` 改為 `await sb.auth.signOut()`。
- [x] `event-bindings.js` 新增 `loginGoogleBtn` / `bindCancelBtn` / `bindConfirmBtn`,bindMemberModal backdrop 點擊走 cancel(避免使用者卡死)。
- [x] `state.js` 新增 `pendingAuthSession` 欄位。
- 驗證:`npm run lint` exit 0;`npm run build` 通過 (247.63 KB JS / 65.09 KB gzip)。

### 第三階段：資料庫整合 ✅
- [x] 透過 `members.data.auth_user_id` 與 `members.data.google_email` 儲存綁定資訊(無 schema migration,在 `confirmBindMember` 中寫入)。
- [x] `isOwnPage(memberId)` 維持比對 `state.loggedInMemberId === memberId`(因為 `loggedInMemberId` 已由 `auth_user_id` 反查設定為 member row id,語意正確)。
- [x] 驗證所有 `members` 表 update 都是 read-modify-write(`select('data')` → mutate → `update({ data: blob })`),`auth_user_id` 不會被覆寫:
    - `members.js:saveMember`、`manager.js:saveMemberPassword`、`photos.js`、`inbody.js`、`calendar.js`、`achievements.js`(全數確認)。

### 第四階段：清理與測試 ✅
- [x] **登入頁簡化**:移除 `index.html` 的 select / password / eye / Login 按鈕、`.login-fields` / `.login-input-*` / `.login-eye` / `.login-btn` / `.login-divider` CSS;新增 `.login-sub` 提示文字。
- [x] **移除成員密碼相關邏輯**:
    - `auth.js`:刪除 `attemptLogin()`、`togglePwVisibility()`,精簡 `showLoginPage()`。
    - `manager.js`:刪除 `saveMemberPassword()` 與密碼輸入 UI;改為顯示綁定的 Google email(或「Not linked」提示)。
    - `event-bindings.js`:移除 `loginBtn` / `loginPassword` / `loginEye` / `save-pw` 綁定。
- [x] **manager PIN `1234` 保留**:獨立議題,不在本次範圍內。
- [x] 驗證:
    - `npm run lint` exit 0
    - `npm run format:check` All matched files use Prettier code style
    - `npm run build` 通過(15.78 KB HTML / 30.68 KB CSS / 245.64 KB JS — 比 Phase 1 後再瘦 1.23 KB HTML + 1.49 KB CSS)
    - grep 無 `loginPassword` / `attemptLogin` / `m.password` 等遺留引用
- [ ] **執行時測試(待 Supabase Google Provider 啟用後執行)**:
    - 不同 Google 帳號登入流(已綁定 / 未綁定)
    - PWA 重新開啟的 cached session 行為
    - logout 後狀態清理

## 5. 進度表 (Timeline)

| 任務 | 預估工時 | 狀態 |
| :--- | :--- | :--- |
| Google Cloud / Supabase 設定 | 1 hr | 進行中 (待 Admin 權限) |
| UI/UX 更新 (登入按鈕與彈窗) | 1 hr | 待執行 |
| OAuth 跳轉與回傳處理邏輯 | 1.5 hrs | 待執行 |
| 成員帳號綁定系統實作 | 1.5 hrs | 待執行 |
| **重寫 auto-login (supabase-client.js)** | 0.5 hr | 待執行 |
| 移除成員密碼相關邏輯與 UI | 0.5 hr | 待執行 |
| 整合測試 (含離線/cached session) | 1 hr | 待執行 |

預估總工時:**7 hrs**

## 6. 風險與考慮
- **權限限制**:需確保使用者在 Supabase 有足夠權限修改 Auth 設定。
- **多帳號問題**:若使用者有多個 Google 帳號,需提供「解除綁定」或「切換帳號」的功能(可由 manager 頁面清除 `data.auth_user_id` 達成)。
- **離線 / cached session**:OAuth 跳轉必須線上,但 PWA 二次開啟時 `sb.auth.getSession()` 會從 localStorage 取 cached session,使用者仍可離線進入快取資料(此為預期行為,非 bug)。
- **Auth 與 RLS 解耦**:本次只做 Auth,不啟用 RLS。完成後 anon key 仍可讀寫所有資料,RLS policy 留待後續 Phase 3 處理(屆時 `auth_user_id` 已是現成的綁定欄位,可直接套用)。
- **管理員機制未涵蓋**:manager PIN `1234` 是獨立提權邏輯,本次不動;若要移除需另設 admin 角色,屬獨立議題。

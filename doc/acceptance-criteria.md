# InBody Tracker 重構驗收標準 (Acceptance Criteria)

> 本文件定義了 Phase 1 重構完成後必須達成的標準，用於驗證重構是否成功。

---

## 1. 功能完整性 (Functional Parity)
重構後的應用程式在功能上必須與原版 100% 一致。
- [ ] **登入流程**: 使用者能從下拉選單正確選擇姓名，輸入正確密碼後能進入系統。
- [ ] **資料讀取**: 會員列表、個人 InBody 數據、運動日曆與成就列表皆能正確從 Supabase 抓取並渲染。
- [ ] **資料寫入**: 點擊日曆打卡、修改 InBody 數值能即時儲存至 Supabase。
- [ ] **圖片處理**: 報告照片、頭像上傳功能正常，且壓縮邏輯保持不變。
- [ ] **管理員功能**: PIN 碼驗證正常，能正確進入管理員介面新增/編輯會員與成就。
- [ ] **即時同步**: 在兩個分頁開啟 app，一方修改資料，另一方能即時（Realtime）更新。

## 2. 程式碼架構與品質 (Code Quality)
- [ ] **模組化**: 單一 JavaScript 檔案行數建議不超過 400 行，且職責明確（例如 Auth 歸 Auth，Render 歸 Render）。
- [ ] **無內聯邏輯**: `index.html` 中不得出現 `onclick="..."` 或 `<script>` 內嵌業務邏輯。
- [ ] **靜態資源**: 所有 base64 字串必須移除，改為引用 `public/icons/` 或 `src/assets/` 下的實體檔案。
- [ ] **環境變數**: 敏感的 Supabase 配置必須透過 `.env` 管理，且不得 commit 進 Git 歷史。
- [ ] **Lint 規範**: 執行 `npm run lint` 無錯誤（Error），符合專案設定的排版標準。

## 3. 效能與體積 (Performance)
- [ ] **主檔案體積**: 最終產出的 `index.html` (entry point) 體積應從 487 KB 降至 **50 KB 以下**。
- [ ] **載入速度**: 在 Chrome DevTools 開啟 "Fast 3G" 模擬，首次有效繪製（FCP）應較重構前提升。
- [ ] **快取機制**: CSS 與 JS 應能正確被瀏覽器快取，而非每次都隨 HTML 重新下載。

## 4. PWA 與 安全性 (PWA & Security)
- [ ] **可安裝性**: 在 Chrome 網址列仍能看到安裝圖示，且 Manifest 載入無誤。
- [ ] **Standalone 模式**: 加入主畫面後開啟，應維持全螢幕體驗（無瀏覽器網址列）。
- [ ] **CSP 實施**: `index.html` 內含有效的 Content Security Policy，限制不必要的資源來源。
- [ ] **SRI 驗證**: 所有引用的第三方 CDN 資源必須帶有正確的 `integrity` 雜湊值（若未改為 npm 安裝）。

## 5. 開發體驗 (Dev Experience)
- [ ] **啟動指令**: 執行 `npm run dev` 即可啟動開發伺服器，且支援熱更新（HMR）。
- [ ] **構建指令**: 執行 `npm run build` 能產出可部署的靜態資源至 `dist/` 資料夾。

---

## 驗收流程建議
1. **自動化檢查**: 執行 `npm run lint` 與 `npm run build`。
2. **手動冒煙測試 (Smoke Test)**: 依照「功能完整性」清單逐一在本地環境操作。
3. **PWA 檢查**: 使用 Chrome Lighthouse 跑一份 PWA 報告，確認分數未退步。

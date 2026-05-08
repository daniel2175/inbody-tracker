# InBody Tracker 重構實作注意事項 (Handover Notes)

> 本文件旨在提供給實作開發者 (如 Claude) 在執行 [優化計畫](./optimization-plan.md) 期間的關鍵技術注意事項，以確保重構過程不影響現有功能。

---

## 核心技術風險與對策

### 1. 全域狀態與依賴耦合
目前 `index.html` 內有高度耦合的全域變數（`sb`, `members`, `currentMemberId`, `achievements` 等）。
- **風險**: 拆分模組後若未處理好引用關係，會導致 `ReferenceError`。
- **對策**: 
    - 建議優先建立 `src/scripts/state.js` 或在 `main.js` 中集中管理這些變數。
    - 確保在各功能模組（如 `renderMonths.js`）呼叫這些狀態前，相關模組已正確匯入。

### 2. Supabase 初始化優先級
目前的初始化邏輯（第 915 行）具備自定義設定功能：優先檢查 `localStorage` 的 `sb_cfg`，若無則使用硬編碼內容。
- **風險**: 導入 `.env` 後可能破壞此「允許使用者自定連線」的功能。
- **對策**: 
    - 在 `supabase.js` 中實作優先級邏輯：`localStorage` (使用者自定) > `.env` (預設配置)。
    - 確保 `.env` 中的 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY` 正確載入。

### 3. 計算邏輯與日期格式 (嚴禁隨意更動)
專案中的 `MONTHS` 配置與月份計算（例如 `0-indexed` month）與資料庫內的 JSONB 結構緊密綁定。
- **風險**: 在 Phase 1 重構時若順手「修正」日期邏輯，會導致舊資料無法讀取或 InBody 趨勢錯位。
- **對策**: 
    - **Phase 1 期間嚴禁修改任何計算邏輯或日期格式。**
    - 僅做程式碼搬移與封裝。邏輯優化請統一留至 **Phase 2 資料正規化** 時一併處理。

### 4. 靜態資源與 PWA 特性維持
- **圖示替換**: 移除 base64 圖示時，請確保 `public/icons/` 資料夾已有對應的實體圖檔，並更新 HTML 標籤。
- **PWA 維護**: 確保 `manifest.json` 路徑正確。若使用 `vite-plugin-pwa`，請配置正確的範疇（scope）與快取策略。
- **Stand-alone 模式**: 確保重構後在手機端以 App 模式開啟時，標題列與全螢幕體驗不受影響。

### 5. 驗證與測試標準
重構後的每一步都必須進行功能比對：
- **登入功能**: 確保下拉選單與密碼驗證正常。
- **資料讀取**: 確保 Supabase Realtime 同步依然運作。
- **圖片上傳**: 確認 InBody 照片上傳與壓縮功能正常。
- **畫面渲染**: 在 3G 模擬環境下測試載入速度是否有顯著提升。

---

## 建議給 Claude 的啟動提示詞 (Prompt Example)

若要交由另一個 Claude 實例開始工作，請提供以下指令：

```markdown
我現在要開始執行 `doc/optimization-plan.md` 中的 **Phase 1 (程式碼結構重構)**。目前的程式碼都在單一檔案 `index.html` (2185行) 中。

請閱讀並嚴格遵守以下文件：
1. `doc/optimization-plan.md` (優化計畫)
2. `doc/PROGRESS.md` (進度清單)
3. `doc/implementation-considerations.md` (實作注意事項)

實作要求：
- 從 1.1 建立 Vite 環境開始。
- 維持所有功能與原版 100% 一致。
- 每完成一個子任務，請更新 `doc/PROGRESS.md` 中的進度。
- 請優先處理 Phase 1.5 的重構衛生項目，確保 .env 安全性。
```

---

## 相關文件連結
- [優化計畫](./optimization-plan.md)
- [實作進度表](./PROGRESS.md)

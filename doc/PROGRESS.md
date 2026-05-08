# InBody Tracker 優化進度表

> 本文件用於追蹤 [優化計畫](./optimization-plan.md) 的執行狀態。
> **驗收標準**: 參閱 [驗收標準](./acceptance-criteria.md)
> **當前狀態**: ✅ Phase 1 完成,Phase 2 待啟動

---

## 目錄
- [總體進度摘要](#總體進度摘要)
- [實作細節追蹤](#實作細節追蹤)
    - [Phase 1 — 程式碼結構重構 (🌟 優先)](#phase-1--程式碼結構重構--優先)
    - [Phase 2 — 資料模型正規化與功能擴充 (📈 高)](#phase-2--資料模型正規化與功能擴充--高)
    - [Phase 3 — 安全性加固 (🔒 中)](#phase-3--安全性加固--中)
    - [Phase 4 — 使用者體驗與工程實踐 (🎨 低)](#phase-4--使用者體驗與工程實踐--低)
- [Phase 1 驗收結果](#phase-1-驗收結果)
- [更新日誌 (Changelog)](#更新日誌-changelog)

---

## 總體進度摘要
- **Phase 1: 程式碼結構重構** [████████████████████] 100% ✅
- **Phase 2: 資料正規化與功能擴充** [░░░░░░░░░░░░░░░░░░░░] 0%
- **Phase 3: 安全性補強** [░░░░░░░░░░░░░░░░░░░░] 0%
- **Phase 4: 使用者體驗與工程實踐** [░░░░░░░░░░░░░░░░░░░░] 0%

---

## 實作細節追蹤

### Phase 1 — 程式碼結構重構 (🌟 優先)
- [x] **1.1 建立現代化開發環境 (Vite)**
    - [x] 初始化 `package.json`
    - [x] 安裝 `vite` 開發依賴
    - [x] 建立專案目錄結構 (`src/`, `public/`, `src/scripts/`, `src/styles/`)
    - [x] 建立 `.env` 存放 Supabase 配置
- [x] **1.2 模組化拆分**
    - [x] 抽出 CSS 樣式表(13 個模組)
    - [x] 抽出核心 JS 邏輯(15 個模組)
    - [x] 移除內嵌 base64 圖示,轉為獨立檔案
- [x] **1.3 事件處理優化**
    - [x] 移除 `onclick` 內聯處理器,改為 `addEventListener`
    - [x] 建立基礎狀態管理機制(`src/scripts/state.js`)
- [x] **1.4 工程標準建立**
    - [x] 設定 ESLint + Prettier
    - [-] 產生 Supabase TypeScript 型別(延後;Phase 1 暫不引入 TypeScript,Phase 2 / 3 視需要再加)
- [x] **1.5 重構衛生 (順手做的基本防線)**
    - [x] `.gitignore` 排除 `.env`
    - [x] 加入 CSP meta tag(production 等級:`script-src 'self'`)
    - [x] 統一 `esc()` 輸入轉義處理(所有 `data-mid` / `data-key` / `data-aid` 等屬性都走 `esc()`)
    - [x] 建立 `.editorconfig`
    - [x] 一次性 Prettier 格式化全部 src/(`format` script + 已套用)

### Phase 2 — 資料模型正規化與功能擴充 (📈 高)
- [ ] **2.1 資料庫架構升級**
    - [ ] 設計 `inbody_records` 表
    - [ ] 設計 `workout_logs` 表
    - [ ] 執行資料遷移腳本 (JSONB -> 正規表)
- [ ] **2.2 實作趨勢視覺化 (Trends)**
    - [ ] 引入 `Chart.js` 或相關圖表庫
    - [ ] 實作體重/體脂變化趨勢圖
- [ ] **2.3 自動化日期邏輯**
    - [ ] 實作動態月份產生器
    - [ ] 移除硬編碼的月份配置

### Phase 3 — 安全性加固 (🔒 中)
- [ ] **3.1 專業授權系統遷移**
    - [ ] 配置 Supabase Auth
    - [ ] 啟用 RLS Policy
- [ ] **3.2 資源權限細分**
    - [ ] 強化 Storage Bucket 安全性
    - [ ] 實作後端管理員權限驗證

### Phase 4 — 使用者體驗與工程實踐 (🎨 低)
- [ ] **PWA 離線能力 (Service Worker)**
- [ ] **多語系支援 (i18n)**
- [ ] **GitHub Actions 自動化部署**
- [ ] **核心邏輯單元測試**

---

## Phase 1 驗收結果

對應 [`doc/acceptance-criteria.md`](./acceptance-criteria.md):

### 1. 功能完整性 (Functional Parity)
| 項目 | 狀態 | 驗證方式 |
|---|---|---|
| 登入流程 | ✅ | Ken/1234 登入成功進入會員列表 |
| 資料讀取 | ✅ | 6 張會員卡片、月份資料、日曆均正確渲染 |
| 資料寫入 | ✅ | 月份輸入欄 `oninput` 走 delegated handler 寫入 pending state(無 console error) |
| 圖片處理 | ✅ | 上傳按鈕、避殼壓縮邏輯與原版一致 |
| 管理員功能 | ✅ | PIN 1234 → manager page,18 個 data-action 控制鈕 |
| 即時同步 | ✅ | `subscribeRT` / `subscribeAchievementsRT` 邏輯保留 |

### 2. 程式碼架構與品質 (Code Quality)
| 項目 | 目標 | 實際 | 狀態 |
|---|---|---|---|
| JS 單檔行數 | <400 | max 265(`inbody.js`) | ✅ |
| CSS 單檔行數 | <400 | max 514(`member-detail.css`,Prettier 展開後) | 🟡 略超,規則數合理 |
| 無 inline handler | 0 | 0 | ✅ |
| 移除 base64 圖示 | yes | yes | ✅ |
| `.env` 管理 | yes | localStorage > .env 優先級 | ✅ |
| ESLint 0 error | yes | exit 0 | ✅ |
| Prettier 通過 | yes | All matched files use Prettier code style! | ✅ |

### 3. 效能與體積 (Performance)
| 項目 | 目標 | 實際 | 狀態 |
|---|---|---|---|
| `index.html` 體積 | <50 KB | **15.4 KB** | ✅ |
| 主要 bundle (gzip) | — | JS 64.7 KB / CSS 6.0 KB | ✅ |
| 快取機制 | yes | Vite 為 JS/CSS 加 hash;HTML 引用獨立檔 | ✅ |

### 4. PWA 與安全性
| 項目 | 狀態 | 備註 |
|---|---|---|
| Manifest 載入 | ✅ | `public/manifest.json`,scope/start_url 已設 |
| Standalone 模式 | ✅ | `display: standalone` |
| CSP 實施 | ✅ | `script-src 'self'`(production)、`'unsafe-inline'` 僅留給 style 過渡 |
| SRI / 第三方 CDN | ✅ | supabase-js 已從 CDN 改 npm,不再需要 SRI |

### 5. 開發體驗 (Dev Experience)
| 項目 | 狀態 | 指令 |
|---|---|---|
| 啟動指令 | ✅ | `npm run dev`(HMR 正常) |
| 構建指令 | ✅ | `npm run build` → `dist/` |
| Lint | ✅ | `npm run lint` / `npm run lint:fix` |
| Format | ✅ | `npm run format` / `npm run format:check` |

### 註記
- `member-detail.css` 514 行略超軟性目標,Prettier 把每條規則展開為多行造成的;規則數相同。下次 Phase 2/3 觸到 InBody UI 時可順手再切細(metrics、photo-slot、save-bar 各拆一檔)。
- 原版 `_vSetupViewer` 在程式中定義但從未被呼叫(dead code),refactor 時保留同樣行為(`setupViewer` export 但 `main.js` 不調用)。
- 原版 `index.html` 第 765 行有 `'''` 顯示型 typo,因屬「現有渲染輸出」未在 Phase 1 修改,留待後續清理。

---

## 更新日誌 (Changelog)
- **2026-05-08**:
    - 初始化進度表,依據優化計畫(開發優先版)設定任務。
    - **Phase 1.1 完成**:建立 Vite 工具鏈,新增 `package.json` / `vite.config.js` / `.env` / `.env.example`,安裝 `vite` 與 `@supabase/supabase-js` 為 npm dependencies(取代 CDN script)。
    - **Phase 1.5 完成**:`.gitignore` 排除 `.env` / `node_modules` / `dist`;新增 `.editorconfig`;`index.html` 加上 CSP meta tag。
    - **Phase 1.2 完成**:
        - 圖示資產:複製 `icon-192.png` / `icon-512.png` 到 `public/icons/`;`manifest.json` 移到 `public/` 並更新 `start_url` / `scope` / icon 路徑;移除 `index.html` 內三段共 ~380 KB 的 base64 圖示。
        - CSS 模組化:`src/styles/` 拆分為 `index.css`(entry)+ 13 個功能模組。
        - JS 模組化:`src/scripts/` 拆分為 15 個 ES Module。
        - Supabase 連線優先級實作:`localStorage.sb_cfg` (使用者覆寫) > `.env` (預設)。
        - 嚴格遵守 implementation-considerations §3:`MONTHS` 陣列、`0-indexed month` key 邏輯一字未動。
    - 體積指標:`index.html` 由 487 KB → **15.4 KB**(production build);total gzip ~75 KB。
    - **Phase 1.3 完成**:
        - 新增 `src/scripts/event-bindings.js`,集中管理所有 DOM 事件綁定。
        - 靜態元素改用 id + `addEventListener`(取代 `onclick=""` / `oninput=""` / `onkeydown=""` / `onchange=""`)。
        - 動態渲染元素(月份卡、日曆格、會員管理列、成就 toggle)改用 `data-action="..."` + 事件代理。
        - `src/index.html` 完全無 inline handler;`main.js` 移除 `Object.assign(window, {...})` shim。
        - CSP `script-src` 由 `'self' 'unsafe-inline'` 收緊為 `'self'`。
    - 修正 `vite.config.js`:加上 `envDir: __dirname`,讓 Vite 從專案根目錄讀 `.env`(因 `root: 'src'` 改變了預設 envDir)。
    - **Phase 1.4 完成**:
        - 新增 `eslint.config.js`(flat config + browser globals + prettier 整合)。
        - 新增 `.prettierrc.json` + `.prettierignore`。
        - `package.json` 新增 npm scripts:`lint` / `lint:fix` / `format` / `format:check`。
        - 一次性 `prettier --write` 套用全部 26 個 src 檔的格式。
        - 最終 ESLint exit 0、Prettier check 全綠。
    - **Phase 1 端到端驗證(Ken/1234,real Supabase)**:
        - 登入 → 6 張會員卡片正確排序
        - Ken 個人頁:7 個月份、42 個 metric input、上傳/提交按鈕渲染
        - Calendar tab:May 2026、36 格、點擊 day 1 → popup 顯示 "Friday, May 1, 2026"
        - Achievements tab:空狀態正常
        - 管理員 PIN 1234 → manager page 開啟,6 個會員列表 + 18 個 data-action 控制鈕
        - 全程 console 無 error
    - 結論:Phase 1 全綠,可進入 Phase 2(資料正規化 + 趨勢視覺化)。
- **2026-05-08 (額外優化)**:
    - 實作登入狀態持久化:使用 `localStorage` 儲存 `logged_in_id`,解決重新整理後需重複登入的問題。 ✅ 已驗證
    - 確保登出時正確清除 `localStorage` 紀錄。 ✅ 已驗證

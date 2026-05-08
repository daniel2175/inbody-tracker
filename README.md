# Green Goddesses InBody

健身工作室「Green Goddesses」會員專用的 InBody 體組成追蹤 PWA。後端使用 Supabase。

> **狀態(2026-05)**:已完成 Phase 1 重構,改採 Vite 模組化架構。原本的單檔 `index.html` 已拆成 `src/` 下的 ES Module + CSS 模組。詳見 [`doc/PROGRESS.md`](./doc/PROGRESS.md)。

## 技術棧

- **前端**:原生 ES Module + Vite 工具鏈(無框架)
- **後端**:Supabase(PostgreSQL + Storage + Realtime)
- **PWA**:可安裝到手機主畫面,支援 standalone 模式
- **部署**:`npm run build` 產出 `dist/`,可放任意靜態主機(GitHub Pages、Netlify、Vercel…)

## 專案結構

```
inbody-tracker/
├── src/
│   ├── index.html         # markup,無 inline handler
│   ├── styles/            # 14 個 CSS 模組(含 entry index.css)
│   └── scripts/           # 15 個 JS 模組
│       ├── main.js        # 入口
│       ├── state.js       # 集中狀態
│       ├── constants.js   # COLORS, MONTHS, DEFAULT_PIN
│       ├── config.js      # localStorage > .env 連線優先級
│       ├── supabase-client.js
│       ├── auth.js / members.js / inbody.js / calendar.js
│       ├── achievements.js / manager.js / photos.js / photo-viewer.js
│       ├── splash.js / utils.js
│       └── event-bindings.js  # 集中綁定 + 事件代理
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icons/             # icon-192.png / icon-512.png
├── doc/
│   ├── optimization-plan.md
│   ├── PROGRESS.md
│   ├── acceptance-criteria.md
│   └── implementation-considerations.md
├── package.json           # vite + supabase-js 為 npm dep
├── vite.config.js
├── eslint.config.js
├── .prettierrc.json
├── .env.example           # 範本(VITE_SUPABASE_URL / _ANON_KEY)
└── README.md
```

## 本地啟動

### 1. 安裝依賴(首次)

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
```

`.env` 已預填一組可直接連線的 Supabase URL / anon key,如要連自己的專案,改這個檔即可。
**`.env` 已在 `.gitignore` 中,不會被 commit。**

> 連線優先級:`localStorage` 的 `sb_cfg`(使用者透過 app 設定畫面輸入)> `.env`(預設)。
> 如果 `.env` 與 localStorage 都沒有,會自動進入 in-app 設定畫面讓你貼 URL/key。

### 3. 啟動 dev server

```bash
npm run dev
```

預設在 <http://localhost:5173>,支援 HMR。

### 4. Production build

```bash
npm run build      # 產出 dist/
npm run preview    # 在本地預覽 production build
```

## 其他常用指令

```bash
npm run lint           # ESLint 檢查
npm run lint:fix       # 自動修可修的 lint 問題
npm run format         # Prettier 格式化全部 src/
npm run format:check   # 檢查格式但不改檔
```

## 預設帳密

| 用途 | 預設值 | 修改方式 |
|---|---|---|
| 會員登入密碼 | `1234` | 管理員端 → 會員列表 → Set password |
| 管理員 PIN | `1234` | 管理員端 → System → 改 PIN |

## 功能總覽

### 會員端

#### 登入
- 從會員姓名下拉選單選自己的帳號
- 輸入密碼登入(預設 `1234`,可由管理員修改)
- 密碼支援顯示/隱藏切換

#### 會員列表
- 卡片式會員列表,按最新總分降序排列
- 每張卡片顯示:頭像、姓名、年齡、身高、最新總分、本月 InBody 提交狀態
- 卡片背景可由管理員自訂圖片

#### 個人頁 — InBody 數據(按月份)
- 36 個月資料(2026 年 4 月起)
- 每月可記錄:
  - **WT**　體重(kg)
  - **SMM**　骨骼肌重(kg + %)
  - **BFM**　體脂肪重(kg + %)
  - **PBF**　體脂肪率(%)
  - **Overall Score**　總分(0–100)
  - **Report Photo**　InBody 報告照片(自動壓縮、上傳至 Supabase Storage)
- 月份狀態圖示:已提交(綠勾)/本月未提交(橙警告)/過去未提交(紅叉)/未來月(灰)
- 本人才能編輯自己的資料;他人頁面唯讀

#### 個人頁 — 運動日曆
- 月曆視圖,顯示每日打卡狀態
- 三種狀態:一般運動日 / InBody 量測日 / 未打卡
- 點擊日期即可即時打卡(自動儲存)
- 顯示當月已運動天數 / 總天數

#### 個人頁 — 成就
- 顯示所有成就(已解鎖在前、未解鎖在後)
- 6 個稀有度等級:common、uncommon、rare、epic、legendary、mythic
- 每筆成就含:圖示、標題、敘述、稀有度標籤、解鎖日期

#### 圖片檢視器
- 點擊報告照片開啟全螢幕檢視
- 支援雙指縮放、拖曳平移、雙擊縮放、滑鼠滾輪縮放(桌面)

### 管理員端

進入方式:會員列表頁 → PIN 模態(預設 PIN `1234`,存於本地 `localStorage`)

#### 會員管理
- 新增 / 編輯 / 刪除會員(姓名、生日、身高)
- 為會員設定登入密碼
- 上傳會員頭像(400×400 px,自動壓縮)
- 上傳會員卡片背景(750×390 px,自動壓縮)

#### 成就管理
- 建立新成就(標題、敘述、稀有度、PNG 圖示上傳)
- 刪除成就(會從所有會員身上移除)
- 為個別會員切換解鎖狀態(即時生效)

#### 系統設定
- 修改管理員 PIN(4–8 位數字)

### 即時同步
- 透過 Supabase Realtime 訂閱 `members` 與 `achievements` 表變更
- 任何會員或成就資料更新會即時同步到所有開啟此 app 的裝置

## 資料模型

### Supabase 資料表

兩張表都用 jsonb 欄位儲存所有業務資料,前端 read-modify-write。
> Phase 2 計畫將拆為正規化的 `inbody_records` / `workout_logs` / `achievement_unlocks` 表,詳見 `doc/optimization-plan.md`。

#### `members`
| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | uuid | Primary key |
| `created_at` | timestamp | 建立時間 |
| `data` | jsonb | 會員所有資料(見下) |

`data` jsonb 結構:
```json
{
  "name": "string",
  "password": "string",
  "birthday": "YYYY-MM-DD",
  "height": "number",
  "avatarUrl": "string",
  "cardBgUrl": "string",
  "monthData": {
    "2026-04": {
      "wt": 0, "smm": 0, "smm_pct": 0,
      "bfm": 0, "bfm_pct": 0, "pbf": 0,
      "overall": 0, "photoUrl": "string"
    }
  },
  "workouts": {
    "2026-04-15": 1
  },
  "unlockedAchievements": {
    "<achievement-id>": "2026-05-01T..."
  }
}
```

`workouts` 數值對照:`1` = 一般運動日、`2` = InBody 量測日。

#### `achievements`
| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | uuid | Primary key |
| `created_at` | timestamp | 建立時間 |
| `data` | jsonb | `{ title, narrative, rarity, iconUrl }` |

### Supabase Storage

需要一個 public bucket:`inbody-photos`,使用以下目錄:
- `<memberId>/<monthKey>_<timestamp>.jpg`　月份 InBody 報告
- `avatars/<memberId>_<timestamp>.jpg`　會員頭像
- `cardbg/<memberId>_<timestamp>.jpg`　卡片背景
- `achievement-icons/<timestamp>.png`　成就圖示

## 自架 Supabase

1. 在 <https://supabase.com> 建立新專案
2. SQL Editor 建立兩張表:
   ```sql
   create table members (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz default now(),
     data jsonb default '{}'::jsonb
   );

   create table achievements (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz default now(),
     data jsonb default '{}'::jsonb
   );
   ```
3. Storage 建立 public bucket:`inbody-photos`
4. 設定 RLS policies(至少允許 anon 讀寫,正式上線需收緊)
5. 啟用 Realtime:Database → Replication → 勾選 `members` 與 `achievements`
6. 把 URL 與 anon key 填到本地 `.env`,或開啟 app 後在設定畫面輸入

## 安全性注意事項

> Phase 3 計畫將處理以下,本期(Phase 1)只做架構重構與基本衛生改善:

- Supabase anon key 透過 `.env` 注入,但仍會被 bundle 進前端,等同公開,安全性依賴 RLS
- 會員密碼以明文存於 jsonb(無雜湊),且 anon key 可讀寫
- 管理員 PIN 存於 `localStorage`,每台裝置獨立,可被前端繞過
- 若要正式營運,建議改用 Supabase Auth、加上密碼雜湊、收緊 RLS policies

## PWA 安裝

- iOS Safari:分享 → 加入主畫面
- Android Chrome:選單 → 安裝應用程式
- 桌面 Chrome:網址列右側「安裝」圖示

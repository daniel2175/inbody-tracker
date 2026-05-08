# Green Goddesses InBody

健身工作室「Green Goddesses」會員專用的 InBody 體組成追蹤 PWA。單檔案 HTML 應用，後端使用 Supabase。

## 技術棧

- **前端**：純 HTML / CSS / 原生 JavaScript（無框架、無建構流程）
- **後端**：Supabase（PostgreSQL + Storage + Realtime）
- **PWA**：可安裝到手機主畫面，支援 standalone 模式
- **部署**：純靜態檔，可放任意靜態主機（GitHub Pages、Netlify、Vercel…）

## 專案檔案

```
inbody-tracker/
├── index.html       # 全部程式碼（HTML + CSS + JS，含內嵌圖示）
├── manifest.json    # PWA manifest
├── icon-192.png     # PWA 圖示
├── icon-512.png     # PWA 圖示
└── README.md
```

## 功能總覽

### 會員端

#### 登入
- 從會員姓名下拉選單選自己的帳號
- 輸入密碼登入（預設 `1234`，可由管理員修改）
- 密碼支援顯示／隱藏切換

#### 會員列表
- 卡片式會員列表，按最新總分降序排列
- 每張卡片顯示：頭像、姓名、年齡、身高、最新總分、本月 InBody 提交狀態
- 卡片背景可由管理員自訂圖片

#### 個人頁 — InBody 數據（按月份）
- 36 個月資料（2026 年 4 月起）
- 每月可記錄：
  - **WT**　體重（kg）
  - **SMM**　骨骼肌重（kg + %）
  - **BFM**　體脂肪重（kg + %）
  - **PBF**　體脂肪率（%）
  - **Overall Score**　總分（0–100）
  - **Report Photo**　InBody 報告照片（自動壓縮、上傳至 Supabase Storage）
- 月份狀態圖示：已提交（綠勾）／本月未提交（橙警告）／過去未提交（紅叉）／未來月（灰）
- 本人才能編輯自己的資料；他人頁面唯讀

#### 個人頁 — 運動日曆
- 月曆視圖，顯示每日打卡狀態
- 三種狀態：一般運動日 / InBody 量測日 / 未打卡
- 點擊日期即可即時打卡（自動儲存）
- 顯示當月已運動天數 / 總天數

#### 個人頁 — 成就
- 顯示所有成就（已解鎖在前、未解鎖在後）
- 6 個稀有度等級：common、uncommon、rare、epic、legendary、mythic
- 每筆成就含：圖示、標題、敘述、稀有度標籤、解鎖日期

#### 圖片檢視器
- 點擊報告照片開啟全螢幕檢視
- 支援雙指縮放、拖曳平移、雙擊縮放、滑鼠滾輪縮放（桌面）

### 管理員端

進入方式：會員列表頁 → PIN 模態（預設 PIN `1234`，存於本地 `localStorage`）

#### 會員管理
- 新增 / 編輯 / 刪除會員（姓名、生日、身高）
- 為會員設定登入密碼
- 上傳會員頭像（400×400 px，自動壓縮）
- 上傳會員卡片背景（750×390 px，自動壓縮）

#### 成就管理
- 建立新成就（標題、敘述、稀有度、PNG 圖示上傳）
- 刪除成就（會從所有會員身上移除）
- 為個別會員切換解鎖狀態（即時生效）

#### 系統設定
- 修改管理員 PIN（4–8 位數字）

### 即時同步
- 透過 Supabase Realtime 訂閱 `members` 與 `achievements` 表變更
- 任何會員或成就資料更新會即時同步到所有開啟此 app 的裝置

## 預設帳密

| 用途 | 預設值 | 修改方式 |
|---|---|---|
| 會員登入密碼 | `1234` | 管理員端 → 會員列表 → Set password |
| 管理員 PIN | `1234` | 管理員端 → System → 改 PIN |

## 資料模型

### Supabase 資料表

兩張表都用 jsonb 欄位儲存所有業務資料，前端 read-modify-write。

#### `members`
| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | uuid | Primary key |
| `created_at` | timestamp | 建立時間 |
| `data` | jsonb | 會員所有資料（見下） |

`data` jsonb 結構：
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

`workouts` 數值對照：`1` = 一般運動日、`2` = InBody 量測日。

#### `achievements`
| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | uuid | Primary key |
| `created_at` | timestamp | 建立時間 |
| `data` | jsonb | `{ title, narrative, rarity, iconUrl }` |

### Supabase Storage

需要一個 public bucket：`inbody-photos`，其中三個目錄：
- `<memberId>/<monthKey>_<timestamp>.jpg`　月份 InBody 報告
- `avatars/<memberId>_<timestamp>.jpg`　會員頭像
- `cardbg/<memberId>_<timestamp>.jpg`　卡片背景
- `achievement-icons/<timestamp>.png`　成就圖示

## 本地執行

不能直接 `open index.html`（PWA 與 Supabase 需要 HTTP origin）。在專案目錄起一個靜態伺服器：

```bash
# Python（macOS 內建）
python3 -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

開啟 <http://localhost:8000>。

Supabase URL 與 anon key 已寫死在 `index.html`，第一次開啟會自動使用。若要連到自己的 Supabase，可清除 localStorage 的 `sb_cfg` 鍵，會跳出設定畫面讓你輸入。

## 自架 Supabase

1. 在 <https://supabase.com> 建立新專案
2. SQL Editor 建立兩張表：
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
3. Storage 建立 public bucket：`inbody-photos`
4. 設定 RLS policies（至少允許 anon 讀寫，正式上線需收緊）
5. 啟用 Realtime：Database → Replication → 勾選 `members` 與 `achievements`
6. 開啟 app，輸入 Project URL 與 anon key

## 安全性注意事項

- Supabase anon key 寫死在前端原始碼，等同公開，安全性完全依賴 RLS
- 會員密碼以明文存於 jsonb（無雜湊），且 anon key 可讀寫
- 管理員 PIN 存於 `localStorage`，每台裝置獨立，可被前端繞過
- 若要正式營運，建議改用 Supabase Auth、加上密碼雜湊、收緊 RLS policies

## PWA 安裝

- iOS Safari：分享 → 加入主畫面
- Android Chrome：選單 → 安裝應用程式
- 桌面 Chrome：網址列右側「安裝」圖示

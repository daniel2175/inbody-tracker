# 1. App Summary

## App Name Ideas

**[Grip] [Gradient]** - 爬山遊戲 + 收集動物 + 探索遺跡

**[Gripple] [Gripped]**</mark> - 爬山遊戲 + 收集動物 + 探索遺跡 - **Top 2 choices**

## App Logo Moodboard

**[Gradient]** - 山脈跟日出的組合，山脈中流躺血管的光芒，也許可以有人在畫面中。

**[Grip] [Gripple] [Gripped]** - Piton + 手握住的組合，也許可以長得像G

## One-line Pitch

> 一個可以在健身時記錄成果、進度，分享給朋友互相激勵，並在組間休息時打發時間的app。

---

# 2. Concept

## Problem

市面上沒有很多紀錄健身進度的app，也沒有太多可以分享健身進度、與朋友同樂的地方。

## Solution

Gamify 健身紀錄，並讓健身成為一個團體活動，能夠互相激勵。

## Core Idea

我們打造一個結合系統化健身進度追蹤與社群遊戲化的 app。使用者可以完整記錄訓練內容 (動作、重量、組數) 與身體數據 (體脂率、肌肉量、InBody)，並與朋友分享鍛鍊成果。核心特色是將健身進度遊戲化，app 裡面你可以與不同朋友組合進行不同的登山遠征，而每個人的健身紀錄都會影響登山遊戲中的進度。訓練越努力，使用者便可以達成健身里程碑以解鎖遊戲道具，藉此爬得越快，遊戲進度也會反映在個房間的排行榜上，成為持續健身的動力，形成正向循環。讓健身不只是個人旅程，也增進朋友圈的情誼。

## Marketing Pitch

讓健身不再是與自己的掙扎搏鬥，而是一場與朋友踏出都市的登山冒險！

過去這兩年，健身成為「初級大人」的必修課之一，除了是保持健康及體態，更是維持生活圈的重要趨勢。但在冰冷的現實和工作壓力，健身反而常常成為另一個壓著大家喘不過氣的來源，甚至讓許多人成為三點一線 (家、工作、健身房) 的機器人。

因此童心未泯的製作團隊，想要將健身轉換成維繫朋友圈的重要一環，讓好久沒跟死黨們出去旅遊或打上一把遊戲的你，給心情放個假！

我們的 app 讓你可以輕鬆追蹤自己跟朋友的健身進度和體態。你跟朋友每一次的訓練與達成成就，都能解鎖不同道具，推動你們在登山冒險中的旅程。在組間休息的時候，拿出你的手機，與朋友一起探索美麗風景、發現遺跡，征服一座座壯闊幽靜的高山！

---

# 3. Key Features

## Personal Board / Main Page

**Base Information (基本資料)：**
- 姓名(綽號)
- 生日 / 年齡
- 身高

**Current Stats (當前數值)：**
- 當前體重
- 最新體脂率
- 當前骨骼肌量
- 本週訓練次數
- 連續簽到天數

**Achievement (成就清單)：**
- 點入可看到已解鎖的所有成就徽章 (選擇一個徽章當展示 icon)
- 點入可看到目前各項成就等級 (選擇一個稱號當展示 icon)

**Rooms (登山隊伍)：**
- 顯示所有加入的 Room
- 快速查看各隊伍目前登山進度
- 未讀留言提醒

**Calander (每日簽到)：**
- 每日簽到狀況
- 快速查看每天練了什麼部位

**Records (日常紀錄)：**
- 紀錄當天訓練部位、組數
- 上傳 Inbody Report

**Settings (設定)：**
- 更改個人資料
- 音量調整

## Workout Tracking

- **每日簽到**
  - 類別： 胸、背、腿、肩膀、二頭、三頭、腹、有氧
  - 詳細記錄： 記錄每次訓練的動作、重量、次數、組數
- **Inbody 與數據追蹤：** 每月上傳 Inbody Report，追蹤體重、肌肉量、體脂率變化

## Achievement

- 達成不同成就 - 解鎖遊戲道具 (Energy Drinks、Quickdraws …etc.)
- 成就類別 - 連續簽到天數、肌肉量增加 ...等等。

## Group + Ranking

- 多重登山 Room - 每個人可以與不同朋友組成不一樣的爬山隊伍
- 房間裡面的 shops 可以購買對登山旅程有用的道具
- 留言板讓隊友互相打氣、分享心得
- 制定共同目標成就，一起解鎖
- 隊友排名系統 (以貢獻度和成就排序)

## Game

- 登山遊戲，機制與 Cairn 類似。
- 多人一起攀登，每個人都綁在一起，因此掉落時最多掉到目前進度最慢人的身邊 (最後一名玩家有掉落至底端風險)。
- 所用道具 (piton、臨時帳篷) 不會消失，因此後面玩家可以使用，也可以收回。
- 兩人在附近時，能夠借力使力進行跳躍。
- 兩人同時在健身時，會被boosted，移動速度加快。

---

# 5. Game Design

## 1. Game Overview

**Game Type / Genre**

Adventure, Simulation

**Platform**

Mobile (iOS / Android)

**When Player Plays It**

任何時候都可以往上爬，但當天有健身簽到，當天最大能量值會是沒簽到的三倍，鼓勵健身簽到後，組間休息遊玩。

**Design Goal**

提升健身動機 & 樂趣、將健身變成一個可以團體互相激勵的活動。

## 2. Core Gameplay

**Core Concept**

團體登山，藉由健身成就及簽到獲取的道具，與朋友一起享受遊戲中登山美景、動物、遺跡，與進步帶來的成就感，並到達山的頂端。(這個世界發生了甚麼事，所以需要登山)

**Progress Condition**
- 所有人達到山頂，可以前往下一座山脈探索。
- 先到達頂端的人可以幫下方玩家打造道具、烹調食物、並垂吊資源給下方玩家。

## 3. Core Mechanics

**Player Controls**
- **Tap** - 攀爬/行走至點擊地方、蒐集點擊物品
- **Swipe Left / Right** - 以角色為中心轉換角度
- **Hold → Swipe up** - 使用道具 (swipe up 時機要正確，不然會壞掉或只能短暫使用)
- **Zoom Out / Zoom In**
  - 可以觀看上下方地形跟其他人進度，這時上述攀登時的行動機制 disabled。
  - Tap - 點擊其他人物看運動紀錄、角色狀態，點擊已發現遺跡看資源及發現者。
  - Swipe Up / Down - 檢視模式上下移動。
  - Swipe Left / Right - 以畫面中點為中心轉換角度

**Climb & Fall**
- 攀爬時，會因距離不同消耗不一樣的能量值。
- 每個人每次移動有固定耐力值，若耐力值結束前沒到達可以站立/抓住piton休息地方，會掉落至最接近的的下方玩家旁邊。
- 在耐力值快結束前，玩家可以算好時機按住道具，有一個量表 (**Grip 值**) 會出現，從最低到最高，玩家盡力在 Grip 值到最大的狀態上滑，以穩固地裝釘piton。( 狀態30% - 80%，則會不穩，用一次即毀壞。低於30%，則裝釘不成功。)
- 在休息點或頂端之玩家，可以垂吊資源給下方玩家，此助人經驗值，會逐漸累積，並提升你的耐力值。

## Items

### Common (普通) - 每日簽到可得：
- **Water Packs (水包)** - 恢復少量口渴值，物品可疊加儲存。
- **Energy Gel (能量膠)** - 恢復少量能量
- **Electrolyte Pack (電解質包)** - 恢復口渴 + 接下來三次提升耐力上限
- **Protein Bar (蛋白棒)** - 恢復少量飢餓值
- **Donuts (甜甜圈)** - 恢復少量飢餓值
- **Trail Paint (路徑油漆)** - 使用後兩天內，可留下你攀爬的軌跡，讓隊友看到你的路徑。

### Special (特殊) - 15% 機率：
- **Energy Drinks (能量飲料)** - 恢復能量值
- **Cooked Meat (熟肉)** - 大幅恢復飢餓值
- **Portable Stove (攜帶型火爐)** - 可煮熟食物
- **Backpack Pockets (登山包)** - 增加背包容量 +2
- **Descenders (下降器)** - 可以從上方固定一點後，下降至下方地形，並再探索完後，上升回固定點。

### Rare (稀有) - 7.5% 機率：
- **Hot Coffee (熱咖啡)** - 恢復能量 + 暫時抵抗寒冷，移動速度不會因雪地變慢
- **Pitons (岩釘)** - 創造固定點，防止掉落
- **Ice Axe (冰斧)** - 創造可以同時兩人使用的固定點，防止掉落
- **Heat Packs (暖暖包)** - 在寒冷地形使用，移動速度不會因雪地變慢
- **Headlamp (頭燈)** - 在夜間地形看到隱藏資源
- **Snow Shovel (雪鏟)** - 挖掘雪地找到埋藏資源

### Epic (史詩) - 3% 機率：
- **Bivy Sack (露宿睡袋)** - 野外任何地方都能休息恢復
- **Crampon Boost (冰爪加速)** - 使用後1分鐘內，獲得 1.5x 速度
- **Trail Mix (能量堅果)** - 同時恢復大量飢餓值和口渴值
- **Temporary Platforms (臨時平台)** - 隨處創造站立點
- **Climbing Tape (攀岩膠帶)** - 修復破損工具

### Legendary (傳奇) - 1% 機率：
- **Portaledge (懸掛帳篷)** - 隨處創造站立點，並可休息回復能量值。
- **Oxygen Tank (氧氣瓶)** - 完全恢復能量值
- **Space Food (太空食物)** - 恢復全部飢餓+口渴值
- **Lucky Charm (幸運符)** - 接下來五次道具使用必定成功 (無視 Grip 值)
- **Quickdraws (快扣)** - 使用後3分鐘內，獲得 2x 速度

### 工具類 (Tools)（使用都需要抓準時機按 Grip 值）：
- **Pitons (岩釘)** - 創造固定點，防止掉落
- **Descenders (下降器)** - 可以從上方固定一點後，下降至下方地形，並再探索完後，上升回固定點。
- **Crampon Boost (冰爪加速)** - 暫時大幅提升攀爬速度
- **Quickdraws (快扣)** - 加速攀爬
- **Headlamp (頭燈)** - 在夜間地形看到隱藏資源
- **Ice Axe (冰斧)** - 創造可以同時兩人使用的固定點，防止掉落
- **Snow Shovel (雪鏟)** - 挖掘雪地找到埋藏資源
- **Temporary Platforms (臨時平台)** - 隨處創造站立點

## Resources

**Nature Resources (可站立處探索)：**
- **Spring Water (泉水)** - 可裝滿水瓶，4份泉水為滿瓶。
- **Wild Berries (野莓)** - 恢復少量飢餓值
- **Herbs (藥草)** - 補充能量值
- **Mushrooms (蘑菇)** - 恢復少量飢餓值，有小機率毒蘑菇 (移動速度變慢)
- **Snow (積雪)** - 可融化成水 (需要火爐)

**Hunting：**
- **Wild Rabbit (野兔)** - 捕獲後可獲得生肉 (需要火爐煮熟)
- **Mountain Goat (山羊)** - 稀有，獲得大量生肉 (需要火爐煮熟)
- **Fish (魚)** - 在溪流處有機會捕獲 (需要火爐煮熟)

**Wastes：**
- **Water Bottles (廢棄水瓶)** - 可裝 4 份泉水 (本身就一定有一個，可疊加儲存)
- **Rusty Piton (生鏽岩釘)** - Grip 值更難成功的岩釘
- **Torn Tent (破帳篷)** - 可在站立處臨時休息但恢復效果減半
- **Wornout Platforms (破損平台)** - 隨處創造站立點，使用完即毀壞

**Minerals：**
- **Metal Ore (金屬礦)** - 可在遺跡中製作工具
- **Ice Crystal (冰晶)** - 在高海拔地區，恢復大量口渴值
- **Volcanic Rock (火山岩)** - 特定山脈，可用於生火 (等同攜帶式火爐)

**Ancient Relics：**
- **Yak Horn (犛牛角)** - 提升耐力值上限
- **Hawk Feather (老鷹羽毛)** - 使用後15秒內無視耐力值限制
- **Sherpa's Blessing (雪巴祝福)** - 全隊成員下次開啟時獲得 2x 速度，持續 10 分鐘
- **Formosan Black Bear Claw (台灣黑熊爪)** - 使用當天工具無視 Grip 值挑戰
- **Husky's Tight Grip (哈士奇的懷抱)** - 免疫一次掉落
- **Rope of Eternity (永恆之繩)** - 保護全隊不掉落，持續一次攀爬
- **Summit Token (登頂令牌)** - 直接傳送到隊友最高位置
- **Ancient Map Fragment (古地圖碎片)** - 收集全部碎片解鎖隱藏山脈
- **First Explorer's Amulet (首位探險者勳章)** - 該遺跡首位發現者，永久 +5% 所有能力

## Exploration

- 可以站立的地方可以進行探索，看是否有前人留下物品、天然資源 (藥草、野兔、莓果、金屬)
- 每座山可能會有幾個遺跡，裡面除了有資源，可能有些某些山特有的故事或民族遺物，發現者找到遺物會有不同的buff。

## Stats

- **能量值** - 決定當天可以爬多少的數值。可透過道具 (能量飲料、在臨時帳篷休息) 回復，每天會因為是否有打卡有不一樣的最大能量值
- **耐力值** - 決定一次可以爬多遠的數值。在可休息處會回滿。幫助隊友會升級耐力值。
  - **助人值** - 決定耐力值的升級。每次幫助隊友 (垂吊資源、借力使力、後方玩家使用你留下道具) 即累積助人經驗值，累積一陣子後耐力值增加。
- **飢餓值** - 決定 Grip 值上下的速度，越餓 meter 上下速度越快，越難以抓準時機。可藉由吃食物改善。
  - **Grip 值** - 決定道具的使用成功機率。狀態30% - 80%，則會不穩，用一次即毀壞。低於30%，則裝釘不成功。
- **口渴值** - 決定攀爬速度。可藉由喝泉水 / 瓶裝水改善。

## 4. Game Loop（核心循環）

**Actions**

1. 攀登 + 使用道具
2. 探索 + 服用水或食物回復能力值
3. 蒐集資源
4. 循環
5. 到達頂端 → 幫助友伴
6. 等待全員到齊前往下一山脈

---

# 6. Motivation & Progression

## Progress Loop

> 運動 & 達到目標 → 獎勵 → 遊戲 → Rank up → 更有動力運動

## Reward Systems

- Ranking 系統
- 簽到獲得 Common 道具，有機會隨機獲得 Special (15%) 或 Rare (7.5%)
- 達成健身成就可獲得獎牌和更稀有道具，包括 Rare (7.5%), Epic (3%), Legendary (1%) ，獲得的道具稀有程度將依據成就本身難度
- 遊戲內成就解鎖頭像 / 稱號

---

# 7. Achievement System

## Progression Ranks

### _Eternal Headlamp (不滅頭燈)_

升等規則：達到目標即升等，一次未達凍結，兩次未達掉等

- **Slight Spark**：當週前往健身房累積 2 次
- **Glimmer Beam**：當週前往健身房累積 3 次
- **Bright light**：兩週內前往健身房累積 8 次
- **Keeping the light on**：三週內前往健身房累積 13 次
- **Glaring Shine**：四週內前往健身房累積 18 次
- **Eternal Headlamp**：四週內前往健身房累積 20 次以上

---

### ~~_Focus Goddess_~~

~~升等規則：達到目標即升等，一次未達凍結，兩次未達掉等~~

- ~~**Minion**：連續簽到 2 天~~
- ~~**Apprentice**：連續簽到 3 天~~
- ~~**Warrior**：連續簽到 4 天~~
- ~~**Lord**：連續簽到 5 天~~
- ~~**King**：連續簽到 6 天~~
- ~~**Goddess**：連續簽到 7 天~~

---

### ~~_Body Tea Goddess_~~

~~升等規則：維持住不影響，降低即掉級~~

- ~~**Minion**：分數 70以下~~
- ~~**Apprentice**：分數 70–75~~
- ~~**Warrior**：分數 75–80~~
- ~~**Lord**：分數 80–85~~
- ~~**King**：分數 85–90~~
- ~~**Goddess**：分數 90+~~

---

### _Lean Goddess_

升等規則：維持住不影響，降低即掉級

- **Minion**：體脂 20% 以上
- **Apprentice**：17–19.9%
- **Warrior**：15–16.9%
- **Lord**：13–14.9%
- **King**：11–12.9%
- **Goddess**：11% 以下

---

### _Endless Backpack (無底洞背包)_

升等規則：達到目標即升等，一次未達凍結，兩次未達掉等

追蹤邏輯：以單一動作的最大重量 PR 為準

- **Handbag**：完成第一次重訓重量紀錄
- **School Backpack**：單項 PR 達到 30 kg
- **Duffel Bag**：單項 PR 達到 50 kg
- **Porter Pack**：單項 PR 達到 70 kg
- **PACKED**：單項 PR 達到 85 kg
- **Endless Backpack**：單項 PR 達到 100 kg

---

### _Unshakable Piton (堅毅岩釘)_

升等規則：維持住不影響，降低即掉級

- **No Grip**：肌肉量 20 kg 以下
- **Loosen**：20.1–30 kg
- **Half-in**：30.1–40 kg
- **Stable**：40.1–50 kg
- **Drilled-in**：50.1–60 kg
- **Unshakable**：60.1kg 以上

---

### _Windbreaker Boots (破風之靴)_

升等規則：達到目標即升等，一次未達凍結，兩次未達掉等

- **Broken Sandals**：一週 1 次 cardio
- **Wornout Shoes**：一週 2 次
- **New Sneakers**：一週 3 次
- **Hiking Boots**：一週 4 次
- **Ice Skates**：一週 5 次
- **Windbreaker Boots**：一週 6 次

---

### _Lifeline (生命之繩)_

升等規則：達到目標即升等，一次未達凍結，兩次未達掉等

- **First Knot**：每週點開朋友運動紀錄、留言板 2 天
- **Tied Up**：每週 3 天
- **Trust Fall**：每週 4 天
- **Got Your Back**：每週 5 天
- **Unbreakable Bonds**：每週 6 天
- **Lifeline**：每天

---

## One-Time Achievement

### InBody 系列

- **Habit Built**：連續三個月準時測量 InBody
- **First Step**：InBody 分數達到 75
- **The Climb**：InBody 分數達到 80
- **Uphill Battle**：InBody 分數達到 85
- **Almost There**：InBody 分數達到 90
- **Peak**：InBody 分數達到 100
- **What's Waiting on the Other Side**：InBody 分數達到 115

### Cardio系列

- **Two Pigs One Angry Bird**：同一次訓練同時包含 cardio 和重訓，達成三次
- **Sonic Can't Even Catch Up**：單週 cardio 累積時間超過三小時

### 登山系列

- **First Campfire**：完成第一次完整訓練記錄(包含動作、重量、組數)
- **Summit Push**：單日完成 3 個以上部位訓練
- **Dawn Patrol**：早上 7 點前簽到 5 次
- **Night Crawler**：晚上 10 點後簽到 5 次
- **Weather the Storm**：連續 30 天簽到
- **The Long Haul**：連續 100 天簽到
- **Everest Expedition**：累積訓練 365 次

### 特定部位系列

- **Roblox Built**：胸部訓練累積 30 次
- **Backing It Up**：背部訓練累積 30 次
- **Thunder Thighs**：腿部訓練累積 30 次
- **Hard Core**：腹部訓練累積 30 次
- **Washboard Abs**：腹部肌肉量達到 115% 且體脂低於 135%
- **Left Arm of the Forbidden One**：左手臂肌肉量達到 110%
- **Right Arm of the Forbidden One**：右手臂肌肉量達到 110%
- **Left Leg of the Forbidden One**：左腿肌肉量達到 110%
- **Right Leg of the Forbidden One**：右腿肌肉量達到 110%
- **Exodia the Forbidden One**：集齊以上四個成就 + 腹部達到110%
- **Thick Thighs Save Lives**：左右腿肌肉量達到 120%
- **Never Skip Leg Day**：連續四週都有練腿
- **Jacks of All Trades**：同一週內訓練所有 8 個部位

### 重訓紀錄系列

- **Defying Gravity**：任一動作重量突破體重
- **Double Trouble**：任一動作重量達到體重 2 倍
- **Triple Threat**：任一動作重量達到體重 3 倍
- **Iron Will**：單次訓練完成 20 組以上
- **Volume King**：單次訓練總重量突破 5000 kg
- **PR Streak**：連續三週都有 PR

### 社交系列

- **Let the Roping Begin**：建立第一個 Room
- **Squad Goals**：Room 內所有成員同一天都有訓練
- **Yapper**：在留言板發送 50 則訊息
- **Expeditioner**：同週參與 3 個以上 Room 的攀登
- **Papers, Please**：連續七天進行簽到 & 記錄

### 特殊成就

- **Birthday Grind**：生日當天完成訓練
- **Never Grow Up 🙂**：三個月Inbody分數沒有進步
- **New Year Resolution**：1月1日完成訓練
- **Data Nerd**：上傳 10 次 InBody Report
- **Body Tea**：體脂下降 5% 以上
- **Bulking Season**：肌肉量增加 5 kg 以上
- **Perfect Week**：一週內每天都簽到且都有完整記錄
- **Early Bird Gets the Guns**：連續一週都在早上 8 點前訓練
- **Gotta Catch 'Em All**：解鎖 50 個成就
- **Achievement Hunter**：解鎖 100 個成就
- **Hang in There Baby**：連續訓練 6 個月
- **Catch Up, Team**：任一項 PR 在一個月內提升 20% 以上

### 挑戰 / 困難系列

- **Relentless**：單月訓練 20 次以上
- **Iron Lungs**：單次 cardio 超過 120 分鐘
- **Marathon Mindset**：單月 cardio 累積 25 小時
- **Choronicles**：單月創下 5 個以上 PR
- **Green Goddess**：與夥伴攀登5座山

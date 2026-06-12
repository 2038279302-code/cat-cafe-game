# 🐱 猫咪咖啡馆 · 设计文档

> 技术栈：HTML5 + Canvas + 原生 JS（模块化，零依赖）

---

## 一、v1.0 核心要点总结

### 1.1 架构概览

```
index.html（单文件，约 710 行）
├── <style>   —— 所有样式（CSS-in-HTML）
├── DOM       —— 静态界面骨架（开始界面 / 暂停层 / 游戏UI）
└── <script>
    ├── G{}              全局游戏状态对象
    ├── ITEMS{}          菜品数据表
    ├── ACHLIST[]        成就列表
    ├── 绘制层           drawScene / drawCat / drawCust / drawMakeBar
    ├── 粒子系统         spawnPts / spawnHrt / updatePts / drawPts
    ├── 业务逻辑         selItem / petCat / spawnCust / completeOrder
    ├── UI 更新          showMsg / updateUI / checkAch / doLevelUp
    ├── 控制函数         startGame / togglePause / resumeGame / restartGame
    └── loop()           唯一 rAF 主循环（核心）
```

### 1.2 游戏状态对象 G

| 字段 | 类型 | 说明 |
|---|---|---|
| coins | number | 金币数 |
| lv / exp / expMax | number | 等级 / 经验 / 升级阈值（×1.5递增） |
| hap | number (0~100) | 猫咪心情，影响收益系数 |
| eng | number (0~100) | 服务质量（预留） |
| totalCus / done | number | 今日顾客数 / 完成订单数 |
| combo / comboTmr | number / timer | 当前连击数 / 6秒重置计时器 |
| sel | string | 当前选中菜品 key |
| custs[] | Customer[] | 在场顾客数组 |
| making / makeT / makeTgt / makingItem | - | 制作状态锁，防止并发接单 |
| running / paused | bool | 游戏启动 / 暂停标志 |

### 1.3 菜品数据表 ITEMS（v1）

| key | 名称 | 收益 | 制作时间 | 经验 | 解锁等级 |
|---|---|---|---|---|---|
| latte | 猫爪拿铁 | 12 | 2s | 8 | Lv.1 |
| cake | 草莓蛋糕 | 20 | 3s | 12 | Lv.1 |
| macaron | 马卡龙 | 15 | 2s | 10 | Lv.1 |
| parfait | 芭菲圣代 | 35 | 4s | 20 | Lv.3 |
| catcookie | 猫爪饼干 | 28 | 3s | 16 | Lv.5 |

### 1.4 收益计算公式

```
最终收益 = round( 基础收益 × 速度系数 × 连击系数 × 心情系数 )

速度系数：waitPct > 60% → 1.3x；> 30% → 1.0x；≤ 30% → 0.7x
连击系数：combo ≥ 10 → 2.0x；≥ 5 → 1.5x；≥ 3 → 1.2x；其余 → 1.0x
心情系数：0.9 + hap/500（范围约 0.9 ~ 1.1）
```

### 1.5 主循环关键逻辑（已修复的坑）

```js
function loop(now){
  rafId = requestAnimationFrame(loop); // 唯一rAF链，避免双循环竞争

  const dt = Math.min(now - lastTime, 50); // dt上限50ms防止切标签页后跳帧

  // 制作计时 → 完成订单（先清空 makeTgt 再调 completeOrder，避免状态竞争）
  // 顾客更新 → 用 removeIds Set 收集超时顾客，遍历结束后统一filter
  // 绘制顾客 → 先 .slice() 快照再遍历，避免绘制中数组被修改
}
```

### 1.6 已修复的历史 Bug

| Bug | 现象 | 根因 | 修复方案 |
|---|---|---|---|
| 双 rAF 循环 | 顾客/猫咪突然全部消失 | initLoop + loop 并行，并发 filter 替换数组 | 合并为唯一 loop，running=false 时只绘制静态内容 |
| 遍历中修改数组 | 顾客超时时其他顾客闪消 | forEach 中直接赋值 G.custs=filter(...) | removeIds Set + 遍历后统一过滤 |
| showMsg 销毁 DOM | 消息条失效，后续消息不显示 | innerHTML='' 销毁了 #msgbox 元素 | 直接修改 textContent，保留节点 |
| 制作品项错误 | 制作途中换选品导致进度/收益计算乱 | drawMakeBar/completeOrder 用 G.sel 而非订单 | 接单时锁定 G.makingItem = ITEMS[c.order] |
| 连击加成计算错位 | 第3单拿不到x1.2加成 | 先判断 cb 再 combo++ | 先 G.combo++ 再计算 cb |

### 1.7 成就系统（v1，11个）

初次营业 / 熟练店员(10单) / 咖啡达人(30单) / 小有积蓄(100金) / 金币大亨(500金) / 人气爆棚(20客) / 五连击 / 十连传说 / 猫咪最爱(摸过猫) / 咖啡馆明星(Lv.3) / 传奇店长(Lv.5)

---

## 二、v2.0 迭代记录（已完成 · 2026-06）

> v2.0 围绕"游戏闭环感 + 留存动力 + 策略趣味"三个方向完成了首批高优先级落地。

### 2.1 ① 存档系统（localStorage）

**目标**：给玩家"积累感"，跨局记录最好成绩，开始界面展示历史最佳激励重玩。

**实现要点**：
- 存储 key：`catcafe_best_v1`，结构 `{coins, maxCombo, lv, grade}`
- 只保留各维度历史最高值（合并写入，不覆盖）
- 评级采用字典序比较 `gradeOrder={S:4, A:3, B:2, C:1}`
- 触发时机：`closeShop()` 打烊时写入；`initBestDisplay()` 页面加载和回到首页时读取展示
- 首次游戏无存档时历史最佳卡片隐藏（`display:none`），有记录后自动显示

**新增 G 字段**：
```js
G.maxComboThisRun  // 本局最高连击，用于存档比较
G.missedCus        // 本局超时漏单数，用于结算评级
```

---

### 2.2 ② 今日营业结算界面

**目标**：给游戏一个明确的"收尾仪式感"，补完从开始→游戏→结束的完整循环。

**触发方式**：控制栏新增「🌙 打烊结算」按钮（紫色调，与暂停/重开视觉区分）。

**评级算法（满分100分）**：

| 维度 | 权重 | 说明 |
|---|---|---|
| 完成率（done/total） | ×40 | 最重要，惩罚漏单 |
| 最高连击 | 30分封顶 | ≥10全分，≥5共20，≥3共12，否则5 |
| 当前等级 | lv×4，≤20 | 奖励坚持游戏 |
| 金币 | 最多10分 | ≥500全分 |

评级区间：S≥88 / A≥70 / B≥50 / C<50

**弹窗内容**：
- 今日营业额 / 服务顾客 / 完成订单 / 最高连击（四格统计）
- 打破历史记录时出现 `NEW` 闪烁徽章
- 个性化亮点文案（全勤无漏单 / 达成连击 / 摸猫次数 / 解锁新等级等）
- 「再来一局」直接重置；「回到首页」回开始界面并刷新历史最佳

---

### 2.3 ③ 顾客多样化（VIP + 急性子）

**目标**：增加场上的信息密度和瞬时决策，让每一桌都不一样。

**类型分布**：

| 类型 | 概率 | 等待时长 | 视觉标记 | 收益规则 |
|---|---|---|---|---|
| 普通 | 60% | 14~23s | 无 | 正常公式 |
| VIP 👑 | 20% | 耐心×1.5（21~34s） | 金色皇冠 + 金光圈 + 金色等待条 | +基础收益×50% 小费 |
| 急性子 ⚡ | 20% | 仅 9~11s | 橙色闪电 + 脉冲光圈 + 橙红等待条 | 成功完成×2 倍金币 |

**收益公式更新**：
```js
// 急性子
earned = earned * 2

// VIP
const tip = Math.round(it.p * 0.5)
earned += tip
```

**策略意图**：
- VIP 对时间要求宽松，适合在急单堆叠时优先搞定急性子再回来服务
- 急性子时间窗口极短，需要玩家优先处理，否则失去高额奖励
- 两种类型同时在场时，玩家必须做顺序取舍，制造真实的压力感

---

### 2.4 ④ 模块化重构 + 移动端适配

**目标**：将单文件 900+ 行拆分为 6 个职责清晰的模块，同时完成移动端适配。

**文件结构**：

```
cat-cafe-game/
├── index.html        # 页面骨架，按序引用模块
├── css/style.css     # 样式（含 media query 移动端响应式）
└── js/
    ├── data.js       # 常量：ITEMS / ACHLIST / SEATS / CTYPES
    ├── state.js      # G 对象 + resetG()
    ├── draw.js       # 所有 Canvas 绘图函数
    ├── save.js       # localStorage 存读档
    ├── ui.js         # UI 刷新 / 消息 / 成就 / 飘字 / 摸猫
    └── game.js       # 主循环 / 顾客系统 / 订单逻辑 / 控制函数
```

**移动端适配要点**：
- `<meta name="viewport">` 禁止用户缩放，保证像素清晰
- Canvas 点击用 `getBoundingClientRect()` + scaleX/Y 映射，解决缩放后坐标偏移
- `touchend` 事件 + `preventDefault()` 防止穿透点击
- CSS `@media (max-width:800px)` 将三列布局改为纵向堆叠

---

## 三、v3.0 深度玩法（已完成 · 2026-06）

> 核心命题：**让玩家从"反应型操作"进化到"策略型经营"**。
>
> 三个系统相互咬合——多制作台让金币消耗有了出口，商店升级反哺制作效率，猫咪技能给高压节奏提供喘息空间。

---

### 3.1 多单并行制作台（已落地）

**痛点**：making 锁是体验瓶颈。3 个顾客同时等待，玩家却只能做 1 单，剩余 2 桌只能干看着。

#### 实现方案

用 `G.stations[]` 数组替代单一 making 锁，每个制作台是独立状态机：

```js
// state.js
function makeStation(){ return {making:false, makeT:0, makeTgt:null, makingItem:null}; }

G.stations = [makeStation()]; // 默认 1 台，购买后 push 新台
```

**主循环改造**（game.js）：
```js
G.stations.forEach(st => {
  if (!st.making) return;
  st.makeT -= dt;
  if (st.makeT <= 0) {
    const tgt = st.makeTgt;
    st.making = false; st.makeTgt = null; st.makingItem = null;
    completeOrder(tgt, false);
  }
});
```

**点击分配逻辑**：
```js
const freeSt = getFreeStation(); // 找第一个 making===false 的台
if (!freeSt) { showMsg('所有制作台都忙！去商店解锁更多台'); return; }
freeSt.making = true; freeSt.makeTgt = c; freeSt.makingItem = item;
freeSt.makeT = calcMakeTime(item.t); // 含咖啡机 + 灵爪技能加速
```

**UI 变化**：Canvas 底部制作区从 1 条进度条变为最多 3 条并排，粉/蓝/黄颜色区分台序。

**解锁节奏**：

| 制作台 | 解锁条件 |
|---|---|
| 台①（默认） | 初始已有 |
| 台②  | 商店花 💰200 购买 |
| 台③  | 商店花 💰500 购买 |

---

### 3.2 升级商店（已落地）

**触发方式**：控制栏新增「🛒 商店」按钮，点击弹出购买面板（不打断游戏）。

**三条升级线**：

| 升级线 | 等级 | 价格 | 效果 |
|---|---|---|---|
| 🏗️ 制作台扩展 | 台② | 💰200 | 并行 ×2 |
| 🏗️ 制作台扩展 | 台③ | 💰500 | 并行 ×3 |
| ⚡ 咖啡机提速 | Lv.1 | 💰150 | 制作时间 -15% |
| ⚡ 咖啡机提速 | Lv.2 | 💰300 | 制作时间 -30% |
| ⚡ 咖啡机提速 | Lv.3 | 💰700 | 制作时间 -45% |
| 🪑 等候区扩容 | Lv.1 | 💰300 | 顾客上限 4 人 |
| 🪑 等候区扩容 | Lv.2 | 💰600 | 顾客上限 5 人 |

**状态对象新增字段**（state.js）：
```js
G.shopUpgrades = {
  stations: 0,  // 0=1台, 1=2台, 2=3台
  machine:  0,  // 咖啡机等级 0~3
  waitroom: 0   // 等候区等级 0~2
}
```

**制作时间计算**（含多层加速叠加）：
```js
function calcMakeTime(baseT){
  let t = baseT;
  if (G.shopUpgrades.machine > 0) t *= (1 - G.shopUpgrades.machine * 0.15);
  if (G.catSkills.has('swift'))   t *= 0.9; // 灵爪技能
  return Math.max(500, Math.round(t));
}
```

**持久化**：升级数据存入 `localStorage`（key: `catcafe_shop_v3`），跨局保留，重开页面依然有效。

**经济平衡**：
- 台②（200金）：约完成 15~20 单后可购，首次升级成就感强
- 提速 Lv.1（150金）：买完立刻感受节奏变化，正反馈强烈
- 等候区（300金）：第4位顾客立即涌入，高风险高回报

---

### 3.3 猫咪技能成长线（已落地）

**痛点**：摸猫只是小彩蛋，没有成长感，玩家很快不再主动触发。

#### 亲密度系统

每次摸猫 `G.catBond + 1`，累积解锁 3 个被动技能，跨局持久保存。

**三个技能**：

| 技能 | 解锁条件 | 效果 | 实现 |
|---|---|---|---|
| 🔔 招呼天赋 | catBond ≥ 5 | 顾客生成间隔 -10% | `calcCusInterval()` 内 `base *= 0.9` |
| ✨ 灵爪加速 | catBond ≥ 15 | 所有制作时间 -10% | `calcMakeTime()` 内 `t *= 0.9` |
| 🐾 猫咪帮厨 | catBond ≥ 30 | 每8单 25% 概率自动完成1单 | `tryCatAutoComplete()` 在订单完成后调用 |

**帮厨触发逻辑**：
```js
function tryCatAutoComplete(){
  if (!G.catSkills.has('help')) return;
  if (G.done % 8 !== 0 || G.done === 0) return;
  if (Math.random() > 0.25) return;

  const waiting = G.custs.filter(c => !c.arriving && !getStationForCust(c.id));
  if (!waiting.length) return;

  const target = waiting[Math.floor(Math.random() * waiting.length)];
  G.catAutoCount++;
  completeOrder(target, true); // isAuto=true，结算时显示"猫咪帮厨！"
}
```

**设计亮点**：
- 技能3「帮厨」与多台系统配合——所有制作台都满时，帮厨给玩家意外喘息空间，情感价值强
- 三个技能叠加上限：咖啡机 Lv.3（-45%）+ 灵爪（-10%）= 最高 -55% 制作时间

**新增 G 字段**（state.js）：
```js
G.catBond    = 0          // 累计亲密度（跨局保存）
G.catSkills  = new Set()  // 已解锁技能 id 集合（跨局保存）
G.catAutoCount = 0        // 本局帮厨次数（用于结算亮点文案）
```

**UI 呈现**（右侧面板新增区域）：
- 亲密度进度条（动态显示距下一技能的进度）
- 技能列表（未解锁灰显，已解锁高亮，带技能效果说明）

---

### 3.4 新菜品扩充（已落地）

v3 新增 2 款高等级菜品：

| key | 名称 | 收益 | 制作时间 | 经验 | 解锁等级 |
|---|---|---|---|---|---|
| pudding | 猫咪布丁 🍮 | 42 | 4.5s | 24 | Lv.7 |
| waffle | 彩虹华夫饼 🧇 | 50 | 5s | 30 | Lv.9 |

---

### 3.5 成就系统扩展（已落地，共 15 个）

v3 新增 4 个成就：

| 成就 | 触发条件 |
|---|---|
| 🐱 猫咪挚友 | catBond ≥ 15 |
| 🏗️ 扩建工坊 | 购买第一个额外制作台 |
| 🏆 百单传说 | 完成 50 单 |
| 🐾 猫咪帮大忙 | 帮厨累计 ≥ 3 次 |

---

### 3.6 v3 存档结构

```js
// key: 'catcafe_best_v1'（历史最佳，不变）
{ coins, maxCombo, lv, grade }

// key: 'catcafe_shop_v3'（v3 新增，跨局持久）
{
  shopUpgrades: { stations, machine, waitroom },
  catBond: number,
  catSkills: string[]   // Set 序列化为数组
}
```

---

## 四、版本优先级全景

| 状态 | 模块 | 预期收益 | 复杂度 |
|---|---|---|---|
| ✅ 已完成 | 存档系统（localStorage） | 留存感大幅提升 | 低 |
| ✅ 已完成 | 今日营业结算界面 | 完整游戏闭环感 | 中 |
| ✅ 已完成 | 顾客多样性（VIP/急性子） | 策略趣味性 | 中 |
| ✅ 已完成 | 模块化重构 + 移动端适配 | 可维护性 + 手机可玩 | 中 |
| ✅ 已完成 | **多单并行制作台** | 核心玩法深度跃升 | 高 |
| ✅ 已完成 | **金币用途（商店升级）** | 目标驱动感强 | 中 |
| ✅ 已完成 | **猫咪技能成长线** | 情感附着 + 策略深度 | 中 |
| ✅ 已完成 | **新菜品 × 2（布丁/华夫饼）** | 内容丰富度 | 低 |
| 🟢 长期 | 天气/时段系统 | 沉浸感 | 中 |
| 🟢 长期 | 音效系统（Web Audio API） | 体验完整度 | 低 |
| 🟢 长期 | 本地排行榜 Top5 | 竞争感 | 低 |
| 🟢 长期 | 顾客丰富化（更多外形） | 视觉多样性 | 中 |
| 🟢 长期 | 团体客（2人同行双单） | 玩法变化 | 高 |

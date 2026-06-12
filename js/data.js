// ====================================================
// data.js — 游戏常量数据
// ====================================================

const ITEMS = {
  latte:     {n:'猫爪拿铁', e:'☕', p:12, t:2000, col:'#c8966e', exp:8,  lv:1},
  cake:      {n:'草莓蛋糕', e:'🍰', p:20, t:3000, col:'#ff9eb8', exp:12, lv:1},
  macaron:   {n:'马卡龙',   e:'🫧', p:15, t:2000, col:'#c8a8f8', exp:10, lv:1},
  parfait:   {n:'芭菲圣代', e:'🍧', p:35, t:4000, col:'#f8c8e8', exp:20, lv:3},
  catcookie: {n:'猫爪饼干', e:'🐾', p:28, t:3000, col:'#f8d898', exp:16, lv:5},
  pudding:   {n:'猫咪布丁', e:'🍮', p:42, t:4500, col:'#ffd97d', exp:24, lv:7},
  waffle:    {n:'彩虹华夫饼', e:'🧇', p:50, t:5000, col:'#ffb347', exp:30, lv:9}
};

const ACHLIST = [
  {id:'a1',  chk:()=>G.done>=1,          l:'初次营业 🎀',    e:'🎀'},
  {id:'a2',  chk:()=>G.done>=10,         l:'熟练店员 ⭐',    e:'⭐'},
  {id:'a3',  chk:()=>G.done>=30,         l:'咖啡达人 ☕',    e:'☕'},
  {id:'a4',  chk:()=>G.coins>=100,       l:'小有积蓄 💰',    e:'💰'},
  {id:'a5',  chk:()=>G.coins>=500,       l:'金币大亨 💎',    e:'💎'},
  {id:'a6',  chk:()=>G.totalCus>=20,     l:'人气爆棚 🌟',    e:'🌟'},
  {id:'a7',  chk:()=>G.combo>=5,         l:'五连击！🔥',     e:'🔥'},
  {id:'a8',  chk:()=>G.combo>=10,        l:'十连传说 🌈',    e:'🌈'},
  {id:'a9',  chk:()=>G.petted>=1,        l:'猫咪最爱 😻',    e:'😻'},
  {id:'a10', chk:()=>G.lv>=3,            l:'咖啡馆明星 ✨',  e:'✨'},
  {id:'a11', chk:()=>G.lv>=5,            l:'传奇店长 👑',    e:'👑'},
  {id:'a12', chk:()=>G.catBond>=15,      l:'猫咪挚友 🐱',    e:'🐱'},
  {id:'a13', chk:()=>G.shopUpgrades.stations>=1, l:'扩建工坊 🏗️', e:'🏗️'},
  {id:'a14', chk:()=>G.done>=50,         l:'百单传说 🏆',    e:'🏆'},
  {id:'a15', chk:()=>G.catAutoCount>=3,  l:'猫咪帮大忙 🐾',  e:'🐾'}
];

// 座位坐标（画布逻辑坐标）
const SEATS = [{x:105,y:300},{x:205,y:300},{x:315,y:300},{x:60,y:290}];

// 顾客外观类型
const CTYPES = [
  {col:'#ffc8e8', hair:'#5c3317', out:'#f5c6de'},
  {col:'#c8d8f8', hair:'#1a1a2e', out:'#9898e8'},
  {col:'#c8f0c8', hair:'#8b6914', out:'#78c878'},
  {col:'#f8e8c8', hair:'#ff69b0', out:'#f8c8a8'}
];

// ===== 制作台配置 =====
// 每个台的解锁金币成本（index 0 为默认解锁）
const STATION_UNLOCK_COST = [0, 200, 500];

// ===== 商店升级配置 =====
const SHOP_CONFIG = {
  // 制作台（slots 扩展由 STATION_UNLOCK_COST 管理，此处不重复）
  machine: {
    name: '咖啡机提速',
    icon: '⚡',
    desc: ['制作时间 -15%', '制作时间 -30%', '制作时间 -45%'],
    cost: [150, 300, 700],
    maxLv: 3
  },
  waitroom: {
    name: '等候区扩容',
    icon: '🪑',
    desc: ['顾客上限 +1（4人）', '顾客上限 +1（5人）'],
    cost: [300, 600],
    maxLv: 2
  }
};

// ===== 猫咪技能配置 =====
const CAT_SKILLS = [
  {id:'bell',  name:'招呼天赋',  icon:'🔔', bondReq:5,  desc:'顾客生成间隔 -10%'},
  {id:'swift', name:'灵爪加速',  icon:'✨', bondReq:15, desc:'所有制作时间 -10%'},
  {id:'help',  name:'猫咪帮厨',  icon:'🐾', bondReq:30, desc:'每8单有25%概率自动完成1单'}
];

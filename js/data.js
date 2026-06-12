// ====================================================
// data.js — 游戏常量数据
// ====================================================

const ITEMS = {
  latte:    {n:'猫爪拿铁', e:'☕', p:12, t:2000, col:'#c8966e', exp:8,  lv:1},
  cake:     {n:'草莓蛋糕', e:'🍰', p:20, t:3000, col:'#ff9eb8', exp:12, lv:1},
  macaron:  {n:'马卡龙',   e:'🫧', p:15, t:2000, col:'#c8a8f8', exp:10, lv:1},
  parfait:  {n:'芭菲圣代', e:'🍧', p:35, t:4000, col:'#f8c8e8', exp:20, lv:3},
  catcookie:{n:'猫爪饼干', e:'🐾', p:28, t:3000, col:'#f8d898', exp:16, lv:5}
};

const ACHLIST = [
  {id:'a1',  chk:()=>G.done>=1,       l:'初次营业 🎀',   e:'🎀'},
  {id:'a2',  chk:()=>G.done>=10,      l:'熟练店员 ⭐',   e:'⭐'},
  {id:'a3',  chk:()=>G.done>=30,      l:'咖啡达人 ☕',   e:'☕'},
  {id:'a4',  chk:()=>G.coins>=100,    l:'小有积蓄 💰',   e:'💰'},
  {id:'a5',  chk:()=>G.coins>=500,    l:'金币大亨 💎',   e:'💎'},
  {id:'a6',  chk:()=>G.totalCus>=20,  l:'人气爆棚 🌟',   e:'🌟'},
  {id:'a7',  chk:()=>G.combo>=5,      l:'五连击！🔥',    e:'🔥'},
  {id:'a8',  chk:()=>G.combo>=10,     l:'十连传说 🌈',   e:'🌈'},
  {id:'a9',  chk:()=>G.petted>=1,     l:'猫咪最爱 😻',   e:'😻'},
  {id:'a10', chk:()=>G.lv>=3,         l:'咖啡馆明星 ✨', e:'✨'},
  {id:'a11', chk:()=>G.lv>=5,         l:'传奇店长 👑',   e:'👑'}
];

// 座位坐标（画布逻辑坐标，不含缩放）
const SEATS = [{x:105,y:300},{x:205,y:300},{x:315,y:300}];

// 顾客外观类型
const CTYPES = [
  {col:'#ffc8e8', hair:'#5c3317', out:'#f5c6de'},
  {col:'#c8d8f8', hair:'#1a1a2e', out:'#9898e8'},
  {col:'#c8f0c8', hair:'#8b6914', out:'#78c878'},
  {col:'#f8e8c8', hair:'#ff69b0', out:'#f8c8a8'}
];

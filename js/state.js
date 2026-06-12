// ====================================================
// state.js — 全局游戏状态对象 G
// ====================================================

// stations[i] = { making:bool, makeT:number, makeTgt:obj|null, makingItem:obj|null }
function makeStation(){ return {making:false, makeT:0, makeTgt:null, makingItem:null}; }

const G = {
  // 基础经营
  coins:0, lv:1, exp:0, expMax:50, hap:80, eng:100,
  totalCus:0, done:0, combo:0, comboTmr:null,
  maxComboThisRun:0,
  missedCus:0,
  sel:'latte', ach:new Set(), petted:0,

  // 猫咪
  catX:188, catY:220, catF:0, catMood:'idle', petting:false, petT:0,
  catBond:0,           // 亲密度（摸猫累积）
  catAutoCount:0,      // 猫咪帮厨累计次数

  // 粒子
  pts:[], hearts:[],

  // 顾客
  custs:[],
  lastCusT:0, cusInt:5500,

  // 多制作台（stations 数组，默认 1 台）
  stations: [makeStation()],

  // 商店升级状态（购买次数）
  shopUpgrades: {
    stations: 0,   // 已购买的额外台数（0=只有1台，1=2台，2=3台）
    machine:  0,   // 咖啡机等级（0-3）
    waitroom: 0    // 等候区等级（0-2）
  },

  // 已解锁的猫咪技能 Set
  catSkills: new Set(),

  tick:0, running:false, paused:false
};

function resetG(){
  if(G.comboTmr)clearTimeout(G.comboTmr);

  // 保留跨局持久数据
  const keepUpgrades = {...G.shopUpgrades};
  const keepBond     = G.catBond;
  const keepSkills   = new Set(G.catSkills);
  const keepStationCount = G.stations.length;

  G.coins=0; G.lv=1; G.exp=0; G.expMax=50; G.hap=80; G.eng=100;
  G.totalCus=0; G.done=0; G.combo=0; G.comboTmr=null;
  G.maxComboThisRun=0; G.missedCus=0;
  G.sel='latte'; G.ach=new Set(); G.petted=0;
  G.catF=0; G.catMood='idle'; G.petting=false; G.petT=0;
  G.catAutoCount=0;
  G.pts=[]; G.hearts=[]; G.custs=[];
  G.lastCusT=performance.now(); G.cusInt=5500;

  // 恢复持久数据
  G.shopUpgrades = keepUpgrades;
  G.catBond      = keepBond;
  G.catSkills    = keepSkills;

  // 根据升级状态恢复制作台
  G.stations = [];
  for(let i=0;i<=G.shopUpgrades.stations;i++) G.stations.push(makeStation());

  G.tick=0; G.running=true; G.paused=false;
}

// ===== 计算实际制作时间（含咖啡机加速 + 灵爪技能）=====
function calcMakeTime(baseT){
  let t = baseT;
  // 咖啡机升级：-15% / -30% / -45%
  const mLv = G.shopUpgrades.machine;
  if(mLv>0) t *= (1 - mLv*0.15);
  // 猫咪技能：灵爪加速 -10%
  if(G.catSkills.has('swift')) t *= 0.9;
  return Math.max(500, Math.round(t));
}

// ===== 计算顾客生成间隔（含招呼天赋 + 等候区扩容）=====
function calcCusInterval(){
  let base = Math.max(2500, 5500 - G.lv*400);
  if(G.catSkills.has('bell')) base *= 0.9;
  return base;
}

// ===== 最大顾客容量 =====
function maxCusts(){
  return 3 + G.shopUpgrades.waitroom;
}

// ===== 空闲制作台 =====
function getFreeStation(){
  return G.stations.find(s=>!s.making) || null;
}

// ===== 某顾客是否正在某台制作 =====
function getStationForCust(custId){
  return G.stations.find(s=>s.making && s.makeTgt && s.makeTgt.id===custId) || null;
}

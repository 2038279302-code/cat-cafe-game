// ====================================================
// state.js — 全局游戏状态对象 G
// ====================================================

const G = {
  coins:0, lv:1, exp:0, expMax:50, hap:80, eng:100,
  totalCus:0, done:0, combo:0, comboTmr:null,
  maxComboThisRun:0,  // 本局最高连击（用于存档）
  missedCus:0,        // 本局超时顾客数（用于结算评级）
  sel:'latte', ach:new Set(), petted:0,
  catX:188, catY:220, catF:0, catMood:'idle', petting:false, petT:0,
  pts:[], hearts:[],
  custs:[],
  lastCusT:0, cusInt:5500,
  making:false, makeT:0, makeTgt:null, makingItem:null,
  tick:0, running:false, paused:false
};

function resetG(){
  if(G.comboTmr)clearTimeout(G.comboTmr);
  G.coins=0; G.lv=1; G.exp=0; G.expMax=50; G.hap=80; G.eng=100;
  G.totalCus=0; G.done=0; G.combo=0; G.comboTmr=null;
  G.maxComboThisRun=0; G.missedCus=0;
  G.sel='latte'; G.ach=new Set(); G.petted=0;
  G.catF=0; G.catMood='idle'; G.petting=false; G.petT=0;
  G.pts=[]; G.hearts=[]; G.custs=[];
  G.lastCusT=performance.now(); G.cusInt=5500;
  G.making=false; G.makeT=0; G.makeTgt=null; G.makingItem=null;
  G.tick=0; G.running=true; G.paused=false;
}

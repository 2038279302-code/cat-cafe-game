// ====================================================
// save.js — localStorage 存档系统
// ====================================================

const SAVE_KEY      = 'catcafe_best_v1';
const SAVE_SHOP_KEY = 'catcafe_shop_v3';  // v3 新增

// ===== 历史最佳记录 =====
function loadBest(){
  try{ return JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); }
  catch(e){ return null; }
}

function saveBest(data){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  catch(e){}
}

function updateBestRecord(coins, maxCombo, lv, grade){
  const old = loadBest()||{coins:0,maxCombo:0,lv:1,grade:'-'};
  const gradeOrder = {'S':4,'A':3,'B':2,'C':1,'-':0};
  const best = {
    coins:    Math.max(old.coins,    coins),
    maxCombo: Math.max(old.maxCombo, maxCombo),
    lv:       Math.max(old.lv,       lv),
    grade:    (gradeOrder[grade]||0)>(gradeOrder[old.grade]||0) ? grade : old.grade
  };
  saveBest(best);
  return best;
}

function initBestDisplay(){
  const best = loadBest();
  if(!best)return;
  document.getElementById('best-record').style.display = 'block';
  document.getElementById('br-coins').textContent = best.coins;
  document.getElementById('br-combo').textContent = best.maxCombo;
  document.getElementById('br-lv').textContent    = 'Lv.'+best.lv;
  document.getElementById('br-grade').textContent = best.grade||'-';
}

// ===== 商店升级 + 猫咪亲密度（跨局持久）=====
function saveShopData(){
  try{
    const data = {
      shopUpgrades: G.shopUpgrades,
      catBond:      G.catBond,
      catSkills:    [...G.catSkills]
    };
    localStorage.setItem(SAVE_SHOP_KEY, JSON.stringify(data));
  }catch(e){}
}

function loadAndApplyShopData(){
  try{
    const raw = localStorage.getItem(SAVE_SHOP_KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    if(data.shopUpgrades){
      G.shopUpgrades = {
        stations: data.shopUpgrades.stations || 0,
        machine:  data.shopUpgrades.machine  || 0,
        waitroom: data.shopUpgrades.waitroom  || 0
      };
    }
    if(typeof data.catBond === 'number'){
      G.catBond = data.catBond;
    }
    if(Array.isArray(data.catSkills)){
      G.catSkills = new Set(data.catSkills);
    }
    // 根据已购买的台数恢复 stations 数组
    G.stations = [];
    for(let i=0; i<=G.shopUpgrades.stations; i++) G.stations.push(makeStation());
  }catch(e){}
}

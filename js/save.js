// ====================================================
// save.js — localStorage 存档系统
// ====================================================

const SAVE_KEY = 'catcafe_best_v1';

function loadBest(){
  try{ return JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); }
  catch(e){ return null; }
}

function saveBest(data){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  catch(e){}
}

// 每局结束合并最佳记录
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

// 开始界面：展示历史最佳
function initBestDisplay(){
  const best = loadBest();
  if(!best)return;
  document.getElementById('best-record').style.display = 'block';
  document.getElementById('br-coins').textContent = best.coins;
  document.getElementById('br-combo').textContent = best.maxCombo;
  document.getElementById('br-lv').textContent    = 'Lv.'+best.lv;
  document.getElementById('br-grade').textContent = best.grade||'-';
}

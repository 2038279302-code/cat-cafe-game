// ====================================================
// ui.js — UI 操作：消息条、成就、升级、UI 刷新
// 依赖：state.js (G), data.js (ACHLIST, ITEMS), draw.js (spawnPts, spawnHrt)
// ====================================================

// ===== 消息条 =====
let msgTmr = null;
function showMsg(txt){
  const box = document.getElementById('msgbox');
  if(!box)return;
  box.textContent = txt;
  box.style.animation = 'none';
  box.offsetHeight; // 触发 reflow 重置动画
  box.style.animation = '';
  if(msgTmr)clearTimeout(msgTmr);
}

// ===== 飘字 =====
function floatText(txt, x, y, col){
  const d = document.getElementById('ftc');
  const el = document.createElement('div');
  const r = cv.getBoundingClientRect();
  // 计算 canvas 缩放比例（移动端 canvas 会被 CSS 缩放）
  const scaleX = r.width / cv.width;
  const scaleY = r.height / cv.height;
  el.style.cssText = `position:fixed;left:${r.left+x*scaleX}px;top:${r.top+y*scaleY}px;font-size:15px;font-weight:900;color:${col};text-shadow:1px 1px 0 rgba(255,255,255,.8);pointer-events:none;white-space:nowrap;animation:floatUp 1.2s ease forwards`;
  el.textContent = txt;
  d.appendChild(el);
  setTimeout(()=>el.remove(), 1200);
}

// ===== 成就 =====
function checkAch(){
  ACHLIST.forEach(a=>{
    if(!G.ach.has(a.id)&&a.chk()){G.ach.add(a.id);showAch(a.l,a.e)}
  });
}
function showAch(l, e){
  const d = document.getElementById('ach');
  document.getElementById('ac').textContent = l;
  document.getElementById('ae').textContent = e;
  d.style.display = 'block';
  setTimeout(()=>{d.style.display='none'}, 3000);
}

// ===== UI 数据刷新 =====
function updateUI(){
  document.getElementById('sv-c').textContent  = G.coins;
  document.getElementById('sv-lv').textContent = 'Lv.'+G.lv;
  document.getElementById('ebar').style.width  = (G.exp/G.expMax*100)+'%';
  document.getElementById('etext').textContent = G.exp+'/'+G.expMax;
  document.getElementById('b-hap').style.width = G.hap+'%';
  document.getElementById('b-eng').style.width = G.eng+'%';
  document.getElementById('sv-cus').textContent= G.totalCus+' 位';
  document.getElementById('b-cus').style.width = Math.min(G.totalCus/30*100,100)+'%';
  document.getElementById('sv-ord').textContent= G.done+' 单';
  const ce = document.getElementById('combo');
  if(G.combo>=3) ce.textContent='x'+G.combo+' 🔥';
  else           ce.textContent='';
  // 解锁高级菜品
  if(G.lv>=3){
    document.getElementById('mi-parfait').classList.remove('dis');
    document.getElementById('mi-parfait').querySelector('.it').textContent='⏱ 4秒'
  }
  if(G.lv>=5){
    document.getElementById('mi-catcookie').classList.remove('dis');
    document.getElementById('mi-catcookie').querySelector('.it').textContent='⏱ 3秒'
  }
}

// ===== 升级动画 =====
function doLevelUp(){
  const d = document.getElementById('luo');
  document.getElementById('lt').textContent = 'LEVEL UP! 🌸 Lv.'+G.lv;
  d.classList.add('show');
  setTimeout(()=>d.classList.remove('show'), 1600);
  spawnPts(G.catX, G.catY-20, '#ff69b0', 16);
  spawnPts(G.catX, G.catY-20, '#f8d800', 12);
  showMsg('恭喜升级！现在是 Lv.'+G.lv+' 🎉');
}

// ===== 选品 =====
function selItem(k){
  if(ITEMS[k].lv>G.lv)return;
  G.sel = k;
  document.querySelectorAll('.mi').forEach(m=>{
    if(m.id==='mi-'+k) m.classList.add('sel');
    else               m.classList.remove('sel');
  });
}

// ===== 摸猫 =====
function petCat(){
  if(G.petting)return;
  G.petting=true;G.petT=0;G.catMood='happy';G.hap=Math.min(100,G.hap+8);G.petted++;
  for(let i=0;i<5;i++) spawnHrt(G.catX+(Math.random()-.5)*40, G.catY-30);
  showMsg(['呼噜噜～猫咪好开心！💕','喵喵喵！摸头头！✨','猫咪：这个感觉不错～😸','软软的！好治愈！🌸'][Math.floor(Math.random()*4)]);
  checkAch();
  setTimeout(()=>{G.petting=false;G.catMood='idle'}, 2500);
}

// ====================================================
// ui.js — UI 操作：消息条、成就、升级、UI 刷新、商店
// 依赖：state.js, data.js, draw.js
// ====================================================

// ===== 消息条 =====
let msgTmr = null;
function showMsg(txt){
  const box = document.getElementById('msgbox');
  if(!box)return;
  box.textContent = txt;
  box.style.animation = 'none';
  box.offsetHeight;
  box.style.animation = '';
  if(msgTmr)clearTimeout(msgTmr);
}

// ===== 飘字 =====
function floatText(txt, x, y, col){
  const d = document.getElementById('ftc');
  const el = document.createElement('div');
  const r = cv.getBoundingClientRect();
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

  // 菜品解锁
  if(G.lv>=3){ unlockItem('parfait','⏱ 4秒'); }
  if(G.lv>=5){ unlockItem('catcookie','⏱ 3秒'); }
  if(G.lv>=7){ unlockItem('pudding','⏱ 4.5秒'); }
  if(G.lv>=9){ unlockItem('waffle','⏱ 5秒'); }

  // 猫咪亲密度
  updateBondUI();

  // 制作台数量标签
  updateStationLabels();

  // 商店按钮状态
  updateShopButtons();
}

function unlockItem(key, timeText){
  const el = document.getElementById('mi-'+key);
  if(el){
    el.classList.remove('dis');
    const it = el.querySelector('.it');
    if(it && it.textContent.startsWith('🔒')) it.textContent = timeText;
  }
}

// ===== 猫咪亲密度 UI =====
function updateBondUI(){
  const bond = G.catBond;
  const bondBar = document.getElementById('bond-bar');
  const bondVal = document.getElementById('bond-val');
  if(!bondBar||!bondVal)return;

  // 找下一个未解锁技能的门槛
  const nextSkill = CAT_SKILLS.find(s=>!G.catSkills.has(s.id));
  const maxBond = nextSkill ? nextSkill.bondReq : 30;
  bondBar.style.width = Math.min(bond/maxBond*100,100)+'%';
  bondVal.textContent = bond;

  // 更新技能列表显示
  CAT_SKILLS.forEach(s=>{
    const el = document.getElementById('skill-'+s.id);
    if(!el)return;
    if(G.catSkills.has(s.id)){
      el.classList.add('skill-active');
      el.classList.remove('skill-locked');
    } else if(bond>=s.bondReq){
      el.classList.remove('skill-locked','skill-active');
    } else {
      el.classList.add('skill-locked');
      el.classList.remove('skill-active');
    }
  });
}

// ===== 制作台标签 =====
function updateStationLabels(){
  const total = G.stations.length;
  const label = document.getElementById('station-count-label');
  if(label) label.textContent = '制作台 ×'+total;
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
  G.catBond = Math.min(G.catBond+1, 99);
  for(let i=0;i<5;i++) spawnHrt(G.catX+(Math.random()-.5)*40, G.catY-30);

  // 检查技能解锁
  checkCatSkills();

  showMsg(['呼噜噜～猫咪好开心！💕','喵喵喵！摸头头！✨','猫咪：这个感觉不错～😸','软软的！好治愈！🌸'][Math.floor(Math.random()*4)]);
  checkAch();
  updateBondUI();
  setTimeout(()=>{G.petting=false;G.catMood='idle'}, 2500);
}

// ===== 猫咪技能解锁 =====
function checkCatSkills(){
  CAT_SKILLS.forEach(s=>{
    if(!G.catSkills.has(s.id) && G.catBond>=s.bondReq){
      G.catSkills.add(s.id);
      showAch(s.name+' '+s.icon+' 已解锁！', s.icon);
      showMsg('🐱 猫咪技能解锁：'+s.name+' — '+s.desc);
      spawnPts(G.catX, G.catY-30, '#ff69b0', 20);
    }
  });
}

// ===== 商店 =====
function toggleShop(){
  const panel = document.getElementById('shop-panel');
  if(!panel)return;
  const visible = panel.classList.toggle('show');
  if(visible) renderShop();
}

function renderShop(){
  // 制作台扩展
  const stEl = document.getElementById('shop-stations');
  if(stEl){
    const cur = G.shopUpgrades.stations; // 0=1台,1=2台,2=3台
    if(cur >= STATION_UNLOCK_COST.length-1){
      stEl.innerHTML = '<span class="shop-maxed">✅ 已全部解锁（3台）</span>';
    } else {
      const cost = STATION_UNLOCK_COST[cur+1];
      const canBuy = G.coins>=cost;
      stEl.innerHTML = `<button class="shop-btn${canBuy?'':' disabled'}" onclick="buyStation()">
        解锁第${cur+2}台 &nbsp;<span class="shop-cost">💰 ${cost}</span>
      </button>`;
    }
  }

  // 咖啡机
  const mcEl = document.getElementById('shop-machine');
  if(mcEl){
    const lv = G.shopUpgrades.machine;
    const cfg = SHOP_CONFIG.machine;
    if(lv>=cfg.maxLv){
      mcEl.innerHTML = '<span class="shop-maxed">✅ 满级（制作时间 -45%）</span>';
    } else {
      const cost = cfg.cost[lv];
      const canBuy = G.coins>=cost;
      mcEl.innerHTML = `<button class="shop-btn${canBuy?'':' disabled'}" onclick="buyMachine()">
        Lv.${lv}→${lv+1} ${cfg.desc[lv]} &nbsp;<span class="shop-cost">💰 ${cost}</span>
      </button>`;
    }
  }

  // 等候区
  const wrEl = document.getElementById('shop-waitroom');
  if(wrEl){
    const lv = G.shopUpgrades.waitroom;
    const cfg = SHOP_CONFIG.waitroom;
    if(lv>=cfg.maxLv){
      wrEl.innerHTML = '<span class="shop-maxed">✅ 满级（顾客上限 5人）</span>';
    } else {
      const cost = cfg.cost[lv];
      const canBuy = G.coins>=cost;
      wrEl.innerHTML = `<button class="shop-btn${canBuy?'':' disabled'}" onclick="buyWaitroom()">
        ${cfg.desc[lv]} &nbsp;<span class="shop-cost">💰 ${cost}</span>
      </button>`;
    }
  }
}

function updateShopButtons(){
  const panel = document.getElementById('shop-panel');
  if(panel && panel.classList.contains('show')) renderShop();
}

// ===== 购买函数 =====
function buyStation(){
  const cur = G.shopUpgrades.stations;
  if(cur >= STATION_UNLOCK_COST.length-1) return;
  const cost = STATION_UNLOCK_COST[cur+1];
  if(G.coins < cost){ showMsg('💰 金币不足！需要 '+cost+' 金币'); return; }
  G.coins -= cost;
  G.shopUpgrades.stations++;
  G.stations.push(makeStation());
  showMsg('🏗️ 第'+(G.shopUpgrades.stations+1)+'号制作台已解锁！可同时制作多单！');
  spawnPts(G.catX, G.catY, '#f8d800', 14);
  checkAch();
  updateUI();
  renderShop();
  saveShopData();
}

function buyMachine(){
  const lv = G.shopUpgrades.machine;
  const cfg = SHOP_CONFIG.machine;
  if(lv>=cfg.maxLv) return;
  const cost = cfg.cost[lv];
  if(G.coins < cost){ showMsg('💰 金币不足！需要 '+cost+' 金币'); return; }
  G.coins -= cost;
  G.shopUpgrades.machine++;
  showMsg('⚡ 咖啡机升级到 Lv.'+G.shopUpgrades.machine+'！制作时间 -'+(G.shopUpgrades.machine*15)+'%');
  updateUI();
  renderShop();
  saveShopData();
}

function buyWaitroom(){
  const lv = G.shopUpgrades.waitroom;
  const cfg = SHOP_CONFIG.waitroom;
  if(lv>=cfg.maxLv) return;
  const cost = cfg.cost[lv];
  if(G.coins < cost){ showMsg('💰 金币不足！需要 '+cost+' 金币'); return; }
  G.coins -= cost;
  G.shopUpgrades.waitroom++;
  showMsg('🪑 等候区扩容！现在可接待 '+maxCusts()+' 位顾客同时等待！');
  updateUI();
  renderShop();
  saveShopData();
}

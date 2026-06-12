// ====================================================
// game.js — 核心游戏逻辑
// 依赖：data.js, state.js, draw.js, ui.js, save.js
// ====================================================

let lastTime = 0;

// ===== 背景气泡初始化 =====
function initBubbles(){
  const c=['#ffb3d9','#e8c8f8','#b8e0f8','#ffd6a0','#c8f0d8'];
  for(let i=0;i<12;i++){
    const b=document.createElement('div');b.className='bb';
    const s=18+Math.random()*50;
    b.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${c[i%c.length]};animation-duration:${9+Math.random()*13}s;animation-delay:${-Math.random()*20}s`;
    document.getElementById('bgB').appendChild(b);
  }
}

// ===== 顾客生成 =====
function spawnCust(now){
  if(G.custs.length >= maxCusts()) return;
  const used = new Set(G.custs.map(c=>c.seat));
  const allSeats = [0,1,2,3].slice(0, maxCusts());
  const free = allSeats.filter(i=>!used.has(i));
  if(!free.length)return;
  const si  = free[Math.floor(Math.random()*free.length)];
  const pos = SEATS[si];
  const type  = Math.floor(Math.random()*4);
  const avail = Object.keys(ITEMS).filter(k=>ITEMS[k].lv<=G.lv);
  const order = avail[Math.floor(Math.random()*avail.length)]||'latte';
  const id    = now+Math.random();

  const roll = Math.random();
  let custType='normal', wt;
  if(roll<0.20){
    custType='vip';
    wt=(14000+Math.random()*9000)*1.5;
  } else if(roll<0.40){
    custType='impatient';
    wt=9000+Math.random()*2000;
  } else {
    wt=14000+Math.random()*9000;
  }

  G.custs.push({
    id, x:pos.x, y:pos.y, seat:si, type, order,
    mood:'normal', frame:Math.random()*100,
    waitTotal:wt, waitLeft:wt, waitPct:1,
    arriving:true, arrP:0,
    custType
  });
  G.totalCus++;
  G.lastCusT=now;
  G.cusInt=calcCusInterval();
}

// ===== 完成订单 =====
function completeOrder(c, isAuto){
  if(!c)return;
  const it = ITEMS[c.order];
  if(!it)return;
  const wb = c.waitPct>.6?1.3:c.waitPct>.3?1.0:.7;
  G.combo++;
  if(G.combo>G.maxComboThisRun) G.maxComboThisRun=G.combo;
  const cb = G.combo>=10?2.0:G.combo>=5?1.5:G.combo>=3?1.2:1.0;
  let earned = Math.round(it.p*wb*cb*(0.9+G.hap/500));

  let bonusMsg='';
  if(c.custType==='impatient'){
    earned = earned*2;
    bonusMsg=' ⚡ 急性子双倍！';
  } else if(c.custType==='vip'){
    const tip = Math.round(it.p*0.5);
    earned += tip;
    bonusMsg=' 👑 VIP小费 +'+tip+'💰';
  }
  if(isAuto) bonusMsg += ' 🐾 猫咪帮厨！';

  G.coins+=earned; G.done++;
  if(G.comboTmr)clearTimeout(G.comboTmr);
  G.comboTmr=setTimeout(()=>{G.combo=0;updateUI()}, 6000);
  const eg=Math.round(it.exp*cb); G.exp+=eg;
  while(G.exp>=G.expMax){G.exp-=G.expMax;G.lv++;G.expMax=Math.round(50*Math.pow(1.5,G.lv-1));doLevelUp()}
  G.hap=Math.min(100,G.hap+3);
  c.mood='happy';
  spawnPts(c.x,c.y-28,it.col,12);spawnHrt(c.x,c.y-40);
  const baseMsg='+'+earned+'💰'+(G.combo>=3?' 🔥x'+G.combo+' 连击！':'');
  showMsg(baseMsg+bonusMsg);
  floatText('+'+earned+'💰', c.x, c.y-48, '#d4689a');
  if(G.combo>=3) floatText('x'+G.combo+' COMBO!', c.x, c.y-68, '#ff4499');
  if(isAuto) floatText('🐾 帮厨！', c.x, c.y-88, '#ff69b0');
  const cid=c.id;
  setTimeout(()=>{G.custs=G.custs.filter(u=>u.id!==cid)}, 1100);
  checkAch(); updateUI();
}

// ===== 猫咪帮厨检测（每8单触发，25%概率）=====
function tryCatAutoComplete(){
  if(!G.catSkills.has('help')) return;
  if(G.done % 8 !== 0 || G.done === 0) return;
  if(Math.random() > 0.25) return;

  // 找一个没在制作中的顾客
  const waiting = G.custs.filter(c => !c.arriving && !getStationForCust(c.id));
  if(!waiting.length) return;

  const target = waiting[Math.floor(Math.random()*waiting.length)];
  G.catAutoCount++;
  // 立即完成
  completeOrder(target, true);
  G.catMood='happy';
  spawnPts(G.catX, G.catY-20, '#ff69b0', 18);
  setTimeout(()=>{ G.catMood='idle'; }, 2000);
}

// ===== 主循环 =====
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(now-lastTime, 50);
  lastTime=now;
  ctx.clearRect(0,0,cv.width,cv.height);
  drawScene();

  if(!G.running){G.catF++;drawCat();return;}
  G.tick++;

  // 多制作台推进
  if(!G.paused){
    G.stations.forEach(st=>{
      if(st.making && st.makeTgt){
        st.makeT -= dt;
        if(st.makeT<=0){
          const tgt = st.makeTgt;
          st.making=false; st.makeTgt=null; st.makingItem=null;
          completeOrder(tgt, false);
          tryCatAutoComplete();
        }
      }
    });
  }

  if(!G.paused && now-G.lastCusT>G.cusInt) spawnCust(now);

  const removeIds=new Set();
  for(let i=0;i<G.custs.length;i++){
    const c=G.custs[i]; c.frame++;
    if(c.arriving){
      if(!G.paused){c.arrP=Math.min(c.arrP+.04,1);if(c.arrP>=1)c.arriving=false;}
      continue;
    }
    if(G.paused)continue;
    // 正在制作中的顾客不倒计时
    if(getStationForCust(c.id)) continue;
    c.waitLeft-=dt; c.waitPct=Math.max(0,c.waitLeft/c.waitTotal);
    if(c.waitPct<.3&&c.mood==='normal') c.mood='angry';
    if(c.waitLeft<=0){
      G.hap=Math.max(0,G.hap-6); G.combo=0; G.missedCus++;
      showMsg(['顾客等太久离开了 😢','没有及时完成订单，顾客走了...','猫咪也难过了 😿'][Math.floor(Math.random()*3)]);
      removeIds.add(c.id); updateUI();
    }
  }
  if(removeIds.size>0){
    G.custs=G.custs.filter(c=>!removeIds.has(c.id));
    // 若正在制作的顾客离开，清空对应台
    G.stations.forEach(st=>{
      if(st.makeTgt && removeIds.has(st.makeTgt.id)){
        st.making=false; st.makeTgt=null; st.makingItem=null;
        showMsg('制作中的顾客离开了... 😿');
      }
    });
  }

  const snap=G.custs.slice();
  for(let i=0;i<snap.length;i++) drawCust(snap[i]);
  G.catF++; if(G.petting)G.petT++; drawCat();
  updatePts(); drawPts(); drawMakeBar();
}

// ===== 点击画布（含移动端触摸）=====
function handleCanvasClick(clientX, clientY){
  if(!G.running||G.paused)return;

  const r=cv.getBoundingClientRect();
  const scaleX = cv.width  / r.width;
  const scaleY = cv.height / r.height;
  const mx=(clientX-r.left)*scaleX;
  const my=(clientY-r.top)*scaleY;

  for(let i=0;i<G.custs.length;i++){
    const c=G.custs[i];
    if(c.arriving)continue;
    const dx=mx-c.x, dy=my-c.y;
    if(dx*dx+dy*dy<38*38){
      // 已经在制作中
      if(getStationForCust(c.id)){
        showMsg(['正在制作中，请稍等！☕','已经在做了，耐心等等吧～','制作中... 快好了！🌸'][Math.floor(Math.random()*3)]);
        return;
      }
      // 找空闲制作台
      const freeSt = getFreeStation();
      if(!freeSt){
        showMsg('所有制作台都忙着呢！🏗️ 快去商店解锁更多制作台！');
        return;
      }
      if(c.order!==G.sel){
        showMsg(['先选好菜品再点顾客哦！😅','请先在左边选择对应品类！🌸','哎呀点错啦！看看顾客要什么 👀'][Math.floor(Math.random()*3)]);
        c.mood='angry';
        const cid=c.id;
        setTimeout(()=>{const tc=G.custs.find(u=>u.id===cid);if(tc&&tc.mood==='angry')tc.mood='normal';},1500);
        return;
      }
      // 分配制作台
      const item = ITEMS[c.order];
      freeSt.making=true;
      freeSt.makeTgt=c;
      freeSt.makingItem=item;
      freeSt.makeT=calcMakeTime(item.t);
      const stIdx = G.stations.indexOf(freeSt)+1;
      if(c.custType==='vip')            showMsg('为VIP顾客制作中 👑 台'+stIdx+'已启动');
      else if(c.custType==='impatient') showMsg('急性子！快！⚡ '+item.e+' 制作中... 台'+stIdx);
      else                              showMsg('正在制作 '+item.e+' — 台'+stIdx+' 启动中 🌸');
      return;
    }
  }
}

function bindCanvasEvents(){
  cv.addEventListener('click', e=>{
    handleCanvasClick(e.clientX, e.clientY);
  });
  cv.addEventListener('touchend', e=>{
    e.preventDefault();
    if(e.changedTouches.length>0){
      const t=e.changedTouches[0];
      handleCanvasClick(t.clientX, t.clientY);
    }
  }, {passive:false});
}

// ===== 开始游戏 =====
function startGame(){
  document.getElementById('ss').style.display='none';
  document.getElementById('ctrl-row').style.display='flex';
  // 手机端专属区域显示（CSS 已控制，但 style.display 可能被覆盖，确保可见）
  if(window.innerWidth <= 600){
    const els = ['mob-statusbar','mob-combo-bar','mob-canvas-wrap','mob-menu'];
    els.forEach(id=>{ const e=document.getElementById(id); if(e) e.style.removeProperty('display'); });
  }
  G.running=true; G.paused=false;
  G.lastCusT=performance.now(); lastTime=performance.now();
  showMsg('欢迎光临！选好菜品，等顾客来吧 🌸');
}

// ===== 暂停/继续 =====
function togglePause(){
  if(!G.running)return;
  G.paused=!G.paused;
  const btn=document.getElementById('btn-pause');
  const overlay=document.getElementById('pause-overlay');
  if(G.paused){
    btn.textContent='▶ 继续'; btn.classList.add('pause-active');
    overlay.classList.add('show'); showMsg('游戏已暂停 ⏸');
  } else {
    btn.textContent='⏸ 暂停'; btn.classList.remove('pause-active');
    overlay.classList.remove('show'); lastTime=performance.now(); showMsg('继续营业！加油 🌸');
  }
}
function resumeGame(){if(G.paused)togglePause();}

// ===== 打烊结算 =====
function calcGrade(){
  const total=G.done+G.missedCus;
  const completionRate=total>0?(G.done/total):1;
  let score=0;
  score+=completionRate*40;
  if(G.maxComboThisRun>=10)score+=30;
  else if(G.maxComboThisRun>=5)score+=20;
  else if(G.maxComboThisRun>=3)score+=12;
  else score+=5;
  score+=Math.min(G.lv*4,20);
  if(G.coins>=500)score+=10;
  else if(G.coins>=200)score+=7;
  else if(G.coins>=80)score+=4;
  else score+=1;
  if(score>=88)return 'S';
  if(score>=70)return 'A';
  if(score>=50)return 'B';
  return 'C';
}

function gradeInfo(grade){
  const map={
    S:{cls:'grade-s',label:'传奇店长！✨ 近乎完美的经营！'},
    A:{cls:'grade-a',label:'优秀店员！🌟 顾客们都很满意～'},
    B:{cls:'grade-b',label:'还不错哦 😊 继续加油！'},
    C:{cls:'grade-c',label:'今天有点累？😅 明天再来～'}
  };
  return map[grade]||map['C'];
}

function buildHighlights(grade){
  const lines=[];
  if(G.maxComboThisRun>=10) lines.push('🌈 达成10连击传说！');
  else if(G.maxComboThisRun>=5) lines.push('🔥 最高连击 x'+G.maxComboThisRun+'！');
  if(G.missedCus===0&&G.done>0) lines.push('💯 今天没有顾客等太久，全勤满意！');
  else if(G.missedCus>0)        lines.push('😢 有 '+G.missedCus+' 位顾客没有等到服务');
  if(G.catAutoCount>0) lines.push('🐾 猫咪帮厨完成了 '+G.catAutoCount+' 单！');
  if(G.petted>0)  lines.push('😻 摸了 '+G.petted+' 次猫咪，猫咪很开心');
  if(G.lv>=3)     lines.push('⭐ 解锁了 Lv.'+G.lv+'，新菜品已上线');
  if(lines.length===0) lines.push('☕ 今天招待了 '+G.done+' 位顾客，辛苦啦！');
  return lines.join('\n');
}

function closeShop(){
  if(!G.running)return;
  G.paused=true; G.running=false;
  const grade=calcGrade();
  const info=gradeInfo(grade);
  const best=updateBestRecord(G.coins,G.maxComboThisRun,G.lv,grade);
  const badgeEl=document.getElementById('rp-grade-badge');
  badgeEl.textContent=grade; badgeEl.className='grade-badge '+info.cls;
  document.getElementById('rp-grade-label').textContent=info.label;
  document.getElementById('rp-coins').innerHTML=G.coins+(best.coins===G.coins&&G.coins>0?'<span class="rp-new">NEW</span>':'');
  document.getElementById('rp-cus').textContent=G.totalCus;
  document.getElementById('rp-done').textContent=G.done;
  document.getElementById('rp-combo').innerHTML=G.maxComboThisRun+(best.maxCombo===G.maxComboThisRun&&G.maxComboThisRun>0?'<span class="rp-new">NEW</span>':'');
  document.getElementById('rp-highlight').textContent=buildHighlights(grade);
  const now=new Date();
  document.getElementById('rp-date').textContent=`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}  Cat Café · Daily Report`;
  document.getElementById('pause-overlay').classList.remove('show');
  document.getElementById('report-overlay').classList.add('show');
  // 关掉商店面板
  const sp=document.getElementById('shop-panel');
  if(sp)sp.classList.remove('show');
}

function restartFromReport(){
  document.getElementById('report-overlay').classList.remove('show');
  restartGame();
}
function returnToTitle(){
  document.getElementById('report-overlay').classList.remove('show');
  document.getElementById('ss').style.display='flex';
  document.getElementById('ctrl-row').style.display='none';
  initBestDisplay();
  resetG();
  updateUI();
}

// ===== 重新开始 =====
function restartGame(){
  resetG();
  // 桌面菜单重置
  document.querySelectorAll('.mi').forEach(m=>m.classList.remove('sel'));
  document.getElementById('mi-latte').classList.add('sel');
  ['parfait','catcookie','pudding','waffle'].forEach(k=>{
    const el=document.getElementById('mi-'+k);
    if(el){ el.classList.add('dis'); }
  });
  document.getElementById('mi-parfait').querySelector('.it').textContent='🔒 Lv.3';
  document.getElementById('mi-catcookie').querySelector('.it').textContent='🔒 Lv.5';
  const pu=document.getElementById('mi-pudding'); if(pu) pu.querySelector('.it').textContent='🔒 Lv.7';
  const wa=document.getElementById('mi-waffle');  if(wa) wa.querySelector('.it').textContent='🔒 Lv.9';
  // 手机底部菜单重置
  document.querySelectorAll('.mob-mi').forEach(m=>m.classList.remove('sel'));
  const mobLatte = document.getElementById('mob-mi-latte');
  if(mobLatte) mobLatte.classList.add('sel');
  ['parfait','catcookie','pudding','waffle'].forEach(k=>{
    const m=document.getElementById('mob-mi-'+k); if(m) m.classList.add('dis');
  });
  document.getElementById('pause-overlay').classList.remove('show');
  document.getElementById('btn-pause').textContent='⏸ 暂停';
  document.getElementById('btn-pause').classList.remove('pause-active');
  document.getElementById('ctrl-row').style.display='flex';
  lastTime=performance.now();
  updateUI();
  showMsg('重新出发！加油经营猫咪咖啡馆 🌸');
}

// ===== 页面加载入口 =====
window.addEventListener('DOMContentLoaded', ()=>{
  initCanvas();
  initBubbles();
  bindCanvasEvents();
  loadAndApplyShopData();
  initBestDisplay();
  requestAnimationFrame(loop);
});

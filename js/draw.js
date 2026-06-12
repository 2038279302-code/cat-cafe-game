// ====================================================
// draw.js — 所有 Canvas 绘图函数
// 依赖：state.js (G), data.js (ITEMS, CTYPES)
// ====================================================

// Canvas 上下文（由 game.js 初始化后赋值）
let cv, ctx;

function initCanvas(){
  cv = document.getElementById('cv');
  ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
}

// ===== 基础绘图工具 =====
const pr  = (x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(~~x,~~y,w,h)};
const rr  = (x,y,w,h,r,fill,stroke,sw=2)=>{
  ctx.save();ctx.beginPath();ctx.roundRect(~~x,~~y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke()}
  ctx.restore();
};
const heart = (cx,cy,sz,c='rgba(255,182,216,.18)')=>{
  ctx.save();ctx.fillStyle=c;ctx.translate(cx,cy);ctx.beginPath();
  ctx.moveTo(0,sz*.3);ctx.bezierCurveTo(-sz,-sz*.3,-sz*1.2,sz*.8,0,sz*1.3);
  ctx.bezierCurveTo(sz*1.2,sz*.8,sz,-sz*.3,0,sz*.3);ctx.fill();ctx.restore();
};

// ===== 场景 =====
function drawScene(){
  const wg=ctx.createLinearGradient(0,0,0,295);
  wg.addColorStop(0,'#fce8f5');wg.addColorStop(1,'#ffd6e7');
  ctx.fillStyle=wg;ctx.fillRect(0,0,405,295);
  ctx.fillStyle='rgba(255,182,216,.15)';
  for(let r=0;r<5;r++)for(let c=0;c<8;c++)heart(c*52+26,r*54+25,5);
  rr(0,285,405,7,0,'#f5b8d8',null);rr(0,292,405,4,0,'#fff8fc',null);
  const fg=ctx.createLinearGradient(0,296,0,390);
  fg.addColorStop(0,'#fff0f7');fg.addColorStop(1,'#fde0ee');
  ctx.fillStyle=fg;ctx.fillRect(0,296,405,94);
  ctx.save();ctx.strokeStyle='rgba(245,182,216,.25)';ctx.lineWidth=1;
  for(let x=0;x<=405;x+=50){ctx.beginPath();ctx.moveTo(x,296);ctx.lineTo(x,390);ctx.stroke()}
  for(let y=296;y<=390;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(405,y);ctx.stroke()}
  ctx.restore();
  ctx.save();ctx.fillStyle='rgba(255,182,216,.18)';ctx.beginPath();
  ctx.ellipse(232,355,120,24,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(212,104,154,.2)';ctx.lineWidth=2;ctx.stroke();ctx.restore();
  drawWindow(18,28);drawChalkboard(146,14);drawShelf(310,46);drawCounter();
}

function drawWindow(x,y){
  rr(x,y,93,83,7,'#fde0ee','#e8a0c0',3);
  const sg=ctx.createLinearGradient(x,y,x,y+81);
  sg.addColorStop(0,'#b8e4f9');sg.addColorStop(1,'#d8f0ff');
  ctx.save();ctx.beginPath();ctx.roundRect(x+4,y+4,85,75,5);ctx.fillStyle=sg;ctx.fill();ctx.restore();
  ctx.fillStyle='rgba(255,255,255,.9)';
  const cloud=(cx,cy,w)=>{
    ctx.beginPath();ctx.arc(cx,cy,w*.3,0,Math.PI*2);
    ctx.arc(cx+w*.23,cy-w*.1,w*.2,0,Math.PI*2);
    ctx.arc(cx+w*.46,cy,w*.18,0,Math.PI*2);ctx.fill()
  };
  cloud(x+17,y+17,23);cloud(x+48,y+28,17);
  ctx.fillStyle='#ffd060';ctx.beginPath();ctx.arc(x+67,y+12,7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ffd060';ctx.lineWidth=1.3;
  for(let a=0;a<8;a++){
    const ang=a/8*Math.PI*2;
    ctx.beginPath();ctx.moveTo(x+67+Math.cos(ang)*9,y+12+Math.sin(ang)*9);
    ctx.lineTo(x+67+Math.cos(ang)*13,y+12+Math.sin(ang)*13);ctx.stroke()
  }
  ctx.strokeStyle='#e8a0c0';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x+46,y+4);ctx.lineTo(x+46,y+79);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+4,y+38);ctx.lineTo(x+89,y+38);ctx.stroke();
  ctx.fillStyle='rgba(255,160,200,.32)';
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+20,y);ctx.lineTo(x+8,y+83);ctx.lineTo(x,y+83);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+93,y);ctx.lineTo(x+73,y);ctx.lineTo(x+85,y+83);ctx.lineTo(x+93,y+83);ctx.fill();
  ctx.fillStyle='#f5b8d8';
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.arc(x+i*9+5,y+5,3.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+93-i*9-5,y+5,3.5,0,Math.PI*2);ctx.fill()
  }
}

function drawChalkboard(x,y){
  rr(x-3,y-3,147,108,8,null,'#8b6948',4);rr(x,y,141,102,6,'#2d4a3e',null);
  ctx.save();
  ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='bold 11.5px Microsoft YaHei';ctx.textAlign='center';
  ctx.fillText('今日特色 ✨',x+70,y+18);
  ctx.strokeStyle='rgba(100,180,120,.4)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+8,y+25);ctx.lineTo(x+133,y+25);ctx.stroke();
  ctx.fillStyle='#f0e080';ctx.font='9.5px Microsoft YaHei';
  ['☕ 猫爪拿铁  ¥38','🍰 草莓蛋糕  ¥45','🫧 马卡龙    ¥28','🍧 芭菲圣代  ¥52']
    .forEach((l,i)=>ctx.fillText(l,x+70,y+38+i*16));
  ctx.restore();
  rr(x+8,y+94,125,8,3,'#8b6948',null);
  rr(x+14,y+96,17,4,2,'#fff',null);
  rr(x+35,y+96,17,4,2,'#ffaacc',null);
  rr(x+56,y+96,17,4,2,'#aaccff',null);
}

function drawShelf(x,y){
  rr(x-7,y,104,10,4,'#f0c0a0','#e0a080',2);
  pr(x+2,y+10,5,52,'#e8b888');pr(x+85,y+10,5,52,'#e8b888');
  pr(x+6,y+14,6,10,'#c8a878');rr(x+3,y+17,12,8,4,'#c8a878','#b08858',1);
  ctx.fillStyle='#78c878';
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2;
    ctx.beginPath();ctx.ellipse(x+9+Math.cos(a)*6,y+11+Math.sin(a)*4,5,3.5,a,0,Math.PI*2);ctx.fill()
  }
  ctx.fillStyle='#ffaacc';ctx.beginPath();ctx.arc(x+9,y+6,3.5,0,Math.PI*2);ctx.fill();
  rr(x+42,y+15,16,12,5,'#fff0f7','#f5b8d8',1);rr(x+44,y+5,14,13,6,'#fff0f7','#f5b8d8',1);
  ctx.fillStyle='#f5b8d8';
  ctx.beginPath();ctx.moveTo(x+44,y+7);ctx.lineTo(x+40,y);ctx.lineTo(x+50,y+5);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+58,y+7);ctx.lineTo(x+62,y);ctx.lineTo(x+52,y+5);ctx.fill();
  pr(x+47,y+9,3,3,'#885588');pr(x+53,y+9,3,3,'#885588');
  ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('⭐',x+88,y-5);
  rr(x-7,y+62,104,9,4,'#f0c0a0','#e0a080',2);
  ctx.font='14px Arial';
  ['📚','🌸','🧸'].forEach((e,i)=>ctx.fillText(e,x+10+i*42,y+56));
}

function drawCounter(){
  rr(0,242,152,58,0,'#f0c8a0','#e0a878',3);rr(-2,230,158,15,5,'#f8e0c0','#e8c898',3);
  const mx=16,my=185;
  rr(mx,my,46,52,6,'#c8c8d8','#a8a8c0',2);rr(mx+4,my+4,38,22,4,'#1a1a2e',null);
  ctx.save();ctx.fillStyle='#40e0d0';ctx.globalAlpha=.25+Math.sin(G.tick*.05)*.1;
  ctx.beginPath();ctx.roundRect(mx+4,my+4,38,22,4);ctx.fill();ctx.globalAlpha=1;
  ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('☕',mx+23,my+17);ctx.restore();
  ctx.strokeStyle='#888';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(mx+11,my+44,7,-Math.PI/2,Math.PI/2);ctx.stroke();
  rr(mx+16,my+34,13,15,4,'#fff','#e0c0a0',2);
  ctx.strokeStyle='rgba(200,200,200,.5)';ctx.lineWidth=1.5;ctx.lineCap='round';
  const st=G.tick*.04;
  for(let s=0;s<2;s++){
    ctx.beginPath();ctx.moveTo(mx+20+s*5,my+32);
    ctx.quadraticCurveTo(mx+18+s*5,my+24+Math.sin(st+s)*3,mx+22+s*5,my+14);ctx.stroke()
  }
  rr(83,196,50,46,7,'rgba(255,255,255,.4)','#f5c6de',2);
  rr(90,218,36,17,4,'#ff9eb8',null);rr(87,214,42,8,3,'#fff0f7',null);
  ctx.font='11px Arial';ctx.textAlign='center';
  ctx.fillText('🍓',98,210);ctx.fillText('🍓',115,210);
  ctx.fillStyle='#fff';
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(93+i*14,214,3.5,Math.PI,0);ctx.fill()}
}

// ===== 猫咪 =====
function drawCat(){
  const x=G.catX,y=G.catY,f=G.catF,mood=G.catMood,pet=G.petting;
  const blink=Math.floor(f/36)%9===0;
  const bob=Math.sin(f*.05)*(pet?2.5:1.2),by=bob;
  ctx.save();ctx.translate(x+24,y+32);ctx.rotate(Math.sin(f*.07)*.4);
  rr(0,0,5,19,3,'#ffb3d9',null);rr(4,0,5,7,3,'#f5c6de',null);ctx.restore();
  rr(x-19,y+11+by,38,33,12,'#fff0f7','#f5b8d8',2);rr(x-9,y+19+by,18,20,9,'#ffd6e7',null);
  rr(x-17,y+34+by,10,8,5,'#fff0f7','#f5b8d8',2);rr(x+7,y+34+by,10,8,5,'#fff0f7','#f5b8d8',2);
  pr(x-13,y+39+by,3,3,'#ffb3c8');pr(x+10,y+39+by,3,3,'#ffb3c8');
  rr(x-17,y-17+by,34,33,14,'#fff0f7','#f5b8d8',2);
  ctx.fillStyle='#fff0f7';ctx.beginPath();
  ctx.moveTo(x-16,y-13+by);ctx.lineTo(x-23,y-31+by);ctx.lineTo(x-5,y-21+by);ctx.fill();
  ctx.strokeStyle='#f5b8d8';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#ffb3d9';ctx.beginPath();
  ctx.moveTo(x-15,y-15+by);ctx.lineTo(x-20,y-27+by);ctx.lineTo(x-7,y-21+by);ctx.fill();
  ctx.fillStyle='#fff0f7';ctx.beginPath();
  ctx.moveTo(x+16,y-13+by);ctx.lineTo(x+23,y-31+by);ctx.lineTo(x+5,y-21+by);ctx.fill();
  ctx.strokeStyle='#f5b8d8';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#ffb3d9';ctx.beginPath();
  ctx.moveTo(x+15,y-15+by);ctx.lineTo(x+20,y-27+by);ctx.lineTo(x+7,y-21+by);ctx.fill();
  const ey=y-5+by;
  if(blink||mood==='happy'||pet){
    ctx.save();ctx.strokeStyle='#885588';ctx.lineWidth=2.2;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(x-6,ey,3.5,Math.PI,0,false);ctx.stroke();
    ctx.beginPath();ctx.arc(x+6,ey,3.5,Math.PI,0,false);ctx.stroke();ctx.restore()
  } else if(mood==='sad'){
    ctx.save();ctx.strokeStyle='#885588';ctx.lineWidth=2.2;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(x-6,ey+2,3.5,0,Math.PI,false);ctx.stroke();
    ctx.beginPath();ctx.arc(x+6,ey+2,3.5,0,Math.PI,false);ctx.stroke();ctx.restore()
  } else {
    rr(x-10,ey-4,6,8,4,'#885588',null);rr(x+4,ey-4,6,8,4,'#885588',null);
    pr(x-8,ey-2,2,2,'#fff');pr(x+6,ey-2,2,2,'#fff')
  }
  ctx.fillStyle='#ff9ec8';ctx.beginPath();
  ctx.moveTo(x,y+2+by);ctx.lineTo(x-3,y+5+by);ctx.lineTo(x+3,y+5+by);ctx.fill();
  ctx.save();ctx.strokeStyle='#885588';ctx.lineWidth=1.6;ctx.lineCap='round';
  if(mood==='happy'||pet){
    ctx.beginPath();ctx.moveTo(x-4,y+7+by);ctx.quadraticCurveTo(x-2,y+11+by,x,y+8+by);
    ctx.quadraticCurveTo(x+2,y+11+by,x+4,y+7+by);ctx.stroke()
  } else {
    ctx.beginPath();ctx.moveTo(x-4,y+7+by);ctx.quadraticCurveTo(x,y+10+by,x+4,y+7+by);ctx.stroke()
  }
  ctx.restore();
  ctx.save();ctx.strokeStyle='rgba(170,100,170,.5)';ctx.lineWidth=1.1;ctx.lineCap='round';
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.moveTo(x-5,y+1+by+i*3);ctx.lineTo(x-17,y+by+i*3.5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+5,y+1+by+i*3);ctx.lineTo(x+17,y+by+i*3.5);ctx.stroke()
  }
  ctx.restore();
  if(G.lv>=3){
    rr(x-12,y-36+by,24,7,3,'#fff','#f5b8d8',2);rr(x-8,y-50+by,16,15,4,'#fff','#f5b8d8',2);
    ctx.font='8px Arial';ctx.textAlign='center';ctx.fillText('🌸',x,y-42+by)
  }
  if(pet){
    const hs=Math.sin(G.petT*.12)*1.5;
    ctx.font=`${14+hs}px Arial`;ctx.textAlign='center';
    ctx.fillText('💕',x+21,y-26+by);ctx.fillText('✨',x-19,y-22+by)
  }
  if(mood==='sad'){
    ctx.fillStyle='#88ccff';ctx.beginPath();ctx.arc(x+17,y-10+by,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+17,y-7+by);ctx.lineTo(x+14,y-1+by);ctx.lineTo(x+20,y-1+by);ctx.fill()
  }
}

// ===== 顾客绘制（支持 VIP 皇冠 / 急性子 闪电标记）=====
function drawCust(c){
  const{x,y,type,mood,frame,order,waitPct,arriving,arrP,custType}=c;
  const ay=arriving?(1-arrP)*65:0,alpha=arriving?Math.min(arrP*2,1):1;
  ctx.save();ctx.globalAlpha=alpha;
  const t=CTYPES[type],bob=Math.sin(frame*.07)*1.8,fy=y+ay+bob;

  if(!arriving){
    const bw=42,bx=x-bw/2,bby=fy-52;
    rr(bx,bby,bw,6,3,'#fde8f2','#f5c6de',1);
    // 等待条颜色：VIP金色，急性子橙红，普通绿→黄→红
    let fc;
    if(custType==='vip'){
      fc=waitPct>.3?'#f0c030':'#e07010';
    } else if(custType==='impatient'){
      fc=waitPct>.5?'#ff7020':'#ff2020';
    } else {
      fc=waitPct>.5?'#78e878':waitPct>.25?'#f8e058':'#ff7878';
    }
    if(waitPct>0)rr(bx,bby,bw*waitPct,6,3,fc,null);

    // 菜品气泡
    const it=ITEMS[order];
    if(it){
      rr(x-18,fy-76,36,25,9,'rgba(255,255,255,.95)','#f5c6de',2);
      ctx.font='15px Arial';ctx.textAlign='center';ctx.fillText(it.e,x,fy-62);
      ctx.fillStyle='rgba(255,255,255,.95)';
      ctx.beginPath();ctx.moveTo(x-4,fy-51);ctx.lineTo(x+4,fy-51);ctx.lineTo(x,fy-44);ctx.fill();
      ctx.strokeStyle='#f5c6de';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x-4,fy-52);ctx.lineTo(x,fy-44);ctx.lineTo(x+4,fy-52);ctx.stroke()
    }

    // VIP 皇冠 + 金色光圈
    if(custType==='vip'){
      ctx.save();ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('👑',x,fy-79);
      ctx.strokeStyle='rgba(255,195,0,.55)';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(x,fy-17,17,0,Math.PI*2);ctx.stroke();ctx.restore()
    }
    // 急性子 闪电 + 橙色脉冲光圈
    if(custType==='impatient'){
      ctx.save();ctx.font='13px Arial';ctx.textAlign='center';ctx.fillText('⚡',x,fy-79);
      const pulse=0.35+0.35*Math.abs(Math.sin(frame*.18));
      ctx.strokeStyle=`rgba(255,90,0,${pulse})`;ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(x,fy-17,17,0,Math.PI*2);ctx.stroke();ctx.restore()
    }
  }

  // 身体
  rr(x-11,fy+6,22,27,7,t.out,null);
  ctx.fillStyle=t.out;ctx.beginPath();ctx.ellipse(x,fy+32,12,5,0,0,Math.PI);ctx.fill();
  rr(x-9,fy+28,7,13,4,t.col,null);rr(x+2,fy+28,7,13,4,t.col,null);
  rr(x-10,fy+38,9,5,3,'#885555',null);rr(x+1,fy+38,9,5,3,'#885555',null);
  rr(x-12,fy-17,24,24,10,t.col,null);
  ctx.fillStyle=t.hair;ctx.beginPath();ctx.ellipse(x,fy-13,13,10,0,Math.PI,0);ctx.fill();
  rr(x-12,fy-17,24,8,5,t.hair,null);rr(x-14,fy-15,5,16,4,t.hair,null);rr(x+9,fy-15,5,16,4,t.hair,null);
  if(type===0){
    ctx.fillStyle='#ff69b0';ctx.beginPath();ctx.arc(x-9,fy-19,3.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-9,fy-19,1.5,0,Math.PI*2);ctx.fill()
  } else if(type===3){
    ctx.font='9px Arial';ctx.textAlign='center';ctx.fillText('🌸',x+9,fy-20)
  }
  const ey=fy-6;
  if(mood==='happy'){
    ctx.save();ctx.strokeStyle='#553355';ctx.lineWidth=2;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(x-3,ey,2.8,Math.PI,0,false);ctx.stroke();
    ctx.beginPath();ctx.arc(x+3,ey,2.8,Math.PI,0,false);ctx.stroke();ctx.restore()
  } else if(mood==='angry'){
    rr(x-7,ey-2,4,4,2,'#553355',null);rr(x+3,ey-2,4,4,2,'#553355',null);
    ctx.strokeStyle='#553355';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x-8,ey-4);ctx.lineTo(x-3,ey-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+8,ey-4);ctx.lineTo(x+3,ey-2);ctx.stroke()
  } else {
    rr(x-7,ey-3,4,6,3,'#553355',null);rr(x+3,ey-3,4,6,3,'#553355',null);
    pr(x-6,ey-1,2,2,'#fff');pr(x+4,ey-1,2,2,'#fff')
  }
  ctx.save();ctx.strokeStyle='#885555';ctx.lineWidth=1.4;ctx.lineCap='round';
  if(mood==='happy'){
    ctx.beginPath();ctx.moveTo(x-3,fy+1);ctx.quadraticCurveTo(x,fy+4,x+3,fy+1);ctx.stroke()
  } else if(mood==='angry'){
    ctx.beginPath();ctx.moveTo(x-3,fy+3);ctx.quadraticCurveTo(x,fy,x+3,fy+3);ctx.stroke()
  } else {
    ctx.beginPath();ctx.moveTo(x-2,fy+2);ctx.lineTo(x+2,fy+2);ctx.stroke()
  }
  ctx.restore();ctx.restore();
}

// ===== 粒子系统 =====
function spawnPts(x,y,col,n=8){
  for(let i=0;i<n;i++)G.pts.push({x,y,vx:(Math.random()-.5)*5,vy:-Math.random()*5-1,col,life:1,sz:3+Math.random()*4,star:Math.random()>.5})
}
function spawnHrt(x,y){
  G.hearts.push({x,y,vy:-1.5-Math.random(),vx:(Math.random()-.5)*1.5,life:1,sz:13+Math.random()*7,e:Math.random()>.5?'💕':'✨'})
}
function updatePts(){
  G.pts=G.pts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.14;p.life-=.024;return p.life>0});
  G.hearts=G.hearts.filter(h=>{h.x+=h.vx;h.y+=h.vy;h.life-=.018;return h.life>0})
}
function drawPts(){
  G.pts.forEach(p=>{
    ctx.save();ctx.globalAlpha=p.life;ctx.fillStyle=p.col;
    if(p.star){
      ctx.translate(p.x,p.y);ctx.rotate(G.tick*.1);
      ctx.font=`${p.sz*2}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,0)
    } else {
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz/2,0,Math.PI*2);ctx.fill()
    }
    ctx.restore()
  });
  G.hearts.forEach(h=>{
    ctx.save();ctx.globalAlpha=h.life;ctx.font=`${h.sz}px Arial`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(h.e,h.x,h.y);ctx.restore()
  })
}

// ===== 制作进度条 =====
function drawMakeBar(){
  if(!G.making||!G.makeTgt||!G.makingItem)return;
  const it=G.makingItem;
  const pct=Math.max(0,Math.min(1,1-G.makeT/it.t));
  const bx=152,by=370,bw=102,bh=13;
  rr(bx,by,bw,bh,6,'#fff0f7','#f5c6de',2);
  if(pct>0)rr(bx,by,bw*pct,bh,6,'#ff69b0',null);
  ctx.save();ctx.fillStyle='#885588';ctx.font='bold 9px Arial';ctx.textAlign='center';
  ctx.fillText(it.e+' 制作中 '+Math.round(pct*100)+'%',bx+bw/2,by+bh/2+3);ctx.restore()
}

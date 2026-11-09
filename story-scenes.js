/* Life-specific particle choreography. All positions use the existing scene projector. */
(() => {
 'use strict';
 document.querySelectorAll('.letter .fine').forEach(node => node.remove());
 const style=document.createElement('style');
 style.textContent=`
 .caption{transition:opacity .3s,transform .4s;transform-style:preserve-3d}
 .caption.turning{opacity:0;transform:perspective(1000px) rotateX(-35deg) translateY(-12px)}
 .caption.show{transform:perspective(1000px) rotateX(0);opacity:1}
 .transport button{position:relative;width:clamp(35px,6vw,82px)}
 .transport button:before{content:'';position:absolute;top:12px;left:4px;right:4px;height:3px;background:#aaa6a23a}
 .transport button:after,.transport button.active:after{position:absolute;top:12px;left:4px;width:calc((100% - 8px)*var(--progress,0));height:3px;background:#eed2a0;box-shadow:0 0 7px #f4d7a366}
 .float{font-size:clamp(16px,1.6vw,23px);text-shadow:0 2px 8px #000,0 0 15px #000}
 @media(max-width:650px){.transport button{width:27px}.transport{gap:3px}}
 `;
 document.head.append(style);
 const mix=(a,b,t)=>a+(b-a)*t;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const humanA=[],humanB=[];
 makeHuman(humanA,1700,false);makeHuman(humanB,4700,true);
 const animal=[];
 function cloud(cx,cy,rx,ry,n,part,seed){
  for(let i=0;i<n;i++){
   const angle=rnd(seed+i)*Math.PI*2,r=Math.sqrt(rnd(seed+i+3000));
   animal.push({x:cx+Math.cos(angle)*rx*r,y:cy+Math.sin(angle)*ry*r,z:(rnd(seed+i+7000)-.5)*.12,part,s:rnd(seed+i+9000)});
  }
 }
 // Large round head, compact seated body, small paws and sharply triangular ears.
 cloud(0,.04,.24,.32,410,'catBody',1200);
 cloud(-.015,-.36,.265,.235,520,'catHead',2200);
 cloud(-.145,.30,.095,.065,85,'catPaw',3200);
 cloud(.145,.30,.095,.065,85,'catPaw',4200);
 for(const side of [-1,1])for(let i=0;i<120;i++){
  const v=Math.sqrt(rnd(5200+i+side*200)),u=rnd(6200+i+side*200);
  animal.push({x:side*(.18+(u-.5)*.19*v),y:-.72+.24*v,z:0,part:'catEar',s:rnd(i+side*200+7200)});
 }
 for(let i=0;i<210;i++){
  const u=i/209,angle=-Math.PI/2+u*Math.PI*1.65;
  animal.push({x:.27+Math.cos(angle)*(.17-u*.035),y:.10+Math.sin(angle)*.23,z:0,part:'catTail',s:rnd(i+8200)});
 }
 function screen(x,y,z=0){return project(x,y,z)}
 function point(x,y,z,color,alpha,size=1){
  const pt=screen(x,y,z);ctx.fillStyle=`rgba(${color},${alpha})`;
  ctx.beginPath();ctx.arc(pt.x,pt.y,size,0,Math.PI*2);ctx.fill();
 }
 function curve(points,color,alpha=.45,width=.8){
  ctx.beginPath();points.forEach((p,i)=>{const q=screen(p[0],p[1],p[2]||0);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y)});
  ctx.strokeStyle=`rgba(${color},${alpha})`;ctx.lineWidth=width;ctx.stroke();
 }
 function armPose(q,side,pose,t){
  if(q.part!=='armL'&&q.part!=='armR')return{x:q.x,y:q.y,z:q.z};
  const s=q.part==='armL'?-1:1,pivot={x:s*.255,y:-1.15};
  const f=clamp((q.y+1.17)/.66),jitter=(q.x-s*.31)*.7;
  let elbow,hand;
  if(pose==='pet'&&s===1){
   elbow={x:.48,y:-.94};hand={x:.88+Math.sin(t*1.9)*.055,y:-.68+Math.sin(t*3.8)*.018};
  }else if(pose==='palm'&&s===1){
   elbow={x:.47,y:-.91};hand={x:.77,y:-.99};
  }else if(pose==='hug'){
   elbow={x:s*.42,y:-.91};hand={x:-side*.02+s*.08,y:-.87};
  }else return{x:q.x,y:q.y,z:q.z};
  let p;
  if(f<.48){const k=f/.48;p={x:mix(pivot.x,elbow.x,k),y:mix(pivot.y,elbow.y,k)}}
  else{const k=(f-.48)/.52;p={x:mix(elbow.x,hand.x,k),y:mix(elbow.y,hand.y,k)}}
  return{x:p.x+jitter,y:p.y+(q.z||0)*.22,z:q.z};
 }
 function drawHuman(cloud,x,y,{color='232,207,168',pose='',side=-1,alpha=1,size=1,t=0}={}){
  for(let i=0;i<cloud.length;i+=(W<650?2:1)){
   const q=cloud[i],p=armPose(q,side,pose,t);
   const breath=Math.sin(t*.85)*.009;
   point(x+p.x*size,y+p.y*size+breath,p.z,color,(.32+q.s*.65)*alpha,(.65+q.s*.65)*(q.part==='hair'?1.1:1));
  }
 }
 function palm(x,y,color,t){
  curve([[x-.07,y+.008],[x,y+.025],[x+.08,y],[x+.13,y-.035]],color,.8,1);
  for(let i=0;i<34;i++)point(x+(rnd(i+44)-.5)*.15,y+(rnd(i+99)-.5)*.026,0,color,.7,.85);
 }
 const seedAngles=Array.from({length:92},(_,i)=>({a:i/92*Math.PI*2,r:.28+rnd(i+300)*.11,z:(rnd(i+600)-.5)*.2,s:rnd(i+900)}));
 function puff(x,y,size,color,alpha=1,angle=0){
  const root=screen(x,y),p=screen(x+Math.cos(angle)*size,y+Math.sin(angle)*size);
  ctx.lineWidth=.7;ctx.strokeStyle=`rgba(${color},${alpha*.55})`;
  ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.lineTo(p.x,p.y);ctx.stroke();
  for(let j=0;j<5;j++){
   const a=angle+Math.PI+(j-2)*.45,len=size*.45;
   const tip=screen(x+Math.cos(angle)*size+Math.cos(a)*len,y+Math.sin(angle)*size+Math.sin(a)*len);
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
  }
  ctx.fillStyle=`rgba(${color},${alpha})`;ctx.fillRect(root.x,root.y,1,1);
 }
 function dandelionScene(t,p){
  const local=p-61,blow=ease(10,28,local),home=ease(31,51,local),baseX=.55,baseY=-.96;
  const handX=-.58+.77,handY=-.99,color='240,227,252';
  drawHuman(humanB,-.58,0,{color:'225,205,239',pose:'palm',t});palm(handX,handY,'243,218,251',t);
  // The stem remains while the individual parachute seeds lift away.
  curve([[baseX,baseY+.02],[baseX-.02,baseY+.34],[baseX-.06,baseY+.77]],'194,202,179',(1-home)*.72,1);
  for(let i=0;i<seedAngles.length;i++){
   const q=seedAngles[i],release=ease(10+q.s*8,23+q.s*8,local),returning=ease(31+q.s*5,49+q.s*5,local);
   const sx=baseX+Math.cos(q.a)*q.r,sy=baseY+Math.sin(q.a)*q.r;
   const windX=sx+release*(.42+q.s*1.45),windY=sy-release*(.35+q.s*.65)+Math.sin(q.a*5+t*.9)*.08*release;
   const destinationX=handX+Math.cos(q.a)*q.r*.44,destinationY=handY-.14+Math.sin(q.a)*q.r*.44;
   const x=mix(windX,destinationX,returning),y=mix(windY,destinationY,returning);
   if(release<.04){const root=screen(baseX,baseY),tip=screen(sx,sy);ctx.strokeStyle=`rgba(${color},.3)`;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.lineTo(tip.x,tip.y);ctx.stroke()}
   puff(x,y,.055,color,.52+q.s*.45,q.a+Math.sin(t*.8+i)*release*.45);
  }
  // Returned light softly gathers into a small intact seed head above the open hand.
  if(home>.05){const q=screen(handX,handY-.14),r=screen(handX+.2,handY-.14);const rad=Math.abs(r.x-q.x)*1.5;
   const glow=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,rad);glow.addColorStop(0,`rgba(224,193,255,${home*.09})`);glow.addColorStop(1,'rgba(224,193,255,0)');ctx.fillStyle=glow;ctx.fillRect(q.x-rad,q.y-rad,rad*2,rad*2);
  }
 }
 function catFace(x,y,alpha,t){
  const color='248,229,255';
  // Closed smiling eyes, tiny nose and whiskers make the kitten readable at phone size.
  for(const side of [-1,1]){
   const pts=[];for(let j=0;j<=12;j++){const k=j/12;pts.push([x+side*.095+(k-.5)*.075,y-.36+Math.sin(k*Math.PI)*.025])}
   curve(pts,color,alpha*.95,1.35);
   for(let j=0;j<2;j++)curve([[x+side*.13,y-.30+j*.04],[x+side*.34,y-.32+j*.07]],color,alpha*.7,.8);
  }
  curve([[x-.024,y-.287],[x,y-.27],[x+.024,y-.287]],'249,175,213',alpha,1.5);
 }
 function thirdLife(t,p){
  const local=p-122,change=ease(19,38,local),embrace=ease(37,54,local),boyX=mix(-.65,-.22,embrace),girlX=mix(.58,.14,embrace);
  drawHuman(humanA,boyX,0,{pose:embrace>.08?'hug':'pet',side:-1,color:'187,230,224',t});
  // Same particles move from kitten coordinates into a full human silhouette.
  for(let i=0;i<animal.length;i+=(W<650?2:1)){
   const q=animal[i],destination=humanB[i%humanB.length],catX=.30+q.x,catY=-.02+q.y;
   const girlPose=armPose(destination,1,embrace>.08?'hug':'',t);
   let x=mix(catX,girlX+girlPose.x,change),y=mix(catY,girlPose.y,change);
   const shimmer=Math.sin(t*1.2+q.s*24)*Math.sin(change*Math.PI)*.13;
   x+=shimmer;y+=Math.cos(t+q.s*35)*Math.sin(change*Math.PI)*.06;
   if(q.part==='catTail'&&change<1)x+=Math.sin(t*1.7)*.055*(1-change);
   point(x,y,q.z,'234,204,251',.4+q.s*.56,.65+q.s*.64);
  }
  if(change<.95)catFace(.30,-.02,1-change,t);
  // Little collar bells turn into the girl's hair ornaments as the shape changes.
  for(let i=0;i<4;i++){
   const x=mix(.22+i*.055,girlX+.16+i*.025,change),y=mix(-.17,-1.36+i*.055,change),pt=screen(x,y);
   ctx.strokeStyle=`rgba(250,222,159,${.65+Math.sin(t*3+i)*.2})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(pt.x,pt.y,2.5,0,7);ctx.stroke();
  }
  if(embrace>.05){
   // Two softly curved arms close around the other person's back.
   for(const side of [-1,1]){
    const arm=[];
    for(let i=0;i<=75;i++){
     const u=i/75,v=1-u;
     const x=v*v*(-side*.30)+2*v*u*(side*.42)+u*u*(side*.22);
     const y=v*v*(-1.14)+2*v*u*(-.68)+u*u*(-.90);
     arm.push([x,y]);
     point(x+(rnd(i+side*90)-.5)*.035,y+(rnd(i+100)-.5)*.025,0,'229,212,246',embrace*.7,.9);
    }
    curve(arm,'237,218,250',embrace*.28,.7);
   }
  }
 }
 // Single active choreography function, replacing the older circular interpolation.
 drawTransformation=function(t,p){
  ctx.save();ctx.globalCompositeOperation='lighter';
  const act=scenePair();
  if(act===0){
   const near=ease(17,47,p),x=mix(.70,.48,near);
   drawHuman(humanA,-x,0,{color:'239,211,162',t});
   drawHuman(humanB,x,0,{color:'240,206,203',t});
  }else if(act===1)dandelionScene(t,p);else thirdLife(t,p);
  ctx.restore();
 };
 // Sample cubic wing contours into fixed particles. Four broad lobes form one butterfly;
 // the wings rotate out of the screen around their roots on every beat.
 const wingParticles=[];
 function cubic(a,b,c,d,u){const v=1-u;return v*v*v*a+3*v*v*u*b+3*v*u*u*c+u*u*u*d}
 const segments=[
  [[.03,-.02],[.12,-.60],[.77,-1.03],[1,-.63]],
  [[1,-.63],[1.10,-.39],[.78,-.15],[.43,-.04]],
  [[.43,-.04],[.89,.06],[.88,.58],[.54,.67]],
  [[.54,.67],[.28,.75],[.12,.21],[.03,.07]]
 ];
 for(const side of [-1,1])for(let k=0;k<segments.length;k++){
  const c=segments[k];for(let i=0;i<130;i++){
   const u=i/130,x=cubic(c[0][0],c[1][0],c[2][0],c[3][0],u),y=cubic(c[0][1],c[1][1],c[2][1],c[3][1],u);
   wingParticles.push({x:x*side,y,s:rnd(i+k*140+side*900),phase:i*.02+k});
  }
 }
 grandButterfly=function(t){
  const motion=reduce?.25:1,orbit=t*.32*motion,cx=W*.5+Math.cos(orbit)*Math.min(W*.15,165),cy=H*.62+Math.sin(orbit*1.15)*Math.min(H*.09,70);
  const span=Math.min(W*.14,125),beat=t*7.3*motion,opening=.35+.65*(.5+.5*Math.sin(beat)),bank=Math.cos(orbit)*.24;
  const color=['255,224,164','234,215,255','216,238,255'][scenePair()];
  ctx.save();ctx.translate(cx,cy);ctx.rotate(bank);ctx.globalCompositeOperation='lighter';
  for(const q of wingParticles){
   const flutter=Math.sin(beat+Math.abs(q.x)*.7),x=q.x*span*opening,y=q.y*span*.8+Math.abs(q.x)*flutter*9;
   ctx.fillStyle=`rgba(${color},${.4+q.s*.55})`;
   ctx.beginPath();ctx.arc(x,y,.6+q.s*.85,0,Math.PI*2);ctx.fill();
   if(q.s>.94){ctx.shadowColor=`rgb(${color})`;ctx.shadowBlur=7;ctx.fillRect(x,y,1.2,1.2);ctx.shadowBlur=0}
  }
  // Four curved half-wing contours remain visible, softly traced beneath the particles.
  for(const side of [-1,1]){
   ctx.beginPath();
   segments.forEach((seg,k)=>{
    const coords=seg.map(pt=>[pt[0]*side*span*opening,pt[1]*span*.8+Math.abs(pt[0])*Math.sin(beat+pt[0]*.7)*9]);
    if(!k)ctx.moveTo(...coords[0]);ctx.bezierCurveTo(...coords[1],...coords[2],...coords[3]);
   });
   ctx.strokeStyle=`rgba(${color},.22)`;ctx.lineWidth=.65;ctx.stroke();
  }
  ctx.restore();
 };
 const originalUpdate=update;
 let visibleCue=-1,cueTimer=0;
 update=function(){
  originalUpdate();
  if(cueIndex!==visibleCue){
   visibleCue=cueIndex;const expected=visibleCue;clearTimeout(cueTimer);
   const box=$('caption');box.classList.add('turning');
   cueTimer=setTimeout(()=>{if(expected===visibleCue)box.classList.remove('turning')},460);
  }
  const bounds=[0,61,122,D];document.querySelectorAll('#transport button').forEach((b,i)=>b.style.setProperty('--progress',clamp((elapsed-bounds[i])/(bounds[i+1]-bounds[i]))));
 };
 window.storyPreview={version:'20261109-revision2',catCount:animal.length,butterflyPoints:wingParticles.length,
  stageAt(seconds){return seconds<61?'双人':seconds<122?'蒲公英吹散与回手':'抚猫、幻化、拥抱'}};
})();

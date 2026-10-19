/** Lightweight canvas artwork. Pauses outside the viewport, in hidden tabs, and for reduced motion. */
export function createOrbital(canvas, canAnimate) {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return { refresh(){}, setScroll(){} };
  let width=1,height=1,frame=0,last=0,elapsed=0,scroll=0,visible=true;
  const particles=[];
  // Deterministic particles keep the composition stable between visits.
  let seed=1247;
  const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  for(let i=0;i<2400;i++) particles.push({a:random()*Math.PI*2,r:170+random()*110,z:(random()-.5)*10,size:.3+random()*.9,bright:random()});
  const stars=Array.from({length:70},()=>({x:random(),y:random(),a:.15+random()*.35,r:.3+random()*.6}));
  function project(x,y,z,t) {
    const angle=-.32+t*.05;
    const xx=x*Math.cos(angle)-y*Math.sin(angle), yy=x*Math.sin(angle)+y*Math.cos(angle);
    const tilt=.36+scroll*.11;
    return [xx,yy*tilt-z*.94,yy*.94+z*tilt];
  }
  function draw(t) {
    ctx.clearRect(0,0,width,height);
    const scale=Math.min(width/760,height/720),cx=width*.5,cy=height*.48;
    for(const star of stars){ctx.fillStyle=`rgba(225,213,255,${star.a})`;ctx.beginPath();ctx.arc(star.x*width,star.y*height,star.r,0,Math.PI*2);ctx.fill();}
    ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);
    const haze=ctx.createRadialGradient(0,0,10,0,0,330);haze.addColorStop(0,'rgba(129,69,180,.12)');haze.addColorStop(.45,'rgba(113,49,175,.08)');haze.addColorStop(1,'rgba(80,40,120,0)');ctx.fillStyle=haze;ctx.fillRect(-350,-350,700,700);
    function ring(radius,alpha,line=1){ctx.beginPath();for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;const p=project(Math.cos(a)*radius,Math.sin(a)*radius,0,t);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.strokeStyle=`rgba(196,141,247,${alpha})`;ctx.lineWidth=line;ctx.stroke();}
    ring(310,.22,.6);ring(320,.08,.5);ring(290,.14,.5);
    for(const p of particles){const a=p.a+t*.025;const q=project(Math.cos(a)*p.r,Math.sin(a)*p.r,p.z,t);if(q[2]>0)continue;ctx.fillStyle=`rgba(187,133,238,${.12+p.bright*.55})`;ctx.beginPath();ctx.arc(q[0],q[1],p.size,0,Math.PI*2);ctx.fill();}
    const glow=ctx.createRadialGradient(-30,-33,8,0,0,140);glow.addColorStop(0,'#32233f');glow.addColorStop(.65,'#1c142c');glow.addColorStop(.92,'#171026');glow.addColorStop(1,'#ac6ce3');
    ctx.shadowColor='#b76eff';ctx.shadowBlur=26;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,133,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    ctx.save();ctx.beginPath();ctx.arc(0,0,132,0,Math.PI*2);ctx.clip();
    for(let lat=-5;lat<=5;lat++){
      const v=lat/6*Math.PI/2,rad=Math.cos(v)*132,y=Math.sin(v)*132;
      ctx.beginPath();ctx.ellipse(0,y,rad,Math.max(.5,rad*.14),-.15,0,Math.PI*2);ctx.strokeStyle='rgba(190,128,237,.13)';ctx.lineWidth=.6;ctx.stroke();
    }
    for(let n=0;n<14;n++){
      const angle=n/14*Math.PI*2+t*.08;
      ctx.beginPath();for(let k=0;k<=80;k++){const a=k/80*Math.PI;const x=Math.sin(a)*Math.cos(angle)*132,y=Math.cos(a)*132; k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle='rgba(187,127,241,.15)';ctx.stroke();
    }
    ctx.restore();
    const limb=ctx.createLinearGradient(-130,-130,130,130);limb.addColorStop(0,'#e7b5ff');limb.addColorStop(.45,'#a477cb');limb.addColorStop(1,'#593e76');ctx.strokeStyle=limb;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,133,0,Math.PI*2);ctx.stroke();
    for(const p of particles){const a=p.a+t*.025;const q=project(Math.cos(a)*p.r,Math.sin(a)*p.r,p.z,t);if(q[2]<=0)continue;ctx.fillStyle=`rgba(${p.bright>.92?'241,202,255':'191,137,239'},${.2+p.bright*.7})`;ctx.beginPath();ctx.arc(q[0],q[1],p.size,0,Math.PI*2);ctx.fill();}
    ring(201,.2,.6);ring(276,.3,.7);
    // A crossing orbital path adds depth without an expensive WebGL dependency.
    ctx.save();ctx.rotate(-.7);ctx.beginPath();ctx.ellipse(0,0,190,235,0,0,Math.PI*2);ctx.strokeStyle='rgba(170,127,214,.16)';ctx.lineWidth=.6;ctx.stroke();const a=t*.06+.6;const x=Math.cos(a)*190,y=Math.sin(a)*235;ctx.shadowColor='#daa6ff';ctx.shadowBlur=14;ctx.fillStyle='#e7c6ff';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.restore();
  }
  function loop(time){frame=0;if(!canAnimate()||!visible||document.hidden)return;if(!last)last=time;elapsed+=Math.min((time-last)/1000,.05);last=time;draw(elapsed);frame=requestAnimationFrame(loop);}
  function refresh(){cancelAnimationFrame(frame);frame=0;last=0;draw(elapsed);if(canAnimate()&&visible&&!document.hidden)frame=requestAnimationFrame(loop);}
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);refresh();}
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();}).observe(canvas);
  document.addEventListener('visibilitychange',refresh);resize();
  return {refresh,setScroll(value){scroll=canAnimate()?value:0;}};
}

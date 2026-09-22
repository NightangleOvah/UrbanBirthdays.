/* 2008 AUTHENTICITY PASS — procedural catalog renders + R6 portrait WebGL */
(()=> {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const addPortal=()=>{
    if(q("#retroPortal"))return;
    const el=document.createElement("section");el.id="retroPortal";el.className="retro-portal";
    el.innerHTML='<div class="retro-logo-bar"><div class="retro-logo">RŌBLOX<small>Think. Create.</small></div><div><b style="font:13px Verdana;color:#333">BIRTHDAY SERVER 2008</b><br><span style="font:10px Verdana;color:#777">Naren &amp; Chilley double event</span></div><form class="retro-login"><input placeholder="Username"><input type="password" placeholder="Password"><button type="button">LOGIN</button></form></div>'+
      '<div class="retro-nav"><a href="#home">My ROBLOX</a><a href="#retroGames">Games</a><a href="#retroCatalog">Catalog</a><a href="#profiles">People</a><a href="#vip-shop">Builders Club</a><a href="#guestbook">Forum</a></div>'+
      '<div class="retro-portal-body"><aside class="retro-side"><h3>MY ROBLOX</h3><a href="#home">Home</a><a href="#profiles">My Profile</a><a href="#gifts">My Inventory</a><a href="#retroGames">My Games</a><a href="#guestbook">Messages</a><a href="#memory-vault">Memories</a><div class="retro-currency"><b class="ticket">Tickets Tx 2,008</b><b class="robux-old">Robux R$ 999,999</b></div></aside><div class="retro-mainbox"><h3>Welcome to Birthday ROBLOX</h3><div class="retro-welcome">Play a place, inspect the two birthday players, browse the catalog, and unlock the event rewards. This portal is a local retro recreation; it does not connect to Roblox accounts.</div><button class="retro-play" onclick="document.querySelector("#client-view")?.scrollIntoView({behavior:'smooth'})">PLAY NOW</button>'+
      '<div id="retroGames" class="retro-grid">'+[
        ["Birthday Crossroads","156 players online"],["Happy Home","94 players online"],["Rocket Arena","81 players online"],["Swordless Heights","72 players online"],["BrickBattle Plaza","64 players online"],["Naren's Base","17 players online"],["Chilley's Obby","14 players online"],["Studded Raceway","43 players online"],["Bloxy Hangout","28 players online"],["Birthday Tycoon","51 players online"]
      ].map((x,i)=>'<article class="retro-game" data-game="'+esc(x[0])+'"><div class="retro-thumb"><span class="brick"></span><span class="figure"></span></div><a href="#client-view">'+esc(x[0])+'</a><small>By Birthday Server<br><em>'+esc(x[1])+'</em></small></article>').join("")+
      '</div><div class="retro-portal-note">Classic layout note: the dual-currency display and compact game/catalog metadata are visual recreations of the era, not real Roblox balances or purchases.</div></div></div>'+
      '<div id="retroCatalog" class="retro-catalog"><div class="retro-mainbox"><h3>CATALOG — BIRTHDAY CLASSICS</h3><div class="catalog-layout"><div class="catalog-filters">'+["Hats","T-Shirts","Shirts","Pants","Decals","Models"].map(x=>'<button type="button">'+x+'</button>').join("")+'</div><div class="catalog-items">'+[
        ["Sparkle Time Fedora","R$ 10,000","fedora"],["Dominus Empyreus","R$ 13,337","dominus"],["Builders Club Hardhat","Tx 25","hardhat"],["Golden Party Hat","Tx 17","party"],["Speed Coil","R$ 250","coil"],["Snapshot Camera","Tx 40","camera"],["Bloxy Award","R$ 500","trophy"],["Chaos Stamp","Tx 14","chaos"]
      ].map(x=>'<article class="catalog-item"><div class="catalog-render" data-gear="'+x[2]+'"></div><b>'+x[0]+'</b><small>Birthday Server Classic</small><div class="catalog-price '+(x[1].startsWith("Tx")?"ticket":"robux-old")+'">'+x[1]+'</div></article>').join("")+
      '</div></div></div></div>';
    const ribbon=q(".server-ribbon"); if(ribbon) ribbon.after(el);
  };
  const replaceEmoji=()=>{
    const map={"🐐":"goat","🛡️":"shield","🏆":"trophy","🌀":"chaos","❤️":"heart","🎈":"party","🎂":"party","🍕":"pizza","📷":"camera"};
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())if(Object.keys(map).some(k=>walker.currentNode.nodeValue.includes(k)))nodes.push(walker.currentNode);
    nodes.forEach(n=>{let html=esc(n.nodeValue);for(const [emoji,cls] of Object.entries(map))html=html.split(emoji).join('<span class="catalog-icon '+cls+'" aria-label="classic catalog item"></span>');const holder=document.createElement("span");holder.innerHTML=html;n.parentNode.replaceChild(holder,n)});
  };
  const mat=(a,b)=>{const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
  const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  const T=(x,y,z)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m};
  const S=(x,y,z)=>{const m=I();m[0]=x;m[5]=y;m[10]=z;return m};
  const RX=a=>{const m=I(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m};
  const RY=a=>{const m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m};
  const P=(f,a,n,z)=>{const t=1/Math.tan(f/2),m=new Array(16).fill(0);m[0]=t/a;m[5]=t;m[10]=(z+n)/(n-z);m[11]=-1;m[14]=2*z*n/(n-z);return m};
  function initR6(canvas,variant){
    const gl=canvas.getContext("webgl",{antialias:true,alpha:false});if(!gl)return;
    const vs="attribute vec3 p;attribute vec3 n;uniform mat4 mvp,model;varying vec3 vn;void main(){vn=mat3(model)*n;gl_Position=mvp*vec4(p,1.0);}";
    const fs="precision mediump float;uniform vec3 c;varying vec3 vn;void main(){vec3 l=normalize(vec3(-.4,.9,.6));float d=max(dot(normalize(vn),l),0.0);gl_FragColor=vec4(c*(.52+d*.48)+.08,1.0);}";
    const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
    const pl=gl.getAttribLocation(pr,"p"),nl=gl.getAttribLocation(pr,"n"),ml=gl.getUniformLocation(pr,"mvp"),mdl=gl.getUniformLocation(pr,"model"),cl=gl.getUniformLocation(pr,"c");
    const v=[];const pp=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]];
    const face=(a,b,c,d,n)=>[a,b,c,a,c,d].forEach(x=>v.push(...x,...n));
    face(pp[0],pp[1],pp[2],pp[3],[0,0,1]);face(pp[1],pp[5],pp[6],pp[2],[1,0,0]);face(pp[5],pp[4],pp[7],pp[6],[0,0,-1]);face(pp[4],pp[0],pp[3],pp[7],[-1,0,0]);face(pp[3],pp[2],pp[6],pp[7],[0,1,0]);face(pp[4],pp[5],pp[1],pp[0],[0,-1,0]);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(nl);gl.vertexAttribPointer(nl,3,gl.FLOAT,false,24,12);
    let yaw=.45,pitch=-.12,drag=false,lx=0,ly=0;canvas.addEventListener("pointerdown",e=>{drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener("pointermove",e=>{if(!drag)return;yaw+=(e.clientX-lx)*.009;pitch+=(e.clientY-ly)*.006;pitch=Math.max(-.7,Math.min(.5,pitch));lx=e.clientX;ly=e.clientY});canvas.addEventListener("pointerup",()=>drag=false);canvas.addEventListener("pointercancel",()=>drag=false);
    const color=variant==="naren"?[.93,.67,.08]:[.18,.55,.88];const skin=[.78,.47,.28],dark=[.12,.15,.18];
    function cube(x,y,z,sx,sy,sz,c,rot=0){const model=mat(T(x,y,z),mat(RY(rot),S(sx,sy,sz)));const cam=mat(T(0,-1.55,-8.6),mat(RX(pitch),RY(yaw)));const mvp=mat(P(Math.PI/3,canvas.width/canvas.height,.1,50),mat(cam,model));gl.uniformMatrix4fv(mdl,false,new Float32Array(model));gl.uniformMatrix4fv(ml,false,new Float32Array(mvp));gl.uniform3fv(cl,new Float32Array(c));gl.drawArrays(gl.TRIANGLES,0,36)}
    function resize(){const d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*d);canvas.height=Math.max(1,r.height*d);gl.viewport(0,0,canvas.width,canvas.height)}
    addEventListener("resize",resize);resize();gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(.69,.82,.9,1);
    const draw=()=>{gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);cube(0,-1.05,0,7,.2,7,[.42,.52,.34]);for(let x=-6;x<=6;x++)for(let z=-5;z<=5;z++)cube(x*.45,-.94,z*.45,.34,.035,.34,[.5,.59,.4]);
      cube(0,.1,0,1.25,1.55,.68,variant==="naren"?[.16,.36,.7]:[.8,.18,.38]);cube(0,1.72,0,.9,.9,.9,[.86,.65,.43]);
      cube(-.9,.1,0,.42,1.32,.5,skin);cube(.9,.1,0,.42,1.32,.5,skin);cube(-.38,-1.02,0,.52,1.12,.56,dark);cube(.38,-1.02,0,.52,1.12,.56,dark);
      cube(0,2.16,0,1.02,.18,1.02,variant==="naren"?[.83,.62,.06]:[.95,.78,.12]);cube(0,2.34,0,.58,.2,.58,variant==="naren"?[.72,.48,.05]:[.95,.25,.35]);
      cube(-.22,1.76,.46,.07,.07,.04,[.03,.03,.03]);cube(.22,1.76,.46,.07,.07,.04,[.03,.03,.03]);requestAnimationFrame(draw)};
    draw();
  }
  const mountAvatars=()=>{
    qa(".avatar-stage").forEach((stage,i)=>{if(stage.querySelector(".r6-avatar-canvas"))return;const c=document.createElement("canvas");c.className="r6-avatar-canvas";c.setAttribute("aria-label",(i===0?"Naren":"Chilley")+" 3D R6 avatar");stage.prepend(c);initR6(c,i===0?"naren":"chilley")});
  };
  const mountGear=()=>qa(".catalog-render").forEach(el=>{if(el.querySelector("canvas"))return;const c=document.createElement("canvas");el.appendChild(c);initGear(c,el.dataset.gear)});
  function initGear(canvas,type){
    const ctx=canvas.getContext("2d");if(!ctx)return;let t=0;
    const draw=()=>{const w=canvas.width=canvas.clientWidth*2,h=canvas.height=canvas.clientHeight*2;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);ctx.scale(w/220,h/130);ctx.rotate(Math.sin(t)*.05);
      const g=ctx.createLinearGradient(-40,-40,40,40);g.addColorStop(0,"#fff");g.addColorStop(.5,type==="hardhat"||type==="party"?"#e7bd36":"#4772b8");g.addColorStop(1,"#777");ctx.fillStyle=g;ctx.strokeStyle="#444";ctx.lineWidth=2;
      if(type==="fedora"||type==="dominus"){ctx.beginPath();ctx.ellipse(0,0,48,18,0,0,Math.PI*2);ctx.fill();ctx.fillRect(-28,-28,56,30);ctx.stroke();ctx.fillStyle="#222";ctx.fillRect(-25,-4,50,6)}
      else if(type==="hardhat"||type==="party"){ctx.beginPath();ctx.arc(0,0,38,Math.PI,0);ctx.lineTo(43,18);ctx.lineTo(-43,18);ctx.closePath();ctx.fill();ctx.fillRect(-45,15,90,8);ctx.stroke()}
      else if(type==="coil"){ctx.strokeStyle="#c88000";ctx.lineWidth=9;ctx.beginPath();for(let i=0;i<70;i++){const a=i*.3,r=8+i*.38;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*.45)}ctx.stroke()}
      else if(type==="camera"){ctx.fillStyle="#333";ctx.fillRect(-48,-27,96,54);ctx.fillStyle="#bbb";ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.fillStyle="#111";ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#777";ctx.fillRect(-25,-38,28,12)}
      else{ctx.fillStyle="#d9a52d";ctx.fillRect(-35,-42,70,84);ctx.fillStyle="#fff";ctx.font="bold 38px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(type==="trophy"?"B":"C",0,2)}
      ctx.restore();t+=.02;requestAnimationFrame(draw)};draw();
  }
  const observe=()=>{const mo=new MutationObserver(()=>replaceEmoji());mo.observe(document.body,{childList:true,subtree:true});};
  addPortal();mountAvatars();mountGear();replaceEmoji();observe();
})();
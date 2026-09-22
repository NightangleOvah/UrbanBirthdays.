const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

const state={
  muted:localStorage.getItem("birthdayMuted")==="1",
  score:0,
  q:0,
  robux:Number(localStorage.getItem("birthdayRobux")||999999),
  opened:new Set(JSON.parse(localStorage.getItem("openedBirthdayGifts")||"[]")),
  talked:new Set(JSON.parse(localStorage.getItem("birthdayTalked")||"[]")),
  triviaComplete:localStorage.getItem("birthdayTriviaComplete")==="1"
};

let audioCtx;
let audioUnlocked=false;
let currentDialogue=null;
let dialogueStep=0;

function unlockAudio(){
  if(state.muted||audioUnlocked)return;
  try{
    audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended")audioCtx.resume();
    audioUnlocked=true;
  }catch{}
}
function beep(freq=520,duration=.06,type="square",gain=.028){
  if(state.muted)return;
  try{
    audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
    if(!audioUnlocked)return;
    if(audioCtx.state==="suspended")audioCtx.resume();
    audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended")audioCtx.resume();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(gain,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
    o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);
  }catch{}
}
function menuClick(){beep(440,.035,"square",.02)}
function successSound(){beep(620,.08);setTimeout(()=>beep(820,.12),90)}
function victorySound(){beep(523,.09,"triangle");setTimeout(()=>beep(659,.09,"triangle"),90);setTimeout(()=>beep(784,.18,"triangle"),180)}
function oofSound(){beep(160,.16,"sawtooth",.035);setTimeout(()=>beep(95,.18,"sawtooth",.025),120)}
function toast(message){
  const el=$("#toast");el.textContent=message;el.classList.add("show");
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300);
}
function updateSoundButton(){
  $("#soundToggle").innerHTML=state.muted?'<i class="fa-solid fa-volume-xmark"></i>':'<i class="fa-solid fa-volume-high"></i>';
  $("#soundToggle").setAttribute("aria-label",state.muted?"Unmute sounds":"Mute sounds");
}
function updateRobux(){
  $("#robuxCount").textContent=state.robux.toLocaleString();
  localStorage.setItem("birthdayRobux",String(state.robux));
}
function addRobux(amount){
  state.robux+=amount;updateRobux();toast(`+${amount.toLocaleString()} Birthday R$!`);
}
updateSoundButton();updateRobux();

document.addEventListener("pointerdown",()=>unlockAudio(),{once:true,passive:true});
document.addEventListener("keydown",()=>unlockAudio(),{once:true,passive:true});

$("#soundToggle").onclick=()=>{
  if(!state.muted)unlockAudio();
  state.muted=!state.muted;localStorage.setItem("birthdayMuted",state.muted?"1":"0");updateSoundButton();
  if(!state.muted)successSound();
};
$$("nav a,.btn,.quick-chat,.toggle-choice,.quest-button").forEach(el=>el.addEventListener("click",menuClick));

$("#mobileMenu").onclick=()=>{$("#nav").classList.toggle("open");menuClick()};
$$("nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));

function cssConfetti(){
  const layer=$("#confetti");layer.innerHTML="";
  for(let i=0;i<120;i++){
    const p=document.createElement("i");p.className="confetti-piece";
    p.style.left=Math.random()*100+"vw";
    p.style.background=["#00A2FF","#FFB800","#00E676","#FF007F","#FFFFFF"][i%5];
    p.style.setProperty("--x",(Math.random()*260-130)+"px");
    p.style.setProperty("--r",(Math.random()*1100-550)+"deg");
    p.style.animationDelay=Math.random()*.35+"s";layer.appendChild(p);
  }
  setTimeout(()=>layer.innerHTML="",2200);
}
function partyBlast(){
  if(typeof window.confetti==="function"){
    const end=Date.now()+1000,colors=["#00A2FF","#FFB800","#00E676","#FF007F","#FFFFFF"];
    const frame=()=>{
      window.confetti({particleCount:6,angle:60,spread:70,origin:{x:0,y:.65},colors});
      window.confetti({particleCount:6,angle:120,spread:70,origin:{x:1,y:.65},colors});
      if(Date.now()<end)requestAnimationFrame(frame);
    };frame();
  }
  cssConfetti();
}
function updateQuest(){
  const done=(state.talked.size?1:0)+(state.opened.size?1:0)+(state.triviaComplete?1:0)+(state.talked.size>=2?1:0);
  const capped=Math.min(done,4);
  $("#questProgress").style.width=(capped/4*100)+"%";
  $("#questLabel").textContent=`${capped} / 4`;
}
function triggerParty(){
  victorySound();partyBlast();toast("🎉 SERVER JOINED — BIRTHDAY MAYHEM ENABLED!");updateQuest();
}
$("#celebrateBtn").onclick=triggerParty;

for(let i=0;i<32;i++){
  const p=document.createElement("i");p.className="particle";
  p.style.left=Math.random()*100+"%";p.style.top=(42+Math.random()*48)+"%";
  p.style.animationDuration=(2+Math.random()*4)+"s";p.style.animationDelay=Math.random()*4+"s";
  $("#particles").appendChild(p);
}

const dialogues={
  naren:[
    {name:"[GOAT] Naren_Level17",portrait:"🐐",text:"Need help with a quest or advice on a build? I've got your back!"},
    {name:"[GOAT] Naren_Level17",portrait:"🛡️",text:"Keep your head up, help the team, and don't forget to enjoy the moment. That's the real win."},
    {name:"[SYSTEM]",portrait:"✨",text:"GOAT BUFF GRANTED: +100 XP • Big Brother Shield equipped."}
  ],
  chilley:[
    {name:"[CHAOS] Chilley_Level14",portrait:"🌀",text:"EHAHAHA! Welcome to the server! I just blew up the spawn point—"},
    {name:"[CHAOS] Chilley_Level14",portrait:"❤️",text:"—but I love you guys! Wait... was I supposed to NOT explode it?"},
    {name:"[SYSTEM]",portrait:"🎈",text:"CHAOS EVENT TRIGGERED: +100 HYPE • virtual confetti explosion incoming."}
  ]
};
function openDialogue(kind){
  currentDialogue=kind;dialogueStep=0;
  state.talked.add(kind);localStorage.setItem("birthdayTalked",JSON.stringify([...state.talked]));
  renderDialogue();$("#dialogueModal").showModal();updateQuest();
  if(kind==="naren"){successSound();toast("GOAT BUFF activated: +100 XP");}
  else{chaosBurst();oofSound();}
}
function renderDialogue(){
  const item=dialogues[currentDialogue][dialogueStep];
  $("#dialoguePortrait").textContent=item.portrait;$("#dialogueName").textContent=item.name;$("#dialogueText").textContent=item.text;
  $("#dialogueNext").innerHTML=dialogueStep<dialogues[currentDialogue].length-1?'NEXT <i class="fa-solid fa-angle-right"></i>':'CLOSE <i class="fa-solid fa-xmark"></i>';
  $("#dialogueProgress").innerHTML=dialogues[currentDialogue].map((_,i)=>`<span class="${i===dialogueStep?"active":""}"></span>`).join("");
  if(currentDialogue==="chilley"&&dialogueStep===2)partyBlast();
}
function nextDialogue(){
  if(dialogueStep<dialogues[currentDialogue].length-1){dialogueStep++;renderDialogue();menuClick();}
  else{$("#dialogueModal").close();currentDialogue=null;}
}
$$(".avatar-clickable").forEach(card=>{
  const open=()=>openDialogue(card.dataset.dialogue);
  card.addEventListener("click",open);
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
});
$("#dialogueNext").onclick=nextDialogue;
$$("[data-dialogue-close]").forEach(b=>b.onclick=()=>$("#dialogueModal").close());
$("#dialogueModal").addEventListener("click",e=>{if(e.target===$("#dialogueModal"))$("#dialogueModal").close()});

function chaosBurst(){
  const layer=document.createElement("div");layer.className="chaos-burst";
  const icons=["❤️","💖","💗","🌀","✨","🎈","😂","❤️"];
  for(let i=0;i<34;i++){
    const p=document.createElement("span");p.className="heart-particle";p.textContent=icons[i%icons.length];
    p.style.left=(48+Math.random()*4)+"%";p.style.setProperty("--x",(Math.random()*760-380)+"px");
    p.style.setProperty("--y",(Math.random()*620-310)+"px");p.style.setProperty("--r",(Math.random()*720-360)+"deg");
    p.style.animationDelay=(Math.random()*.2)+"s";layer.appendChild(p);
  }
  document.body.appendChild(layer);setTimeout(()=>layer.remove(),1450);
}

$$(".achievement").forEach(btn=>{
  btn.addEventListener("click",()=>{
    oofSound();toast(btn.querySelector("strong")?.textContent+" unlocked!");
    if(typeof window.confetti==="function")window.confetti({particleCount:35,spread:55,origin:{y:.6}});
  });
});

const gifts=[
  ["🐐","Golden Dominus of Brotherhood","+10,000 shared stats for Naren & Chilley.","MYTHIC","Genuine GOAT loot secured."],
  ["🍕","Infinite Pizza Box","Full health restore for the entire party.","LEGENDARY","Emergency pizza protocol activated."],
  ["📸","Memory Snapshot Crate","A custom birthday message and a CSS-built memory gallery—no external images required.","EPIC","Memory Lane unlocked."],
  ["🏆","Bloxy Award for Best Duo","A VIP trophy for the two birthday legends.","MYTHIC","Best Duo award equipped."],
  ["🛡️","Big Brother Aegis","A protective buff inspired by Naren's legendary support stats.","LEGENDARY","Brotherhood shield online."],
  ["🌀","Chaos Mastermind Coil","Predictability drops to 0. Comedy output goes to 100.","LEGENDARY","Wildcard mode enabled."],
  ["❤️","Heart of the Lobby","Pure-good-energy badge for Chilley's affection and warmth.","EPIC","Heart stat maxed."],
  ["🎈","Double Birthday Booster","Party multiplier for the Level 17 + Level 14 double event.","MYTHIC","MAX HYPE multiplier equipped."]
];
const grid=$("#giftGrid");
gifts.forEach((g,i)=>{
  const el=document.createElement("article");el.className="gift";if(state.opened.has(i))el.classList.add("opened");
  el.setAttribute("role","button");el.tabIndex=0;
  el.innerHTML=`<div class="crate">${g[0]}</div><div class="loot-rarity">${g[3]}</div><h3>${g[1]}</h3><small>${state.opened.has(i)?"UNLOCKED":"CLICK TO UNBOX"} • #${String(i+1).padStart(2,"0")}</small>`;
  el.onclick=()=>openGift(el,i);
  el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openGift(el,i)}};
  grid.appendChild(el);
});
function markGiftOpened(el,i){
  state.opened.add(i);localStorage.setItem("openedBirthdayGifts",JSON.stringify([...state.opened]));el.classList.add("opened");
  const small=el.querySelector("small");if(small)small.textContent="UNLOCKED • #"+String(i+1).padStart(2,"0");
  updateQuest();
}
function openGift(el,i){
  if(state.opened.has(i)){showLoot(i);return}
  el.classList.add("opening");beep(180,.1,"sawtooth");
  setTimeout(()=>{
    el.classList.remove("opening");markGiftOpened(el,i);showLoot(i);successSound();
    if(typeof window.confetti==="function")window.confetti({particleCount:55,spread:65,origin:{y:.65}});
  },900);
}
function memoryMiniGallery(){
  return `<div class="memory-gallery">
    <div><b>MEMORY 01</b><span>GOAT MODE</span><small>Naren keeps the squad grounded.</small></div>
    <div><b>MEMORY 02</b><span>CHAOS MODE</span><small>Chilley enters. Server stability leaves.</small></div>
    <div><b>MEMORY 03</b><span>DUO EVENT</span><small>Level 17 + Level 14 = legendary day.</small></div>
  </div>`;
}
function showLoot(i){
  const g=gifts[i];
  const extra=i===2?memoryMiniGallery():`${g[4]}`;
  $("#modalContent").innerHTML=`<div class="loot-icon">${g[0]}</div><h2>${g[1]}</h2><p>${g[2]}<br><br><b>Birthday Server Note:</b> ${extra}</p><div class="loot">★ ${g[3]} DROP • BIRTHDAY LOOT</div>`;
  $("#giftModal").showModal();
}
$$("[data-close]").forEach(b=>b.onclick=()=>$("#giftModal").close());
$("#equipLoot").onclick=()=>{$("#giftModal").close();successSound();addRobux(500);toast("Item equipped — +500 Birthday R$ bonus.");};
$("#giftModal").addEventListener("click",e=>{if(e.target===$("#giftModal"))$("#giftModal").close()});

const questions=[
  {q:"Who is known as the genuine GOAT and ultimate big brother?",a:["Naren","Chilley","The Builderman NPC","A random bacon"],c:0},
  {q:"Who is the chaotic goofball with a heart of pure gold?",a:["Naren","Chilley","The server admin","The pizza"],c:1},
  {q:"What level is Naren unlocking today?",a:["Level 14","Level 16","Level 17","Level 99"],c:2},
  {q:"What level is Chilley unlocking today?",a:["Level 14","Level 15","Level 17","Level 10"],c:0},
  {q:"What is the legendary event being celebrated?",a:["A new obby season","The Level 17 + Level 14 double birthday","A server shutdown","A speedrun tournament"],c:1}
];
const quiz=$("#quiz");
function renderQuiz(){
  if(state.q>=questions.length){
    state.triviaComplete=true;localStorage.setItem("birthdayTriviaComplete","1");updateQuest();
    quiz.innerHTML=`<div class="quiz-result"><div class="loot-icon">🏆</div><h2>SERVER COMPLETE!</h2><p>You scored <b>${state.score}/${questions.length}</b> and earned <b>${state.score*500} Birthday R$</b>.</p><button class="btn primary" id="again"><i class="fa-solid fa-rotate-right"></i> PLAY AGAIN</button></div>`;
    addRobux(state.score*500);victorySound();partyBlast();
    $("#again").onclick=()=>{state.q=0;state.score=0;renderQuiz();menuClick()};
    return;
  }
  const x=questions[state.q];
  quiz.innerHTML=`<div class="quiz-progress"><i style="width:${state.q/questions.length*100}%"></i></div><p class="eyebrow">QUESTION ${state.q+1} / ${questions.length}</p><h3 class="question">${x.q}</h3><div class="answers">${x.a.map((a,i)=>`<button class="answer" data-i="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join("")}</div>`;
  $$(".answer").forEach(b=>b.onclick=()=>answer(+b.dataset.i));
}
function answer(i){
  const x=questions[state.q],bs=$$(".answer");bs.forEach(b=>b.disabled=true);
  if(i===x.c){bs[i].classList.add("correct");state.score++;$("#scoreChip").textContent=`R$ ${(state.score*500).toLocaleString()}`;successSound();toast("+500 Birthday R$ — CORRECT!");}
  else{bs[i].classList.add("wrong");bs[x.c].classList.add("correct");oofSound();toast("Oof! The server reveals the correct answer.");}
  setTimeout(()=>{state.q++;renderQuiz()},850);
}
renderQuiz();

const defaultMessages=[
  {name:"Birthday Bot",avatar:"🤖",text:"Welcome to the Chilley & Naren Birthday Server!"},
  {name:"Naren",avatar:"🐐",text:"Thanks for joining. Keep the squad together and enjoy the party."},
  {name:"Chilley",avatar:"🌀",text:"I DID NOT blow up spawn. Probably. Happy birthday server!!!"}
];
function getMessages(){
  try{const stored=JSON.parse(localStorage.getItem("urbanBirthdayMessages")||"null");return Array.isArray(stored)&&stored.length?stored:defaultMessages}catch{return defaultMessages}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function renderMessages(){
  const data=getMessages();
  $("#chat").innerHTML=data.length?data.slice().reverse().map(m=>`<article class="message"><div class="message-avatar">${m.avatar}</div><div><strong>${escapeHtml(m.name)}</strong><time>${escapeHtml(m.time||"just now")}</time><p>${escapeHtml(m.text)}</p><div class="system">[System]: User ${escapeHtml(m.name)} wished Chilley & Naren a Happy Birthday!</div></div></article>`).join(""):'<div class="chat-empty">No messages yet. Be the first player to send a wish.</div>';
}
renderMessages();

$("#wishForm").onsubmit=e=>{
  e.preventDefault();const name=$("#guestName").value.trim(),text=$("#guestMessage").value.trim();if(!name||!text)return;
  const data=getMessages();data.push({name,avatar:$("#guestAvatar").value,text,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});
  localStorage.setItem("urbanBirthdayMessages",JSON.stringify(data.slice(-50)));renderMessages();e.target.reset();successSound();toast("Wish sent to the server!");$("#guestbook").scrollIntoView({behavior:"smooth"});
};

$$(".quick-chat").forEach(btn=>btn.onclick=()=>{
  $("#guestMessage").value=btn.dataset.quick;$("#guestMessage").focus();menuClick();
});

const testimonialSets={
  naren:[
    "[Global Chat] Player_1: Naren is genuinely the best big brother ever! 🐐",
    "[Global Chat] Player_2: GOAT energy, max kindness, zero fake stats. 🛡️",
    "[Global Chat] Player_3: Naren always has the squad's back. Absolute legend."
  ],
  chilley:[
    "[Global Chat] Player_1: Chilley's chaos and love make this server 100x better! ❤️",
    "[Global Chat] Player_2: Bro turns every normal lobby into a comedy special. 🌀",
    "[Global Chat] Player_3: Pure heart, zero predictability. That's Chilley."
  ]
};
let testimonialTarget="naren",testimonialIndex=0;
function renderTestimonial(){
  const text=testimonialSets[testimonialTarget][testimonialIndex%testimonialSets[testimonialTarget].length];
  const parts=text.split(": ");$("#testimonialOutput").innerHTML=`<span class="chat-preview-tag">${escapeHtml(parts[0]+":")}</span><div class="chat-preview-message">${escapeHtml(parts.slice(1).join(": "))}</div>`;
}
renderTestimonial();
$$(".toggle-choice").forEach(btn=>btn.onclick=()=>{
  $$(".toggle-choice").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
  testimonialTarget=btn.dataset.testimonial;testimonialIndex=0;renderTestimonial();menuClick();
});
$("#randomTestimonial").onclick=()=>{testimonialIndex++;renderTestimonial();successSound()};
$("#sendGenerated").onclick=()=>{
  const text=testimonialSets[testimonialTarget][testimonialIndex%testimonialSets[testimonialTarget].length];
  const data=getMessages();data.push({name:"Global Chat",avatar:testimonialTarget==="naren"?"🐐":"❤️",text,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});
  localStorage.setItem("urbanBirthdayMessages",JSON.stringify(data.slice(-50)));renderMessages();successSound();toast("Generated testimonial sent to the guestbook!");$("#guestbook").scrollIntoView({behavior:"smooth"});
};

$("#resetData").onclick=()=>{
  if(confirm("Reset this browser's birthday data, opened gifts, chat and progress?")){
    ["urbanBirthdayMessages","openedBirthdayGifts","birthdayTalked","birthdayTriviaComplete","birthdayRobux"].forEach(k=>localStorage.removeItem(k));
    state.opened.clear();state.talked.clear();state.triviaComplete=false;state.robux=999999;updateRobux();state.q=0;state.score=0;
    renderMessages();renderQuiz();location.reload();
  }
};

$("#search").addEventListener("keydown",e=>{
  if(e.key!=="Enter")return;
  const q=e.target.value.toLowerCase().trim();if(!q)return;
  const target=q.includes("naren")||q.includes("chilley")?"profiles":q.includes("stat")||q.includes("leader")?"stats":q.includes("gift")||q.includes("loot")||q.includes("invent")?"gifts":q.includes("lore")||q.includes("history")||q.includes("brother")?"lore":q.includes("testimonial")||q.includes("global")?"testimonials":q.includes("trivia")||q.includes("quiz")?"trivia":q.includes("guest")||q.includes("wish")||q.includes("chat")?"guestbook":null;
  if(target)document.getElementById(target).scrollIntoView({behavior:"smooth"});else toast("No player or section found.");e.target.blur();
});

const sections=$$("main section"),links=$$("nav a");
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id));}});
},{rootMargin:"-30% 0px -55% 0px"});
sections.forEach(s=>io.observe(s));

window.addEventListener("pointerover",e=>{
  if(audioUnlocked && e.target.matches("button,a,.avatar-clickable,.gift,.achievement"))beep(275,.025,"triangle",.008);
});
window.addEventListener("keydown",e=>{if(e.key==="Escape"){if($("#giftModal").open)$("#giftModal").close();if($("#dialogueModal").open)$("#dialogueModal").close();}});
updateQuest();


/* =========================================================
   PART 5–6 ADVANCED EXPANSION PACK
   ========================================================= */
(() => {
  const EXP_KEY="birthdayExpansionState";
  const readJSON=(key,fallback)=>{
    try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}
  };
  const writeJSON=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const expansion=readJSON(EXP_KEY,{passes:{},gear:{naren:"none",chilley:"none"},souvenirs:[],memHype:{},obbyComplete:false,obbyRewarded:false,finaleTarget:""});
  const saveExpansion=()=>writeJSON(EXP_KEY,expansion);
  const hasPass=id=>!!expansion.passes[id];
  const $e=s=>document.querySelector(s);

  /* ---------- Boombox / procedural birthday chiptunes ---------- */
  const djTracks=[
    {name:"Birthday Strategy",kind:"ORIGINAL CHiPTUNE",bpm:126,wave:"square",premium:false,notes:[523,659,784,659,587,659,880,659]},
    {name:"Disaster Escape",kind:"ORIGINAL ARCADE LOOP",bpm:138,wave:"sawtooth",premium:false,notes:[392,494,587,440,392,330,440,494]},
    {name:"Lo-Fi Birthday Chill",kind:"ORIGINAL LO-FI LOOP",bpm:78,wave:"triangle",premium:false,notes:[261,330,392,330,293,349,440,349]},
    {name:"GOAT Victory Drive",kind:"VIP ORIGINAL • SERVER DJ ACCESS",bpm:120,wave:"square",premium:true,notes:[659,784,988,784,880,1047,1175,1047]},
    {name:"Chaos Circuit",kind:"VIP ORIGINAL • SERVER DJ ACCESS",bpm:154,wave:"sawtooth",premium:true,notes:[220,330,440,330,247,370,494,370]}
  ];
  const dj={playing:false,index:0,step:0,timer:null,volume:.45};
  const djSelect=$e("#djTrack"),djBox=$e("#boombox"),djNow=$e("#djNowPlaying"),djKind=$e("#djTrackKind"),djPlay=$e("#djPlay");

  function renderDJ(){
    if(!djSelect)return;
    [...djSelect.options].forEach((o,i)=>{
      const locked=djTracks[i].premium&&!hasPass("dj");
      o.disabled=locked;o.textContent=(locked?"🔒 ":"")+djTracks[i].name+(locked?" — VIP":"");
    });
    const t=djTracks[dj.index];
    djSelect.value=String(dj.index);
    djNow.textContent=t.name;
    djKind.textContent=t.kind+(t.premium&&!hasPass("dj")?" • LOCKED":"");
    if(djPlay)djPlay.innerHTML=dj.playing?'<i class="fa-solid fa-pause"></i> PAUSE':'<i class="fa-solid fa-play"></i> PLAY';
  }
  function djNote(){
    if(!dj.playing||state.muted||!audioUnlocked)return;
    const t=djTracks[dj.index];
    if(t.premium&&!hasPass("dj"))return;
    const n=t.notes[dj.step%t.notes.length];
    beep(n,.12,t.wave,.018*dj.volume);
    beep(n/2,.08,"triangle",.009*dj.volume);
    dj.step++;
  }
  function stopDJ(){
    dj.playing=false;clearInterval(dj.timer);dj.timer=null;
    djBox?.classList.remove("playing");renderDJ();
  }
  function startDJ(){
    if(state.muted){toast("Unmute server audio first.");return}
    const t=djTracks[dj.index];
    if(t.premium&&!hasPass("dj")){toast("Server DJ Access is required for VIP tracks.");return}
    unlockAudio();
    if(dj.playing){stopDJ();return}
    dj.playing=true;dj.step=0;djBox?.classList.add("playing");renderDJ();
    djNote();
    dj.timer=setInterval(djNote,Math.max(90,60000/t.bpm));
  }
  $e("#djPlay")?.addEventListener("click",startDJ);
  $e("#djPrev")?.addEventListener("click",()=>{stopDJ();dj.index=(dj.index-1+djTracks.length)%djTracks.length;if(djTracks[dj.index].premium&&!hasPass("dj"))dj.index=2;renderDJ()});
  $e("#djNext")?.addEventListener("click",()=>{stopDJ();let next=(dj.index+1)%djTracks.length;if(djTracks[next].premium&&!hasPass("dj")){toast("VIP track locked — buy Server DJ Access.");next=0}dj.index=next;renderDJ()});
  $e("#djTrack")?.addEventListener("change",e=>{
    const i=Number(e.target.value),t=djTracks[i];
    if(t.premium&&!hasPass("dj")){toast("VIP track locked — buy Server DJ Access.");renderDJ();return}
    stopDJ();dj.index=i;renderDJ();
  });
  $e("#djVolume")?.addEventListener("input",e=>{dj.volume=Number(e.target.value)/100});
  renderDJ();

  /* ---------- Admin Abuse commands wired into the existing /w terminal ---------- */
  function screenShake(){
    document.body.classList.remove("admin-shake");void document.body.offsetWidth;document.body.classList.add("admin-shake");
    setTimeout(()=>document.body.classList.remove("admin-shake"),520);
  }
  function pizzaRain(){
    document.querySelector(".pizza-rain")?.remove();
    const layer=document.createElement("div");layer.className="pizza-rain";
    for(let i=0;i<34;i++){
      const p=document.createElement("span");p.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 10 55 25 20 57Z" fill="#ffc107"/><path d="M8 10 55 25" stroke="#fff4b5" stroke-width="6" stroke-linecap="round"/><circle cx="31" cy="28" r="4" fill="#e53935"/><circle cx="42" cy="33" r="4" fill="#e53935"/><circle cx="25" cy="39" r="4" fill="#e53935"/></svg>';p.style.left=(Math.random()*100)+"vw";
      p.style.animationDelay=(Math.random()*.7)+"s";p.style.fontSize=(22+Math.random()*24)+"px";layer.appendChild(p);
    }
    document.body.appendChild(layer);setTimeout(()=>layer.remove(),4200);
  }
  function adminOof(){
    screenShake();
    for(let i=0;i<5;i++)setTimeout(()=>oofSound(),i*135);
    toast("ADMIN: generated oof barrage deployed.");
  }
  function runAdminCommand(raw){
    const cmd=raw.trim().toLowerCase();
    if(cmd===":fly"){document.body.classList.toggle("admin-float");toast(document.body.classList.contains("admin-float")?":fly ENABLED":":fly DISABLED");return true}
    if(cmd===":oof"){adminOof();return true}
    if(cmd===":godmode"){document.body.classList.toggle("admin-godmode");toast(document.body.classList.contains("admin-godmode")?":godmode ENABLED":":godmode DISABLED");return true}
    if(cmd===":spawn pizza"||cmd===":spawn pizza!"){pizzaRain();successSound();toast(":spawn pizza — PIZZA STORM");return true}
    if(cmd===":bright"){document.body.classList.toggle("admin-bright");toast(document.body.classList.contains("admin-bright")?":bright ENABLED":":bright DISABLED");return true}
    return false;
  }
  const demoCommands=[":fly",":godmode",":bright",":spawn pizza",":oof"];
  $e("#commandDemo")?.addEventListener("click",()=>runAdminCommand(demoCommands[Math.floor(Math.random()*demoCommands.length)]));
  const wishForm=$e("#wishForm");
  if(wishForm&&typeof wishForm.onsubmit==="function"){
    const oldSubmit=wishForm.onsubmit;
    wishForm.onsubmit=function(e){
      const name=($e("#guestName")?.value||"").trim();
      const msg=($e("#guestMessage")?.value||"").trim();
      if(runAdminCommand(msg)){e.preventDefault();return}
      if(name)localStorage.setItem("lastBirthdayDisplayName",name);
      return oldSubmit.call(this,e);
    };
  }

  /* ---------- VIP passes / Birthday R$ shop ---------- */
  const shopItems=[
    {id:"goat",icon:"🛡️",name:"Naren's GOAT Shield Pass",cost:1000,desc:"Adds a shimmering shield aura to your current guestbook username.",action:"shield"},
    {id:"nuke",icon:"☢️",name:"Chilley's Chaos Nuke",cost:2500,desc:"A one-shot screen-wide chaos effect with pizza, shake, confetti and goofy generated sounds.",action:"nuke"},
    {id:"dj",icon:"📻",name:"Server DJ Access",cost:5000,desc:"Unlocks both VIP original tracks inside the Birthday Boombox.",action:"dj"},
    {id:"rainbow",icon:"🌈",name:"Rainbow VIP Tag",cost:10000,desc:"Animates your guestbook display name with a live RGB color cycle.",action:"rainbow"}
  ];
  const shopGrid=$e("#shopGrid"),shopBalance=$e("#shopBalance");
  function syncShopBalance(){
    if(shopBalance)shopBalance.textContent="R$ "+state.robux.toLocaleString();
  }
  function chaosNuke(){
    screenShake();pizzaRain();partyBlast();adminOof();
    const layer=document.createElement("div");layer.className="bloxy-burst";document.body.appendChild(layer);setTimeout(()=>layer.remove(),800);
    toast("CHILLEY'S CHAOS NUKE detonated!");
  }
  function buyPass(id){
    const item=shopItems.find(x=>x.id===id);if(!item)return;
    if(hasPass(id)){toast(item.name+" already unlocked.");if(item.action==="nuke")chaosNuke();return}
    if(state.robux<item.cost){toast("Not enough Birthday R$ for "+item.name+".");return}
    state.robux-=item.cost;updateRobux();expansion.passes[id]=true;saveExpansion();renderShop();syncShopBalance();
    successSound();
    if(item.action==="nuke")chaosNuke();
    else toast(item.name+" unlocked!");
    if(id==="dj")renderDJ();
    refreshGuestVIPDecor();
  }
  function renderShop(){
    if(!shopGrid)return;
    shopGrid.innerHTML=shopItems.map(item=>{
      const owned=hasPass(item.id);
      return '<article class="shop-card '+(owned?"owned":"")+'"><div class="shop-icon">'+item.icon+'</div><h3>'+item.name+'</h3><p>'+item.desc+'</p><div class="shop-cost">'+(owned?"OWNED":"R$ "+item.cost.toLocaleString())+'</div><button class="btn '+(owned?"secondary":"primary")+'" data-buy-pass="'+item.id+'">'+(owned?"UNLOCKED":"BUY PASS")+'</button></article>';
    }).join("");
    $$("[data-buy-pass]").forEach(b=>b.addEventListener("click",()=>buyPass(b.dataset.buyPass)));
  }
  renderShop();syncShopBalance();

  /* ---------- Guestbook VIP decoration ---------- */
  function refreshGuestVIPDecor(){
    const current=(localStorage.getItem("lastBirthdayDisplayName")||"").trim();
    if(!current)return;
    $$("#chat .message").forEach(m=>{
      const strong=m.querySelector("strong");if(!strong||strong.textContent!==current)return;
      strong.classList.toggle("goat-shield-name",hasPass("goat"));
      strong.classList.toggle("rainbow-vip-name",hasPass("rainbow"));
    });
  }
  const chatEl=$e("#chat");
  if(chatEl){new MutationObserver(refreshGuestVIPDecor).observe(chatEl,{childList:true,subtree:true});setTimeout(refreshGuestVIPDecor,20)}

  /* ---------- Bloxy Awards ---------- */
  function presentAward(which){
    const stage=$e("#podiumStage");stage?.classList.add("spotlight-on");
    const burst=document.createElement("div");burst.className="bloxy-burst";document.body.appendChild(burst);
    const seq=which==="naren"?[523,659,784,1047]:[392,494,659,988];
    seq.forEach((n,i)=>setTimeout(()=>beep(n,.09,"triangle",.022),i*90));
    if(typeof window.confetti==="function")window.confetti({particleCount:100,spread:95,origin:{x:.5,y:.25}});
    cssConfetti();toast((which==="naren"?"Naren's Golden Bloxy Trophy":"Chilley's Chaos Bloxy Trophy")+" awarded!");
    setTimeout(()=>{burst.remove();stage?.classList.remove("spotlight-on")},1150);
  }
  $$("[data-award]").forEach(card=>{
    const action=()=>presentAward(card.dataset.award);
    card.querySelector(".trophy")?.addEventListener("click",action);
    card.querySelector(".trophy")?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action()}});
    card.querySelector(".award-trigger")?.addEventListener("click",action);
  });

  /* ---------- Avatar Gear Locker ---------- */
  const gearNames=["none","fedora","dominus","valkyrie","party"];
  let lockerTarget="naren";
  function applyGear(target,gear){
    const avatar=$e(".avatar."+target);if(!avatar)return;
    gearNames.forEach(g=>avatar.classList.remove("gear-"+g));
    avatar.classList.add("gear-"+gear);
    expansion.gear[target]=gear;saveExpansion();
  }
  function updateGearButtons(){
    $$(".locker-target").forEach(b=>b.classList.toggle("active",b.dataset.target===lockerTarget));
    $$(".gear-item").forEach(b=>b.classList.toggle("active",b.dataset.gear===expansion.gear[lockerTarget]));
  }
  $$(".locker-target").forEach(b=>b.addEventListener("click",()=>{lockerTarget=b.dataset.target;updateGearButtons()}));
  $$(".gear-item").forEach(b=>b.addEventListener("click",()=>{applyGear(lockerTarget,b.dataset.gear);updateGearButtons();successSound();toast(b.querySelector("b").textContent+" equipped on "+lockerTarget.toUpperCase())}));
  applyGear("naren",expansion.gear.naren||"none");applyGear("chilley",expansion.gear.chilley||"none");updateGearButtons();

  /* ---------- Birthday Obby canvas ---------- */
  const canvas=$e("#obbyCanvas"),ctx=canvas?.getContext("2d");
  const obby={
    running:false,level:1,stars:0,complete:!!expansion.obbyComplete,keys:{left:false,right:false,jump:false},
    player:{x:60,y:280,w:24,h:28,vx:0,vy:0,onGround:false},
    pizzas:[],last:0
  };
  function obbyResetPlayer(){obby.player={x:60,y:280,w:24,h:28,vx:0,vy:0,onGround:false};}
  function obbyStart(){if(!canvas)return;obby.running=true;obby.level=1;obby.stars=0;obby.pizzas=[];obbyResetPlayer();setObbyText("Level 1 — Spawn Area: jump over red lava bricks.");requestAnimationFrame(obbyLoop)}
  function nextObbyLevel(){
    if(obby.level<3){obby.level++;obby.pizzas=[];obbyResetPlayer();setObbyText(obby.level===2?"Level 2 — Chilley's Chaos Zone: dodge falling pizza.":"Level 3 — Naren's Shield Stage: reach the 17th Level Star.");}
    else{
      obby.running=false;obby.complete=true;expansion.obbyComplete=true;if(!expansion.obbyRewarded){expansion.obbyRewarded=true;saveExpansion();addRobux(5000)}else{saveExpansion();}
      $e("#obbyStatus").textContent="OBBY MASTER • R$ +5,000";
      $e("#obbyStars").textContent="1";
      setObbyText("OBBY COMPLETE — Obby Master Badge unlocked. +5,000 Birthday R$.");
      victorySound();partyBlast();toast("Obby Master Badge unlocked!");
    }
  }
  function setObbyText(text){if($e("#obbyCaption"))$e("#obbyCaption").textContent=text;if($e("#obbyLevelLabel"))$e("#obbyLevelLabel").textContent=obby.level+" / 3";if($e("#obbyStars"))$e("#obbyStars").textContent=obby.stars}
  function obbyPlatforms(){
    const ground={x:0,y:328,w:960,h:32,type:"ground"},arr=[ground];
    if(obby.level===1)return arr.concat([{x:165,y:300,w:95,h:28,type:"lava"},{x:420,y:300,w:110,h:28,type:"lava"},{x:690,y:300,w:92,h:28,type:"lava"},{x:875,y:265,w:55,h:63,type:"goal"}]);
    if(obby.level===2)return arr.concat([{x:270,y:280,w:120,h:18,type:"platform"},{x:560,y:235,w:120,h:18,type:"platform"},{x:825,y:180,w:95,h:18,type:"goal"}]);
    return arr.concat([{x:335,y:250,w:210,h:18,type:"shield"},{x:780,y:210,w:120,h:18,type:"goal"}]);
  }
  function spawnPizza(){
    obby.pizzas.push({x:40+Math.random()*850,y:-30-Math.random()*140,r:12+Math.random()*8,vy:95+Math.random()*95,rot:Math.random()*6});
  }
  function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
  function obbyUpdate(dt){
    const p=obby.player,k=obby.keys;
    p.vx+=(k.right?0.85:0)+(k.left?-0.85:0);p.vx*=0.83;p.vx=Math.max(-4.2,Math.min(4.2,p.vx));
    if(k.jump&&p.onGround){p.vy=-9.8;p.onGround=false}
    k.jump=false;p.vy+=.45;p.y+=p.vy;p.x+=p.vx;p.x=Math.max(0,Math.min(930,p.x));p.onGround=false;
    for(const b of obbyPlatforms()){if(collide(p,b)&&p.vy>=0&&p.y+p.h-b.y<18){p.y=b.y-p.h;p.vy=0;p.onGround=true}}
    if(p.y>390){obbyResetPlayer();return}
    if(obby.level===1&&obbyPlatforms().some(b=>b.type==="lava"&&collide(p,b))){oofSound();obbyResetPlayer()}
    if(obby.level===2){
      if(Math.random()<dt*0.0017)spawnPizza();
      for(const z of obby.pizzas){z.y+=z.vy*dt/1000;z.rot+=dt*.006;if(z.y>390)z.dead=true;const hit={x:z.x-z.r,y:z.y-z.r,w:z.r*2,h:z.r*2};if(collide(p,hit)){oofSound();obbyResetPlayer();z.dead=true}}
      obby.pizzas=obby.pizzas.filter(z=>!z.dead);
    }
    if(obby.level===3&&p.x>770&&p.y<240&&p.x<930){obby.stars=1}
    const atGoal=p.x>890&&(obby.level!==3||obby.stars===1);
    if(atGoal)nextObbyLevel();
  }
  function drawStar(c,x,y,r1,r2){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?r2:r1;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}c.closePath();c.fill()}
  function obbyDraw(){
    if(!ctx)return;
    const g=ctx.createLinearGradient(0,0,0,360);g.addColorStop(0,"#0c1722");g.addColorStop(1,"#111518");ctx.fillStyle=g;ctx.fillRect(0,0,960,360);
    ctx.fillStyle="rgba(0,162,255,.1)";for(let x=0;x<960;x+=48){ctx.fillRect(x,0,1,360)}for(let y=0;y<360;y+=48){ctx.fillRect(0,y,960,1)}
    const blocks=obbyPlatforms();
    blocks.forEach(b=>{
      if(b.type==="lava"){ctx.fillStyle="#ff1744";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle="#ff8a9c";ctx.fillRect(b.x,b.y,b.w,5)}
      else if(b.type==="shield"){ctx.fillStyle="#ffd76a";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle="#fff4b5";ctx.fillRect(b.x,b.y,b.w,4);ctx.font="bold 12px sans-serif";ctx.fillStyle="#2b220a";ctx.fillText("NAREN'S SHIELD",b.x+42,b.y+13)}
      else if(b.type==="goal"){ctx.fillStyle="#23292e";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle="#00e676";ctx.fillRect(b.x,b.y,6,b.h);ctx.fillStyle="#fff";ctx.font="bold 11px sans-serif";ctx.fillText("EXIT",b.x+15,b.y+28)}
      else{ctx.fillStyle="#2a343a";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle="#45545b";ctx.fillRect(b.x,b.y,b.w,4)}
    });
    obby.pizzas.forEach(z=>{ctx.save();ctx.translate(z.x,z.y);ctx.rotate(z.rot);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(z.r*2.2,z.r*2.4);ctx.lineTo(z.r*-.7,z.r*1.8);ctx.closePath();ctx.fillStyle="#ffc107";ctx.fill();ctx.fillStyle="#e53935";ctx.beginPath();ctx.arc(z.r*.6,z.r*1.3,3,0,Math.PI*2);ctx.fill();ctx.restore()});
    if(obby.level===3&&obby.stars===0){ctx.fillStyle="#ffd76a";drawStar(ctx,840,135,22,9);ctx.fillStyle="#111";ctx.font="bold 10px sans-serif";ctx.fillText("LVL 17",821,167)}
    const p=obby.player;ctx.fillStyle="#00a2ff";ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle="#fff";ctx.fillRect(p.x+5,p.y+7,4,4);ctx.fillRect(p.x+15,p.y+7,4,4);ctx.fillStyle="#191b1d";ctx.fillRect(p.x+6,p.y+20,13,3);
  }
  function obbyLoop(ts){
    if(!obby.running){obbyDraw();return}
    const dt=Math.min(34,ts-obby.last||16);obby.last=ts;obbyUpdate(dt);obbyDraw();requestAnimationFrame(obbyLoop)
  }
  $e("#obbyStart")?.addEventListener("click",()=>{unlockAudio();obbyStart()});
  window.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")obby.keys.left=true;
    if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")obby.keys.right=true;
    if(e.key==="ArrowUp"||e.key===" "||e.key.toLowerCase()==="w"){obby.keys.jump=true;if(e.key===" ")e.preventDefault()}
  });
  window.addEventListener("keyup",e=>{
    if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")obby.keys.left=false;
    if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")obby.keys.right=false;
  });
  $$(".obby-touch-controls button").forEach(b=>{
    const key=b.dataset.obby;
    b.addEventListener("pointerdown",e=>{e.preventDefault();if(key==="jump"){obby.keys.jump=true}else{obby.keys[key]=true}});
    b.addEventListener("pointerup",()=>{if(key!=="jump")obby.keys[key]=false});
    b.addEventListener("pointerleave",()=>{if(key!=="jump")obby.keys[key]=false});
  });
  obbyDraw();
  if(obby.complete){$e("#obbyStatus").textContent="OBBY MASTER • UNLOCKED";setObbyText("Obby Master Badge already unlocked on this browser.");}

  /* ---------- Memory Vault ---------- */
  const memories=[
    {title:"GOAT MODE",icon:"🐐",tag:"NAREN • LVL 17",note:"The kind of teammate who turns a rough lobby into a safe place. Big Brother Aegis equipped.",tone:0},
    {title:"CHAOS MODE",icon:"🌀",tag:"CHILLEY • LVL 14",note:"The server survived approximately four seconds before the jokes, pizza and chaos started.",tone:1},
    {title:"DUO QUEUE",icon:"🎮",tag:"BROTHERHOOD ARCHIVE",note:"Two different playstyles, one permanent party. The duo event is the lore.",tone:2},
    {title:"PIZZA PROTOCOL",icon:"🍕",tag:"SECRET MEMORY",note:"Emergency pizza was deployed. No one knows who ordered it. Everyone was happy.",tone:3},
    {title:"BLOXY NIGHT",icon:"🏆",tag:"AWARDS ARCHIVE",note:"Golden trophies, bright spotlights and the two birthday legends taking the stage.",tone:4},
    {title:"MAX HYPE",icon:"❤️",tag:"SERVER SNAPSHOT",note:"The best memories are the little moments: laughs, support, ridiculous jokes and showing up.",tone:5}
  ];
  const memoryGrid=$e("#memoryGrid");
  const memHype=expansion.memHype||{};
  function memorySound(i){
    const base=220+(i*55);[base,base*1.25,base*1.5].forEach((n,j)=>setTimeout(()=>beep(n,.08,"triangle",.018),j*75));
  }
  function hypeMemory(i){
    memHype[i]=(Number(memHype[i]||0)+1);expansion.memHype=memHype;saveExpansion();
    renderMemories();successSound();toast("Memory "+(i+1)+" hyped! ❤️");
  }
  function renderMemories(){
    if(!memoryGrid)return;
    memoryGrid.innerHTML=memories.map((m,i)=>'<article class="memory-card" data-memory="'+i+'"><div class="memory-inner"><div class="memory-face memory-front"><div class="memory-photo"><span>'+m.icon+'</span></div><h3>'+m.title+'</h3><small>'+m.tag+'</small></div><div class="memory-face memory-back"><div><span class="eyebrow">SNAPSHOT NOTE</span><p class="note">'+m.note+'</p></div><div><button class="audio-stamp" data-stamp="'+i+'"><i class="fa-solid fa-volume-high"></i> PLAY MEMORY AUDIO</button><div class="hype-row"><button class="hype-btn" data-hype="'+i+'">❤️ HYPE</button><span class="hype-count">'+Number(memHype[i]||0)+'</span></div></div></div></div></article>').join("");
    $$(".memory-card").forEach(card=>card.addEventListener("click",()=>card.classList.toggle("flipped")));
    $$("[data-hype]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();hypeMemory(Number(b.dataset.hype))}));
    $$("[data-stamp]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();unlockAudio();memorySound(Number(b.dataset.stamp));toast("Memory audio stamp played.")}));
  }
  renderMemories();

  /* ---------- Fireworks Grand Finale ---------- */
  const fwCanvas=$e("#fireworksCanvas"),fw=fwCanvas?.getContext("2d");let fwParticles=[],fwRunning=false,fwTimer=null;
  function fitFW(){if(!fwCanvas)return;fwCanvas.width=innerWidth*devicePixelRatio;fwCanvas.height=innerHeight*devicePixelRatio;fwCanvas.style.width=innerWidth+"px";fwCanvas.style.height=innerHeight+"px";fw?.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
  addEventListener("resize",fitFW);fitFW();
  function heartPath(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.3);c.bezierCurveTo(x-s*1.2,y-s*.45,x-s*.9,y-s*1.2,x,y-s*.45);c.bezierCurveTo(x+s*.9,y-s*1.2,x+s*1.2,y-s*.45,x,y+s*.3);c.closePath()}
  function burst(x,y,type){
    const count=type==="heart"?34:46;
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=1.1+Math.random()*3.6;fwParticles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,size:2+Math.random()*4,type:type,hue:Math.floor(Math.random()*360)})}
  }
  function finaleFanfare(){[523,659,784,1047,1319].forEach((n,i)=>setTimeout(()=>beep(n,.12,i%2?"triangle":"square",.026),i*85))}
  function igniteFinale(){
    if(!fwCanvas||fwRunning)return;
    unlockAudio();fwRunning=true;fwCanvas.classList.add("active");fwParticles=[];
    const start=performance.now();
    let nextBurst=0;
    function frame(t){
      if(!fwRunning)return;
      const w=innerWidth,h=innerHeight;fw.clearRect(0,0,w,h);fw.fillStyle="rgba(10,12,14,.19)";fw.fillRect(0,0,w,h);
      if(t-start>nextBurst){burst(w*(.15+Math.random()*.7),h*(.18+Math.random()*.45),["stud","robux","heart"][Math.floor(Math.random()*3)]);nextBurst+=320}
      fwParticles=fwParticles.filter(p=>p.life>0);
      fwParticles.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.vy+=.035;p.life-=.012;
        fw.save();fw.globalAlpha=Math.max(0,p.life);fw.fillStyle="hsl("+p.hue+" 100% 65%)";
        if(p.type==="heart"){heartPath(fw,p.x,p.y,p.size*2);fw.fill()}
        else if(p.type==="robux"){fw.fillRect(p.x,p.y,p.size*1.6,p.size*1.1);fw.fillStyle="#0b1";fw.font="bold "+Math.max(5,p.size*1.6)+"px sans-serif";fw.fillText("R$",p.x-1,p.y+p.size)}
        else{fw.fillRect(p.x,p.y,p.size*1.4,p.size*1.4)}
        fw.restore();
      });
      if(t-start<9000)requestAnimationFrame(frame);else{fwRunning=false;fwCanvas.classList.remove("active");fw.clearRect(0,0,w,h)}
    }
    finaleFanfare();requestAnimationFrame(frame);toast("THE GRAND FINALE HAS BEGUN!");
  }
  function localDateTimeValue(date){const p=n=>String(n).padStart(2,"0");return date.getFullYear()+"-"+p(date.getMonth()+1)+"-"+p(date.getDate())+"T"+p(date.getHours())+":"+p(date.getMinutes())}
  const finaleInput=$e("#finaleDate"),countdown=$e("#countdown");
  if(finaleInput){
    let target=expansion.finaleTarget?new Date(expansion.finaleTarget):null;
    if(!target||Number.isNaN(target.getTime())||target.getTime()<=Date.now()){target=new Date();target.setHours(24,0,0,0);expansion.finaleTarget=target.toISOString();saveExpansion()}
    finaleInput.value=localDateTimeValue(target);
    function updateCountdown(){
      const d=new Date(finaleInput.value).getTime()-Date.now();
      if(d<=0){countdown.textContent="00:00:00:00";if(!fwRunning&&!expansion.finalFired){expansion.finalFired=true;saveExpansion();igniteFinale()}return}
      const days=Math.floor(d/86400000),hours=Math.floor(d%86400000/3600000),mins=Math.floor(d%3600000/60000),secs=Math.floor(d%60000/1000);
      countdown.textContent=String(days).padStart(2,"0")+":"+String(hours).padStart(2,"0")+":"+String(mins).padStart(2,"0")+":"+String(secs).padStart(2,"0");
    }
    setInterval(updateCountdown,1000);updateCountdown();
    $e("#saveFinaleDate")?.addEventListener("click",()=>{
      const dt=new Date(finaleInput.value);if(Number.isNaN(dt.getTime())||dt.getTime()<=Date.now()){toast("Choose a future birthday moment.");return}
      expansion.finaleTarget=dt.toISOString();expansion.finalFired=false;saveExpansion();toast("Birthday finale countdown saved.");
    });
    $e("#igniteFinale")?.addEventListener("click",igniteFinale);
  }

  /* ---------- Trading Plaza ---------- */
  const tradeRewards={
    naren:["Naren's Certified GOAT Seal 🐐","Genuine brotherhood souvenir"],
    chilley:["Chilley's Goofy Stamp 🌀","Certified chaos souvenir"]
  };
  const tradeModal=$e("#tradeModal"),offerSelect=$e("#tradeOffer"),partnerSelect=$e("#tradePartner"),offerPreview=$e("#tradeOfferPreview"),receivePreview=$e("#tradeReceivePreview");
  function renderSouvenirs(){
    const list=$e("#souvenirList");if(!list)return;
    const items=expansion.souvenirs||[];
    list.innerHTML=items.length?items.slice().reverse().map(s=>'<div class="souvenir"><span>'+s.icon+'</span><div><b>'+s.name+'</b><small>'+s.time+'</small></div></div>').join(""):'<div class="souvenir-empty">No souvenirs yet. Open a trade to collect one.</div>';
  }
  function openTrade(){
    const partner=partnerSelect.value,rew=tradeRewards[partner];
    offerPreview.textContent=offerSelect.value;receivePreview.textContent=rew[0];$e("#tradeTitle").textContent=(partner==="naren"?"NAREN":"CHILLEY")+" TRADE CONFIRMATION";
    tradeModal?.showModal();
  }
  function acceptTrade(){
    const partner=partnerSelect.value,rew=tradeRewards[partner],item={name:rew[0],icon:partner==="naren"?"🐐":"🌀",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};
    expansion.souvenirs=Array.isArray(expansion.souvenirs)?expansion.souvenirs:[];expansion.souvenirs.push(item);expansion.souvenirs=expansion.souvenirs.slice(-30);saveExpansion();
    tradeModal?.close();renderSouvenirs();victorySound();partyBlast();toast("Trade accepted — souvenir badge saved to local inventory.");
  }
  $e("#openTrade")?.addEventListener("click",openTrade);$e("#closeTrade")?.addEventListener("click",()=>tradeModal?.close());$e("#acceptTrade")?.addEventListener("click",acceptTrade);
  renderSouvenirs();

  /* ---------- Economy / reset integration ---------- */
  const reset=$e("#resetData");
  if(reset){
    reset.onclick=function(){
      if(!confirm("Reset all birthday data, including expansion passes, memories, obby badge and souvenirs?"))return;
      ["urbanBirthdayMessages","openedBirthdayGifts","birthdayTalked","birthdayTriviaComplete","birthdayRobux","birthdayExpansionState","lastBirthdayDisplayName"].forEach(k=>localStorage.removeItem(k));
      location.reload();
    };
  }

  /* ---------- Search support for expansion sections ---------- */
  const search=$e("#search");
  search?.addEventListener("keydown",e=>{
    if(e.key!=="Enter")return;
    const q=search.value.toLowerCase().trim();
    const terms=[
      ["boombox","vibe-zone"],["dj","vibe-zone"],["obby","birthday-obby"],["mini-game","birthday-obby"],
      ["bloxy","bloxy-awards"],["award","bloxy-awards"],["locker","locker"],["gear","locker"],
      ["shop","vip-shop"],["gamepass","vip-shop"],["memory","memory-vault"],["vault","memory-vault"],
      ["firework","finale"],["finale","finale"],["trade","trading-plaza"],["souvenir","trading-plaza"],["admin","vibe-zone"]
    ];
    const found=terms.find(x=>q.includes(x[0]));if(found){e.stopPropagation();document.getElementById(found[1])?.scrollIntoView({behavior:"smooth"});}
  });

  /* ---------- Persisted expansion status chip ---------- */
  if(hasPass("rainbow")||hasPass("goat"))refreshGuestVIPDecor();
})();

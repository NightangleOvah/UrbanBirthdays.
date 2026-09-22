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
let currentDialogue=null;
let dialogueStep=0;

function beep(freq=520,duration=.06,type="square",gain=.028){
  if(state.muted)return;
  try{
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

$("#soundToggle").onclick=()=>{
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
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#039;"}[c]))}
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
  if(e.target.matches("button,a,.avatar-clickable,.gift,.achievement"))beep(275,.025,"triangle",.008);
});
window.addEventListener("keydown",e=>{if(e.key==="Escape"){if($("#giftModal").open)$("#giftModal").close();if($("#dialogueModal").open)$("#dialogueModal").close();}});
updateQuest();

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

const state={
  muted:localStorage.getItem("birthdayMuted")==="1",
  score:0,
  q:0,
  opened:new Set(JSON.parse(localStorage.getItem("openedBirthdayGifts")||"[]"))
};

let audioCtx;

function beep(freq=520,duration=.06,type="square",gain=.028){
  if(state.muted)return;
  try{
    audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended")audioCtx.resume();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(gain,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
    o.connect(g).connect(audioCtx.destination);
    o.start();o.stop(audioCtx.currentTime+duration);
  }catch{}
}

function successSound(){
  beep(620,.08,"square");
  setTimeout(()=>beep(820,.12,"square"),90);
}

function toast(message){
  const el=$("#toast");
  el.textContent=message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>el.classList.remove("show"),2300);
}

function updateSoundButton(){
  $("#soundToggle").innerHTML=state.muted
    ? '<i class="fa-solid fa-volume-xmark"></i>'
    : '<i class="fa-solid fa-volume-high"></i>';
  $("#soundToggle").setAttribute("aria-label",state.muted?"Unmute sounds":"Mute sounds");
}
updateSoundButton();

$("#soundToggle").onclick=()=>{
  state.muted=!state.muted;
  localStorage.setItem("birthdayMuted",state.muted?"1":"0");
  updateSoundButton();
  if(!state.muted)successSound();
};

$$(".btn,.topbar nav a,.gift,.answer,.badges button,.quest-button").forEach(el=>{
  el.addEventListener("click",()=>beep(440,.035));
});

$("#mobileMenu").onclick=()=>{
  $("#nav").classList.toggle("open");
  beep(360,.04);
};

$$("nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));

function cssConfetti(){
  const layer=$("#confetti");
  layer.innerHTML="";
  for(let i=0;i<120;i++){
    const p=document.createElement("i");
    p.className="confetti-piece";
    p.style.left=Math.random()*100+"vw";
    p.style.background=["#00a2ff","#ffb800","#00e676","#ff4d6d","#ffffff"][i%5];
    p.style.setProperty("--x",(Math.random()*260-130)+"px");
    p.style.setProperty("--r",(Math.random()*1100-550)+"deg");
    p.style.animationDelay=Math.random()*.35+"s";
    layer.appendChild(p);
  }
  setTimeout(()=>layer.innerHTML="",2200);
}

function partyBlast(){
  if(typeof window.confetti==="function"){
    const end=Date.now()+1200;
    const colors=["#00A2FF","#FFB800","#00E676","#ffffff","#ff4d6d"];
    const frame=()=>{
      window.confetti({
        particleCount:6,
        angle:60,
        spread:70,
        origin:{x:0,y:.65},
        colors
      });
      window.confetti({
        particleCount:6,
        angle:120,
        spread:70,
        origin:{x:1,y:.65},
        colors
      });
      if(Date.now()<end)requestAnimationFrame(frame);
    };
    frame();
  }
  cssConfetti();
}

function triggerParty(){
  successSound();
  partyBlast();
  toast("🎉 PARTY MODE ACTIVATED — HAPPY BIRTHDAY!");
}
$("#celebrateBtn").onclick=triggerParty;

for(let i=0;i<30;i++){
  const p=document.createElement("i");
  p.className="particle";
  p.style.left=Math.random()*100+"%";
  p.style.top=(45+Math.random()*45)+"%";
  p.style.animationDuration=(2+Math.random()*4)+"s";
  p.style.animationDelay=Math.random()*4+"s";
  $("#particles").appendChild(p);
}

const gifts=[
  ["👑","Golden Dominus Crate","Golden Birthday Crown","Ultra-rare birthday drip. Reserved for the two VIPs.","MYTHIC"],
  ["🍕","Infinite Pizza Crate","Infinite Pizza Slice","Restores 100% hunger during intense gaming sessions.","LEGENDARY"],
  ["⚡","Speed Coil Crate","Birthday Speed Coil","+50 WalkSpeed for the entire birthday weekend.","RARE"],
  ["👻","Rainbow Pet Crate","Rainbow Blob Pet","Follows Chilley & Naren through every party server.","EPIC"],
  ["📻","Hype Boombox","Boombox of Hype","Plays the birthday soundtrack whenever the lobby gets quiet.","LEGENDARY"],
  ["💰","Robux Vault","1,000,000 Birthday R$ Card","Completely fictional birthday currency. The hype is real.","MYTHIC"],
  ["🏆","OG Badge Crate","Best Friend Champion Badge","Achievement unlocked: survived another year of chaos.","EPIC"],
  ["🚀","Rocket Crate","Unlimited Party Boost","Launch the celebration into the next dimension.","LEGENDARY"]
];

const grid=$("#giftGrid");
gifts.forEach((g,i)=>{
  const el=document.createElement("article");
  el.className="gift";
  if(state.opened.has(i))el.classList.add("opened");
  el.setAttribute("role","button");
  el.setAttribute("tabindex","0");
  el.innerHTML=`<div class="crate">${g[0]}</div><div class="loot-rarity">${g[4]}</div><h3>${g[1]}</h3><small>${state.opened.has(i)?"UNLOCKED":"CLICK TO UNBOX"} • #${String(i+1).padStart(2,"0")}</small>`;
  el.onclick=()=>openGift(el,i);
  el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openGift(el,i)}};
  grid.appendChild(el);
});

function markGiftOpened(el,i){
  state.opened.add(i);
  localStorage.setItem("openedBirthdayGifts",JSON.stringify([...state.opened]));
  el.classList.add("opened");
  const small=el.querySelector("small");
  if(small)small.textContent="UNLOCKED • #"+String(i+1).padStart(2,"0");
}

function openGift(el,i){
  if(state.opened.has(i)){
    showLoot(i);
    return;
  }
  el.classList.add("opening");
  beep(180,.1,"sawtooth");
  setTimeout(()=>{
    el.classList.remove("opening");
    markGiftOpened(el,i);
    showLoot(i);
    successSound();
    if(typeof window.confetti==="function")window.confetti({particleCount:55,spread:65,origin:{y:.65}});
  },900);
}

function showLoot(i){
  const g=gifts[i];
  $("#modalContent").innerHTML=`
    <div class="loot-icon">${g[0]}</div>
    <h2>${g[2]}</h2>
    <p>${g[3]}<br><br><b>Birthday Server Message:</b> Chilley & Naren, keep making memories and never let the server shut down.</p>
    <div class="loot">★ ${g[4]} DROP • BIRTHDAY LOOT</div>`;
  $("#giftModal").showModal();
}
$$("[data-close]").forEach(b=>b.onclick=()=>$("#giftModal").close());
$("#equipLoot").onclick=()=>{$("#giftModal").close();successSound();toast("Item equipped — birthday stats increased.");};
$("#giftModal").addEventListener("click",e=>{
  if(e.target===$("#giftModal"))$("#giftModal").close();
});

const questions=[
  {q:"Which duo is today's birthday VIP team?",a:["Chilley & Naren","Builderman & Bacon","Noob & Guest","The Admins"],c:0},
  {q:"What is today's main server objective?",a:["Win an obby","Celebrate the birthdays","Farm random badges","Delete the server"],c:1},
  {q:"Which game is listed for Chilley's favourite games?",a:["Bloxburg","Tetris","Chess","Flight Sim"],c:0},
  {q:"What is Naren's server title?",a:["Master Builder","Pro Gamer","NPC","Quest Giver"],c:1},
  {q:"What happens when you hit JOIN SERVER?",a:["Nothing","The server closes","Confetti party mode","It deletes your inventory"],c:2}
];

const quiz=$("#quiz");

function renderQuiz(){
  if(state.q>=questions.length){
    quiz.innerHTML=`
      <div class="quiz-result">
        <div class="loot-icon">🏆</div>
        <h2>SERVER COMPLETE!</h2>
        <p>You scored <b>${state.score}/${questions.length}</b> and earned <b>${state.score*200} Birthday R$</b>.</p>
        <button class="btn primary" id="again"><i class="fa-solid fa-rotate-right"></i> PLAY AGAIN</button>
      </div>`;
    $("#again").onclick=()=>{
      state.q=0;
      state.score=0;
      $("#scoreChip").textContent="R$ 0";
      renderQuiz();
      beep(520,.06);
    };
    partyBlast();
    return;
  }

  const x=questions[state.q];
  quiz.innerHTML=`
    <div class="quiz-progress"><i style="width:${state.q/questions.length*100}%"></i></div>
    <p class="eyebrow">QUESTION ${state.q+1} / ${questions.length}</p>
    <h3 class="question">${x.q}</h3>
    <div class="answers">${x.a.map((a,i)=>`<button class="answer" data-i="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join("")}</div>`;
  $$(".answer").forEach(b=>b.onclick=()=>answer(+b.dataset.i));
}

function answer(i){
  const x=questions[state.q],bs=$$(".answer");
  bs.forEach(b=>b.disabled=true);
  if(i===x.c){
    bs[i].classList.add("correct");
    state.score++;
    $("#scoreChip").textContent=`R$ ${state.score*200}`;
    successSound();
    toast("+200 Birthday R$ — CORRECT!");
  }else{
    bs[i].classList.add("wrong");
    bs[x.c].classList.add("correct");
    beep(180,.12,"sawtooth");
    toast("Not quite — the server reveals the answer.");
  }
  setTimeout(()=>{state.q++;renderQuiz()},850);
}
renderQuiz();

const defaultMessages=[
  {name:"Birthday Bot",avatar:"🤖",text:"Welcome to the birthday server! Chilley & Naren have entered the lobby."},
  {name:"Bestie",avatar:"😎",text:"happy birthday legends. today we are NOT touching the logout button."},
  {name:"Party Host",avatar:"👑",text:"server objective: celebrate, eat cake, and create maximum chaos."}
];

function getMessages(){
  try{
    const stored=JSON.parse(localStorage.getItem("urbanBirthdayMessages")||"null");
    return Array.isArray(stored)&&stored.length?stored:defaultMessages;
  }catch{return defaultMessages}
}

function renderMessages(){
  const data=getMessages();
  $("#chat").innerHTML=data.length
    ? data.slice().reverse().map(m=>`
      <article class="message">
        <div class="message-avatar">${m.avatar}</div>
        <div>
          <strong>${escapeHtml(m.name)}</strong><time>${escapeHtml(m.time||"just now")}</time>
          <p>${escapeHtml(m.text)}</p>
          <div class="system">[System]: ${escapeHtml(m.name)} sent a birthday wish!</div>
        </div>
      </article>`).join("")
    : '<div class="chat-empty">No messages yet. Be the first player to send a wish.</div>';
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#039;"}[c]));
}
renderMessages();

$("#wishForm").onsubmit=e=>{
  e.preventDefault();
  const name=$("#guestName").value.trim(),text=$("#guestMessage").value.trim();
  if(!name||!text)return;
  const data=getMessages();
  data.push({
    name,
    avatar:$("#guestAvatar").value,
    text,
    time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})
  });
  localStorage.setItem("urbanBirthdayMessages",JSON.stringify(data.slice(-50)));
  renderMessages();
  e.target.reset();
  successSound();
  toast("Wish sent to the server!");
  $("#guestbook").scrollIntoView({behavior:"smooth"});
};

$("#resetData").onclick=()=>{
  if(confirm("Reset this browser's birthday guestbook and opened-gift state?")){
    localStorage.removeItem("urbanBirthdayMessages");
    localStorage.removeItem("openedBirthdayGifts");
    state.opened.clear();
    renderMessages();
    toast("Local birthday data reset.");
  }
};

$("#search").addEventListener("keydown",e=>{
  if(e.key!=="Enter")return;
  const q=e.target.value.toLowerCase().trim();
  if(!q)return;
  const target=q.includes("chilley")||q.includes("naren")?"home"
    :q.includes("stat")||q.includes("leader")?"stats"
    :q.includes("gift")||q.includes("invent")||q.includes("loot")?"gifts"
    :q.includes("trivia")||q.includes("quiz")?"trivia"
    :q.includes("guest")||q.includes("wish")||q.includes("chat")?"guestbook":null;
  if(target)document.getElementById(target).scrollIntoView({behavior:"smooth"});
  else toast("No player or section found.");
  e.target.blur();
});

const sections=$$("main section"),links=$$("nav a");
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id));
    }
  });
},{rootMargin:"-35% 0px -50% 0px"});
sections.forEach(s=>io.observe(s));

window.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("#giftModal").open)$("#giftModal").close();
});

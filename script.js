const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={muted:localStorage.getItem("birthdayMuted")==="1",score:0,q:0,opened:new Set()};
let audioCtx;
function beep(freq=520,duration=.06,type="square",gain=.035){if(state.muted)return;audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}
function successSound(){beep(620,.08,"square");setTimeout(()=>beep(820,.12,"square"),90)}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2300)}
$("#soundToggle").textContent=state.muted?"🔇":"🔊";
$("#soundToggle").onclick=()=>{state.muted=!state.muted;localStorage.setItem("birthdayMuted",state.muted?"1":"0");$("#soundToggle").textContent=state.muted?"🔇":"🔊";if(!state.muted)beep()};
$$(".btn,.topbar nav a,.gift,.answer,.badges button").forEach(el=>el.addEventListener("click",()=>beep(440,.035)));
$("#mobileMenu").onclick=()=>$("#nav").classList.toggle("open");
$$('nav a').forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));

function confetti(){const layer=$("#confetti");layer.innerHTML="";for(let i=0;i<120;i++){const p=document.createElement("i");p.className="confetti-piece";p.style.left=Math.random()*100+"vw";p.style.background=["#00a2ff","#ffb800","#00e676","#ff4d6d","#fff"][i%5];p.style.setProperty("--x",(Math.random()*260-130)+"px");p.style.setProperty("--r",(Math.random()*1100-550)+"deg");p.style.animationDelay=Math.random()*.35+"s";layer.appendChild(p)}setTimeout(()=>layer.innerHTML="",2200);successSound();toast("🎉 PARTY MODE ACTIVATED — HAPPY BIRTHDAY!")}
$("#celebrateBtn").onclick=confetti;

for(let i=0;i<28;i++){const p=document.createElement("i");p.className="particle";p.style.left=Math.random()*100+"%";p.style.top=(45+Math.random()*45)+"%";p.style.animationDuration=(2+Math.random()*4)+"s";p.style.animationDelay=Math.random()*4+"s";$("#particles").appendChild(p)}

const gifts=[
["🎁","Mystery Crate","Golden Party Fedora","You found the legendary birthday drip."],
["🎂","Cake Crate","Infinite Pizza Slice","Because one slice is never enough."],
["🕹️","Gamer Crate","+999 Hype Tokens","Instantly increases server energy."],
["🧱","Builder Crate","Master Builder Hammer","Build anything. Break nothing. Probably."],
["👑","VIP Crate","Birthday Crown","Reserved for today's birthday legends."],
["🚀","Hype Crate","Rocket Boost","Launches the party into another server."],
["💎","Rare Crate","Diamond Badge","A shiny badge for an even shinier friendship."],
["🎈","Party Crate","Infinite Balloons","Side effects include uncontrollable celebration."]
];
const grid=$("#giftGrid");
gifts.forEach((g,i)=>{const el=document.createElement("article");el.className="gift";el.innerHTML=`<div class="crate">${g[0]}</div><h3>${g[1]}</h3><small>CLICK TO UNBOX • #${String(i+1).padStart(2,"0")}</small>`;el.onclick=()=>openGift(el,i);grid.appendChild(el)});
function openGift(el,i){if(state.opened.has(i)){showLoot(i);return}state.opened.add(i);el.classList.add("opening");beep(180,.1,"sawtooth");setTimeout(()=>{el.classList.remove("opening");showLoot(i);successSound()},900)}
function showLoot(i){const g=gifts[i];$("#modalContent").innerHTML=`<div class="loot-icon">${g[0]}</div><h2>${g[2]}</h2><p>${g[3]}<br><br>Message from the Birthday Server: <b>Chilley & Naren, keep making memories and never let the server shut down.</b></p><div class="loot">★ RARE DROP • BIRTHDAY LOOT</div>`;$("dialog").showModal()}
$$("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("#giftModal").addEventListener("click",e=>{if(e.target===$("#giftModal"))$("#giftModal").close()});

const questions=[
{q:"Which duo is today's birthday VIP team?",a:["Chilley & Naren","Builderman & Bacon","Noob & Guest","The Admins"],c:0},
{q:"What does a birthday VIP deserve?",a:["A kick","A party","A ban","A homework sheet"],c:1},
{q:"Which game is listed for Chilley's favourite games?",a:["Bloxburg","Tetris","Chess","Flight Sim"],c:0},
{q:"What is Naren's server title?",a:["Master Builder","Pro Gamer","NPC","Quest Giver"],c:1},
{q:"What happens when you hit JOIN SERVER?",a:["Nothing","The server closes","Confetti party mode","It deletes your inventory"],c:2}
];
const quiz=$("#quiz");
function renderQuiz(){if(state.q>=questions.length){quiz.innerHTML=`<div class="quiz-result"><div class="loot-icon">🏆</div><h2>SERVER COMPLETE!</h2><p>You scored <b>${state.score}/${questions.length}</b> and earned <b>${state.score*200} Birthday R$</b>.</p><button class="btn primary" id="again">PLAY AGAIN</button></div>`;$("#again").onclick=()=>{state.q=0;state.score=0;$("#scoreChip").textContent="R$ 0";renderQuiz()};confetti();return}const x=questions[state.q];quiz.innerHTML=`<div class="quiz-progress"><i style="width:${state.q/questions.length*100}%"></i></div><p class="eyebrow">QUESTION ${state.q+1} / ${questions.length}</p><h3 class="question">${x.q}</h3><div class="answers">${x.a.map((a,i)=>`<button class="answer" data-i="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join("")}</div>`;$$(".answer").forEach(b=>b.onclick=()=>answer(+b.dataset.i))}
function answer(i){const x=questions[state.q],bs=$$(".answer");bs.forEach(b=>b.disabled=true);if(i===x.c){bs[i].classList.add("correct");state.score++;$("#scoreChip").textContent=`R$ ${state.score*200}`;successSound();toast("+200 Birthday R$ — CORRECT!")}else{bs[i].classList.add("wrong");bs[x.c].classList.add("correct");beep(180,.12,"sawtooth");toast("Not quite — the server reveals the answer.");}setTimeout(()=>{state.q++;renderQuiz()},850)}
renderQuiz();

const defaultMessages=[
{name:"Birthday Bot",avatar:"🤖",text:"Welcome to the birthday server! Chilley & Naren have entered the lobby."},
{name:"Bestie",avatar:"😎",text:"happy birthday legends. today we are NOT touching the logout button."},
{name:"Party Host",avatar:"👑",text:"server objective: celebrate, eat cake, and create maximum chaos."}
];
function getMessages(){try{return JSON.parse(localStorage.getItem("urbanBirthdayMessages"))||defaultMessages}catch{return defaultMessages}}
function renderMessages(){const data=getMessages();$("#chat").innerHTML=data.length?data.slice().reverse().map(m=>`<article class="message"><div class="message-avatar">${m.avatar}</div><div><strong>${escapeHtml(m.name)}</strong><time>${escapeHtml(m.time||"just now")}</time><p>${escapeHtml(m.text)}</p><div class="system">[System]: ${escapeHtml(m.name)} sent a birthday wish!</div></div></article>`).join(""):`<div class="chat-empty">No messages yet. Be the first player to send a wish.</div>`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
renderMessages();
$("#wishForm").onsubmit=e=>{e.preventDefault();const name=$("#guestName").value.trim(),text=$("#guestMessage").value.trim();if(!name||!text)return;const data=getMessages();data.push({name,avatar:$("#guestAvatar").value,text,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})});localStorage.setItem("urbanBirthdayMessages",JSON.stringify(data.slice(-50)));renderMessages();e.target.reset();successSound();toast("Wish sent to the server!");$("#guestbook").scrollIntoView({behavior:"smooth"})};
$("#resetData").onclick=()=>{if(confirm("Reset this browser's birthday guestbook?")){localStorage.removeItem("urbanBirthdayMessages");renderMessages();toast("Local guestbook reset.")}};

$("#search").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.toLowerCase().trim();if(!q)return;if(q.includes("chilley"))$("#home").scrollIntoView({behavior:"smooth"});else if(q.includes("naren"))$("#home").scrollIntoView({behavior:"smooth"});else if(q.includes("gift"))$("#gifts").scrollIntoView({behavior:"smooth"});else if(q.includes("trivia"))$("#trivia").scrollIntoView({behavior:"smooth"});else toast("No player or section found.");e.target.blur()}});
const sections=$$("main section"),links=$$("nav a");const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id))}}),{rootMargin:"-40% 0px -50% 0px"});sections.forEach(s=>io.observe(s));

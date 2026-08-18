const guests={danil:{name:"Данил",image:"assets/invite-danil.webp"},dima:{name:"Дима",image:"assets/invite-dima.webp"},artem:{name:"Артем",image:"assets/invite-artem.webp"},egor:{name:"Егор",image:"assets/invite-egor.webp"},vlada:{name:"Влада",image:"assets/invite-vlada.webp"}};
const aliases={"данил":"danil","дима":"dima","артем":"artem","артём":"artem","егор":"egor","влада":"vlada"};
const screens={guest:document.getElementById("guestScreen"),welcome:document.getElementById("welcomeScreen"),key:document.getElementById("keyScreen"),star:document.getElementById("starScreen"),chest:document.getElementById("chestScreen"),final:document.getElementById("finalScreen")};
const voiceTracks={
key:"assets/audio/voice-key.mp3",
star:"assets/audio/voice-stars.mp3",
chest:"assets/audio/voice-chest.mp3",
final:"assets/audio/voice-final.mp3"
};
const soundButton=document.getElementById("soundButton"),hintButton=document.getElementById("hintButton"),inviteImage=document.getElementById("inviteImage"),guestButtons=document.getElementById("guestButtons"),confettiLayer=document.getElementById("confettiLayer"),actionStatus=document.getElementById("actionStatus");
let currentGuest=null,currentScreen="guest",soundEnabled=false,audioContext=null,musicTimer=null,musicStep=0,collectedStars=0,transitionLocked=false,voicePlaying=false;const voiceAudio=new Audio();voiceAudio.preload="auto";voiceAudio.volume=.95;voiceAudio.addEventListener("play",()=>voicePlaying=true);voiceAudio.addEventListener("ended",()=>voicePlaying=false);voiceAudio.addEventListener("pause",()=>voicePlaying=false);
function normalizedGuest(value){if(!value)return null;const clean=value.trim().toLowerCase();return guests[clean]?clean:aliases[clean]||null}
function setGuest(slug,updateUrl=false){currentGuest=guests[slug]?slug:"danil";const g=guests[currentGuest];document.querySelectorAll("[data-guest-name]").forEach(n=>n.textContent=g.name);inviteImage.src=g.image;inviteImage.alt=`Персональное приглашение для ${g.name}`;if(updateUrl){const url=new URL(location.href);url.searchParams.set("guest",currentGuest);history.replaceState({},"",url)}}
function renderGuests(){Object.entries(guests).forEach(([slug,g])=>{const b=document.createElement("button");b.type="button";b.className="secondary-button";b.textContent=g.name;b.onclick=()=>{setGuest(slug,true);playEffect("click");showScreen("welcome",0)};guestButtons.appendChild(b)})}
function updateQuestMap(stage){document.querySelectorAll(".quest-node").forEach((node,i)=>{node.classList.toggle("is-done",i<stage);node.classList.toggle("is-current",i===stage)});document.getElementById("questMapFill").style.width=`${stage/3*100}%`}
function showScreen(name,stage){currentScreen=name;Object.values(screens).forEach(s=>s.classList.remove("is-active"));screens[name].classList.add("is-active");updateQuestMap(stage);scrollTo({top:0,behavior:"smooth"});if(soundEnabled&&voiceTracks[name])setTimeout(()=>playVoice(name),350)}
function setup(){renderGuests();const slug=normalizedGuest(new URLSearchParams(location.search).get("guest"));if(slug){setGuest(slug);showScreen("welcome",0)}else showScreen("guest",0)}
function ensureAudio(){if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==="suspended")audioContext.resume();return audioContext}
function tone(freq,duration=.09,type="sine",volume=.12,delay=0){if(!soundEnabled)return;const c=ensureAudio(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+delay);g.gain.setValueAtTime(.0001,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(volume,c.currentTime+delay+.012);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+delay+duration);o.connect(g);g.connect(c.destination);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+duration+.03)}
function noise(duration=.12,volume=.05){if(!soundEnabled)return;const c=ensureAudio(),len=c.sampleRate*duration,buf=c.createBuffer(1,len,c.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const src=c.createBufferSource(),g=c.createGain();src.buffer=buf;g.gain.value=volume;src.connect(g);g.connect(c.destination);src.start()}
function playEffect(name){const fx={click:()=>tone(520,.055,"triangle",.07),wrong:()=>{tone(190,.15,"square",.07);tone(145,.16,"square",.05,.08)},unlock:()=>{noise(.18,.035);[330,440,660].forEach((f,i)=>tone(f,.17,"triangle",.12,i*.09))},star:()=>tone(620+collectedStars*42,.11,"sine",.12),complete:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.24,"triangle",.12,i*.1)),chest:()=>{noise(.32,.08);[260,392,523,784].forEach((f,i)=>tone(f,.42,"sine",.11,i*.08))},confetti:()=>noise(.42,.035)};fx[name]?.()}
function startMusic(){if(!soundEnabled||musicTimer)return;const notes=[261.6,329.6,392,329.6,293.7,349.2,440,349.2];musicStep=0;const tick=()=>{if(!soundEnabled)return;const f=notes[musicStep%notes.length],duck=voicePlaying?.32:1;tone(f,.34,"triangle",.024*duck);tone(f/2,.42,"sine",.014*duck,.03);musicStep++};tick();musicTimer=setInterval(tick,540)}
function stopMusic(){clearInterval(musicTimer);musicTimer=null}
function stopVoice(){voiceAudio.pause();voiceAudio.currentTime=0}
function playVoice(screenName=currentScreen){
  if(!soundEnabled||!voiceTracks[screenName])return;
  stopVoice();
  voiceAudio.src=voiceTracks[screenName];
  voiceAudio.play().catch(()=>{});
}
function setSound(on){
  soundEnabled=on;
  soundButton.textContent=on?"🔊":"🔇";
  soundButton.setAttribute("aria-pressed",String(on));
  soundButton.setAttribute("aria-label",on?"Выключить звук":"Включить звук");
  if(on){
    ensureAudio();
    startMusic();
    playVoice(currentScreen);
  }else{
    stopMusic();
    stopVoice();
  }
}
soundButton.onclick=()=>setSound(!soundEnabled);
hintButton.onclick=()=>{if(!soundEnabled)setSound(true);else playVoice(currentScreen)};
function begin(withSound){setSound(withSound);playEffect("click");showScreen("key",0)}
document.getElementById("startSoundButton").onclick=()=>begin(true);document.getElementById("startSilentButton").onclick=()=>begin(false);
document.querySelectorAll(".key-choice").forEach(b=>b.onclick=()=>{if(transitionLocked)return;if(b.dataset.correct==="true"){transitionLocked=true;document.getElementById("lockIcon").classList.add("is-open");const f=document.getElementById("keyFeedback");f.textContent="Первый замок открыт!";f.classList.add("is-success");playEffect("unlock");setTimeout(()=>{transitionLocked=false;showScreen("star",1)},1050)}else{b.classList.remove("is-wrong");void b.offsetWidth;b.classList.add("is-wrong");document.getElementById("keyFeedback").textContent="Этот ключ не подходит. Ищи круглое отверстие!";playEffect("wrong")}});
document.querySelectorAll(".star").forEach(s=>s.onclick=()=>{if(s.classList.contains("is-collected")||transitionLocked)return;s.classList.add("is-collected");collectedStars++;document.getElementById("starCounter").textContent=collectedStars;playEffect("star");if(collectedStars===6){transitionLocked=true;const f=document.getElementById("starFeedback");f.textContent="Все шесть звёзд собраны!";f.classList.add("is-success");playEffect("complete");setTimeout(()=>{transitionLocked=false;showScreen("chest",2)},1250)}});
document.querySelectorAll(".chest").forEach(b=>b.onclick=()=>{if(transitionLocked)return;if(b.dataset.correct==="true"){transitionLocked=true;b.classList.add("is-open");document.getElementById("mapBoard").classList.add("is-opening");document.getElementById("treasureGlow").classList.add("is-visible");const f=document.getElementById("chestFeedback");f.textContent="Секретное приглашение найдено!";f.classList.add("is-success");playEffect("chest");launchConfetti();setTimeout(()=>{transitionLocked=false;showScreen("final",3);playEffect("complete");launchConfetti()},1650)}else{b.classList.remove("is-wrong");void b.offsetWidth;b.classList.add("is-wrong");document.getElementById("chestFeedback").textContent="Почти! Нужный сундук находится ближе к замку.";playEffect("wrong")}});
function launchConfetti(){const colors=["#ffbf27","#ef4f43","#29c6df","#6bd45b","#a86dea","#fff"];for(let i=0;i<64;i++){const p=document.createElement("span");p.className="confetti-piece";p.style.left=`${Math.random()*100}%`;p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.setProperty("--drift",`${(Math.random()-.5)*240}px`);p.style.animationDelay=`${Math.random()*.55}s`;confettiLayer.appendChild(p);setTimeout(()=>p.remove(),3700)}playEffect("confetti")}
async function copyText(text,success){try{await navigator.clipboard.writeText(text);actionStatus.textContent=success}catch{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();actionStatus.textContent=success}}
document.getElementById("copyAddressButton").onclick=()=>copyText(document.getElementById("addressText").textContent,"Адрес скопирован.");
document.getElementById("confirmButton").onclick=async()=>{const name=guests[currentGuest||"danil"].name,text=`Здравствуйте! Подтверждаем, что ${name} придёт на день рождения 29 августа к 12:30.`;if(navigator.share){try{await navigator.share({title:"Подтверждение участия",text});actionStatus.textContent="Сообщение открыто для отправки."}catch(e){if(e.name!=="AbortError")copyText(text,"Текст подтверждения скопирован.")}}else copyText(text,"Текст подтверждения скопирован — отправьте его организатору.")};
function resetGame(){collectedStars=0;transitionLocked=false;document.getElementById("starCounter").textContent="0";document.querySelectorAll(".star").forEach(s=>s.classList.remove("is-collected"));document.querySelectorAll(".chest").forEach(c=>c.classList.remove("is-open","is-wrong"));document.querySelectorAll(".key-choice").forEach(k=>k.classList.remove("is-wrong"));document.getElementById("lockIcon").classList.remove("is-open");document.getElementById("mapBoard").classList.remove("is-opening");document.getElementById("treasureGlow").classList.remove("is-visible");["keyFeedback","starFeedback","chestFeedback"].forEach(id=>{const e=document.getElementById(id);e.textContent="";e.classList.remove("is-success")});actionStatus.textContent="";showScreen("welcome",0)}
document.getElementById("replayButton").onclick=resetGame;setup();

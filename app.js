/* LifeOS V0.2 — Cyberpunk progression core */
const STORAGE_KEY = "lifeos_v01"; // Keep the V0.1 key so existing progress migrates automatically.
const categories = [
  { id:"intelligence", name:"INTELLIGENCE", icon:"⌘" },
  { id:"strength", name:"STRENGTH", icon:"✦" },
  { id:"discipline", name:"DISCIPLINE", icon:"◈" },
  { id:"creativity", name:"CREATIVITY", icon:"⌬" },
  { id:"agility", name:"AGILITY", icon:"➤" }
];

const defaultState = {
  playerName:"PLAYER ONE", quests:[], totalXp:0,
  categoryXp:{intelligence:0,strength:0,discipline:0,creativity:0,agility:0},
  xpEvents:[], claimedRewards:[], customRewards:[]
};

const rankLadder = [
  { level:1, name:"INITIATE", title:"Newly Connected" },
  { level:5, name:"RUNNER", title:"Street-Level Operative" },
  { level:10, name:"OPERATIVE", title:"Trusted Specialist" },
  { level:20, name:"ELITE", title:"High-Value Asset" },
  { level:35, name:"PHANTOM", title:"Ghost in the Grid" },
  { level:50, name:"LEGEND", title:"Beyond the System" }
];

const achievementDefinitions = [
  { id:"first_signal", name:"First Signal", desc:"Complete your first quest.", icon:"⌁", test:s=>s.quests.some(q=>q.done) },
  { id:"ten_ops", name:"Ten Operations", desc:"Complete 10 quests.", icon:"⚡", test:s=>s.quests.filter(q=>q.done).length>=10 },
  { id:"level_five", name:"System Runner", desc:"Reach player level 5.", icon:"▣", test:s=>levelFromXp(s.totalXp).level>=5 },
  { id:"level_ten", name:"Black ICE Breaker", desc:"Reach player level 10.", icon:"◈", test:s=>levelFromXp(s.totalXp).level>=10 },
  { id:"specialist", name:"Specialist", desc:"Reach attribute level 5 in any field.", icon:"⌘", test:s=>categories.some(c=>levelFromXp(s.categoryXp[c.id]||0).level>=5) },
  { id:"balanced_build", name:"Balanced Build", desc:"Reach attribute level 3 in all five fields.", icon:"✧", test:s=>categories.every(c=>levelFromXp(s.categoryXp[c.id]||0).level>=3) },
  { id:"hundred_ops", name:"Century Protocol", desc:"Complete 100 quests.", icon:"⟁", test:s=>s.quests.filter(q=>q.done).length>=100 }
];

let state = loadState();

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved) return structuredClone(defaultState);
    return {
      ...structuredClone(defaultState), ...saved,
      categoryXp:{...defaultState.categoryXp,...(saved.categoryXp||{})},
      claimedRewards:Array.isArray(saved.claimedRewards)?saved.claimedRewards:[],
      customRewards:Array.isArray(saved.customRewards)?saved.customRewards:[]
    };
  } catch { return structuredClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function todayKey(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
// Hardcore curve: each new level costs more than the previous one.
function xpNeededForLevel(level){ return 150 + (level-1)*50; }
function levelFromXp(xp){
  let level=1, remaining=Math.max(0,Number(xp)||0), needed=xpNeededForLevel(1);
  while(remaining>=needed){ remaining-=needed; level++; needed=xpNeededForLevel(level); }
  return {level,into:remaining,needed};
}
function currentRank(level){ return [...rankLadder].reverse().find(r=>level>=r.level)||rankLadder[0]; }
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function showToast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove("show"),2400);}
function completedCount(){return state.quests.filter(q=>q.done).length;}
function unlockedAchievements(){return achievementDefinitions.filter(a=>a.test(state));}
function rewardCatalog(){
  const base=[
    {id:"reward_lv3",name:"Neon Break",type:"real",unlock:3,desc:"Take a guilt-free 30-minute break for something you enjoy.",icon:"☾"},
    {id:"reward_lv5",name:"Loadout Upgrade",type:"game",unlock:5,desc:"Unlock the RUNNER profile frame.",icon:"▣"},
    {id:"reward_lv8",name:"Side Quest Pass",type:"real",unlock:8,desc:"Choose one small, fun activity for your next free block.",icon:"✧"},
    {id:"reward_lv10",name:"Operative Status",type:"game",unlock:10,desc:"Unlock the OPERATIVE title and profile glow.",icon:"◈"},
    {id:"reward_lv20",name:"Phantom Access",type:"game",unlock:20,desc:"Unlock the ELITE designation.",icon:"⌬"}
  ];
  return base.concat(state.customRewards.map(r=>({...r,type:"real",custom:true})));
}
function render(){
  const date=new Date();
  document.getElementById("todayLabel").textContent=date.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  document.getElementById("playerName").textContent=state.playerName;
  const level=levelFromXp(state.totalXp), rank=currentRank(level.level);
  document.getElementById("level").textContent=level.level;
  document.getElementById("levelBadge").textContent=String(level.level).padStart(2,"0");
  document.getElementById("xpText").textContent=`${level.into} / ${level.needed} XP`;
  document.getElementById("xpBar").style.width=`${Math.min(100,level.into/level.needed*100)}%`;
  document.getElementById("totalXp").textContent=`${state.totalXp} TOTAL XP`;
  document.getElementById("nextLevel").textContent=`${level.needed-level.into} XP TO NEXT LEVEL`;
  document.getElementById("rankName").textContent=rank.name;
  document.getElementById("rankChipText").textContent=`${rank.name} // SYSTEM ACTIVE`;

  const today=state.xpEvents.filter(e=>e.date===todayKey());
  document.getElementById("todayXp").textContent=today.reduce((sum,e)=>sum+e.xp,0);
  const todaysQuests=state.quests.filter(q=>q.date===todayKey());
  const completed=todaysQuests.filter(q=>q.done).length;
  document.getElementById("questsDone").textContent=completed;
  document.getElementById("activeQuests").textContent=state.quests.filter(q=>!q.done).length;
  document.getElementById("questProgressLabel").textContent=`${completed} OF ${todaysQuests.length} COMPLETED`;
  const pct=todaysQuests.length?Math.round(completed/todaysQuests.length*100):0;
  document.getElementById("questProgressPct").textContent=`${pct}%`;
  document.getElementById("questBar").style.width=`${pct}%`;

  const list=document.getElementById("questList"); list.innerHTML="";
  document.getElementById("emptyState").hidden=todaysQuests.length>0;
  todaysQuests.forEach(q=>{
    const item=document.createElement("div"); item.className=`quest-item${q.done?" completed":""}`;
    item.innerHTML=`<input class="quest-check" type="checkbox" aria-label="Complete ${escapeHtml(q.title)}" ${q.done?"checked":""}><div class="quest-copy"><strong>${escapeHtml(q.title)}</strong><small>${escapeHtml(categoryName(q.category))} · ${q.done?"COMPLETED":"ACTIVE"}</small></div><span class="xp-reward">+${q.xp} XP</span><button class="delete-quest" aria-label="Delete quest">×</button>`;
    item.querySelector(".quest-check").addEventListener("change",e=>toggleQuest(q.id,e.target.checked));
    item.querySelector(".delete-quest").addEventListener("click",()=>deleteQuest(q.id));
    list.appendChild(item);
  });

  const attrs=document.getElementById("attributes"); attrs.innerHTML="";
  categories.forEach(cat=>{
    const xp=state.categoryXp[cat.id]||0, a=levelFromXp(xp), pctAttr=Math.floor(a.into/a.needed*100);
    const row=document.createElement("div"); row.className="attribute-card";
    row.innerHTML=`<div class="attribute-top"><span class="attribute-icon">${cat.icon}</span><div class="attribute-title"><strong>${cat.name}</strong><small>LEVEL ${a.level}</small></div><span class="attribute-xp">${xp} XP</span></div><div class="attribute-track"><div class="attribute-fill" style="width:${pctAttr}%"></div></div><div class="attribute-foot"><span>${a.into} / ${a.needed} XP</span><span>${a.needed-a.into} TO NEXT</span></div>`;
    attrs.appendChild(row);
  });
  renderRanks(level.level);
  renderAchievements();
  renderRewards(level.level);
}
function categoryName(id){return categories.find(c=>c.id===id)?.name||"GENERAL";}
function renderRanks(level){
  const el=document.getElementById("rankLadder"); el.innerHTML="";
  rankLadder.forEach(r=>{const item=document.createElement("div");item.className=`rank-step${level>=r.level?" unlocked":""}${currentRank(level).level===r.level?" current":""}`;item.innerHTML=`<span class="rank-level">LV ${r.level}</span><div><strong>${r.name}</strong><small>${r.title}</small></div><span class="rank-state">${level>=r.level?"UNLOCKED":"LOCKED"}</span>`;el.appendChild(item);});
}
function renderAchievements(){
  const el=document.getElementById("achievementGrid");el.innerHTML="";
  const unlocked=unlockedAchievements();
  document.getElementById("achievementCount").textContent=`${unlocked.length} / ${achievementDefinitions.length} UNLOCKED`;
  achievementDefinitions.forEach(a=>{const yes=unlocked.some(x=>x.id===a.id);const card=document.createElement("article");card.className=`achievement-card${yes?" unlocked":""}`;card.innerHTML=`<span class="achievement-icon">${a.icon}</span><strong>${a.name}</strong><small>${a.desc}</small><em>${yes?"UNLOCKED":"LOCKED"}</em>`;el.appendChild(card);});
}
function renderRewards(level){
  const el=document.getElementById("rewardList");el.innerHTML="";
  rewardCatalog().forEach(r=>{
    const unlocked=level>=r.unlock, claimed=state.claimedRewards.includes(r.id);
    const card=document.createElement("article");card.className=`reward-card${unlocked?" unlocked":""}${claimed?" claimed":""}`;
    const action=unlocked&&!claimed?`<button class="claim-btn" data-reward="${escapeHtml(r.id)}">Mark redeemed</button>`:`<span class="reward-state">${claimed?"REDEEMED":`UNLOCKS AT LV ${r.unlock}`}</span>`;
    card.innerHTML=`<span class="reward-icon">${r.icon||"✧"}</span><div class="reward-copy"><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.desc)}</small><em>${r.type==="game"?"IN-GAME UNLOCK":"REAL-LIFE REWARD"}${r.custom?" · CUSTOM":""}</em></div>${action}`;
    el.appendChild(card);
  });
  el.querySelectorAll(".claim-btn").forEach(btn=>btn.addEventListener("click",()=>{const id=btn.dataset.reward;if(!state.claimedRewards.includes(id)){state.claimedRewards.push(id);saveState();render();showToast("Reward marked as redeemed.");}}));
}
function addQuest(title,category,xp){
  state.quests.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title,category,xp,done:false,date:todayKey()});
  saveState();render();showToast("Quest added to your mission queue.");
}
function toggleQuest(id,done){
  const q=state.quests.find(q=>q.id===id);if(!q||q.done===done)return;
  const oldLevel=levelFromXp(state.totalXp).level;
  q.done=done;
  if(done){state.totalXp+=q.xp;state.categoryXp[q.category]=(state.categoryXp[q.category]||0)+q.xp;state.xpEvents.push({xp:q.xp,date:todayKey(),questId:q.id});}
  else{state.totalXp=Math.max(0,state.totalXp-q.xp);state.categoryXp[q.category]=Math.max(0,(state.categoryXp[q.category]||0)-q.xp);const index=state.xpEvents.findIndex(e=>e.questId===q.id);if(index>=0)state.xpEvents.splice(index,1);}
  saveState();render();
  const newLevel=levelFromXp(state.totalXp).level;
  if(done&&newLevel>oldLevel)showToast(`LEVEL UP // ${newLevel} — ${currentRank(newLevel).name}`);
  else if(done)showToast(`Quest complete. +${q.xp} XP`);
  else showToast("Quest returned to active status.");
}
function deleteQuest(id){
  const q=state.quests.find(q=>q.id===id);if(!q)return;
  if(q.done){state.totalXp=Math.max(0,state.totalXp-q.xp);state.categoryXp[q.category]=Math.max(0,(state.categoryXp[q.category]||0)-q.xp);state.xpEvents=state.xpEvents.filter(e=>e.questId!==id);}
  state.quests=state.quests.filter(q=>q.id!==id);saveState();render();showToast("Quest removed from log.");
}

const questDialog=document.getElementById("questDialog");
document.getElementById("addQuestTop").addEventListener("click",()=>questDialog.showModal());
document.getElementById("closeDialog").addEventListener("click",()=>questDialog.close());
document.getElementById("questForm").addEventListener("submit",e=>{
  e.preventDefault();const title=document.getElementById("questTitle").value.trim();if(!title)return;
  addQuest(title,document.getElementById("questCategory").value,Number(document.getElementById("questXp").value));e.target.reset();questDialog.close();
});
const infoDialog=document.getElementById("infoDialog");
document.getElementById("settingsBtn").addEventListener("click",()=>{document.getElementById("nameInput").value=state.playerName;infoDialog.showModal();});
document.getElementById("closeInfo").addEventListener("click",()=>infoDialog.close());
document.getElementById("saveName").addEventListener("click",()=>{const name=document.getElementById("nameInput").value.trim();if(name){state.playerName=name.toUpperCase();saveState();render();infoDialog.close();showToast("Identity updated.");}});
document.getElementById("resetData").addEventListener("click",()=>{if(confirm("Reset all LifeOS progress saved on this device? This cannot be undone.")){state=structuredClone(defaultState);saveState();render();infoDialog.close();showToast("Local progress reset.");}});
const rewardDialog=document.getElementById("rewardDialog");
document.getElementById("addRewardBtn").addEventListener("click",()=>rewardDialog.showModal());
document.getElementById("closeReward").addEventListener("click",()=>rewardDialog.close());
document.getElementById("rewardForm").addEventListener("submit",e=>{
  e.preventDefault();const name=document.getElementById("rewardTitle").value.trim(),desc=document.getElementById("rewardDesc").value.trim(),unlock=Math.max(2,Math.min(100,Number(document.getElementById("rewardLevel").value)||2));
  if(!name||!desc)return;const id=`custom_${Date.now()}`;state.customRewards.push({id,name,desc,unlock,icon:"✧"});saveState();render();e.target.reset();rewardDialog.close();showToast("Real-life reward added to vault.");
});
document.querySelectorAll(".nav-item[data-tab]").forEach(btn=>btn.addEventListener("click",()=>{
  const target=btn.dataset.tab;document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));btn.classList.add("active");
  const section=document.getElementById(target+"Section")||document.getElementById("homeSection");section.scrollIntoView({behavior:"smooth",block:"start"});
}));
render();
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});

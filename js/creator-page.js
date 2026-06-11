document.addEventListener("DOMContentLoaded",async()=>{
  const grid=document.getElementById("grid"), search=document.getElementById("search"), setFilter=document.getElementById("setFilter");
  await BCVData.load("../");
  if(BCVData.controls.global.printRequestsEnabled === false){
    insertFeatureBanner("main.page", "print requests", "Creator Vault print requests are currently turned off by Bow.");
  }
  const sets=[...new Set(BCVData.creator.map(x=>x.setName).filter(Boolean))].sort();
  sets.forEach(s=>setFilter.add(new Option(s,s)));
  let mode="sets";
  function setCard(setName){
    const cards=BCVData.creator.filter(c=>c.setName===setName);
    const first=cards[0];
    return `<article class="set-card"><img class="set-img" src="${BCVUtils.escape(first?.image||'../assets/placeholders/card-placeholder.svg')}" onerror="this.src='../assets/placeholders/card-placeholder.svg'"><div class="set-body"><p class="eyebrow">Creator Set</p><h3>${BCVUtils.escape(setName)}</h3><p>${cards.length} cards</p><div class="actions"><button class="primary" onclick="openSet('${BCVUtils.escape(setName)}')">Open Set</button></div></div></article>`;
  }
  window.openSet=(s)=>{setFilter.value=s;mode="cards";renderCards()};
  function renderSets(){
    mode="sets";
    grid.className="set-grid";
    let rows=sets;
    const q=search.value.toLowerCase();
    if(q)rows=rows.filter(s=>s.toLowerCase().includes(q));
    grid.innerHTML=rows.map(setCard).join("")||"<section class='empty'>No sets found.</section>";
  }
  function renderCards(){
    mode="cards";
    grid.className="grid";
    let rows=[...BCVData.creator];
    const q=search.value.toLowerCase();
    if(q)rows=rows.filter(c=>c.search.includes(q));
    if(setFilter.value)rows=rows.filter(c=>c.setName===setFilter.value);
    grid.innerHTML=rows.map(c=>cardHtml(c,"")).join("")||"<section class='empty'>No cards found.</section>";
  }
  showSetsBtn.onclick=()=>{search.value="";setFilter.value="";renderSets()};
  showAllBtn.onclick=()=>{setFilter.value="";renderCards()};
  search.oninput=()=>mode==="sets"?renderSets():renderCards();
  setFilter.onchange=renderCards;
  renderSets();
});
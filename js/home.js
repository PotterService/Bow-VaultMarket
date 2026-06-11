document.addEventListener("DOMContentLoaded", async()=>{
  const grid=document.getElementById("grid"), q=document.getElementById("search"), type=document.getElementById("typeFilter"), set=document.getElementById("setFilter");
  try{
    await BCVData.load("");
    creatorCount.textContent=BCVData.creator.length;
    gradeCount.textContent=BCVData.grade.length;
    setCount.textContent=new Set(BCVData.all.map(x=>x.setName).filter(Boolean)).size;
    boosterCount.textContent=BCVData.boosters.length;
    [...new Set(BCVData.all.map(x=>x.setName).filter(Boolean))].sort().forEach(s=>set.add(new Option(s,s)));
    function render(){
      let items=[...BCVData.all];
      const query=q.value.toLowerCase();
      if(query)items=items.filter(x=>x.search.includes(query));
      if(type.value)items=items.filter(x=>x.source===type.value);
      if(set.value)items=items.filter(x=>x.setName===set.value);
      grid.innerHTML=items.map(x=>cardHtml(x,"pages/")).join("")||"<section class='empty'>No cards found</section>";
    }
    q.oninput=render;type.onchange=render;set.onchange=render;refreshBtn.onclick=()=>{localStorage.removeItem("bcv_creator_cache");localStorage.removeItem("bcv_grade_cache");location.reload()};
    render();
  }catch(e){grid.innerHTML="<section class='empty'>Could not load vault data.</section>";console.error(e)}
});
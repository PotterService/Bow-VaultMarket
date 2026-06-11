document.addEventListener("DOMContentLoaded",async()=>{
  const grid=document.getElementById("grid"), search=document.getElementById("search");
  await BCVData.load("../");
  if(BCVData.controls.global.gradePurchaseRequestsEnabled === false && BCVData.controls.global.ownershipRequestsEnabled === false){
    insertFeatureBanner("main.page", "Grade Vault requests", "Grade card purchase requests and ownership transfer requests are currently turned off by Bow.");
  } else if(BCVData.controls.global.gradePurchaseRequestsEnabled === false){
    insertFeatureBanner("main.page", "Grade Vault purchase requests", "Request-to-buy features are currently turned off by Bow.");
  } else if(BCVData.controls.global.ownershipRequestsEnabled === false){
    insertFeatureBanner("main.page", "ownership transfer requests", "Ownership transfer requests are currently turned off by Bow.");
  }
  [...new Set(BCVData.grade.map(c=>c.currentOwner).filter(Boolean))].sort().forEach(s=>ownerFilter.add(new Option(s,s)));
  [...new Set(BCVData.grade.map(c=>c.finalGrade).filter(Boolean))].sort().forEach(s=>gradeFilter.add(new Option(s,s)));
  function render(){
    let rows=[...BCVData.grade];
    const q=search.value.toLowerCase();
    if(q)rows=rows.filter(c=>c.search.includes(q));
    if(ownerFilter.value)rows=rows.filter(c=>c.currentOwner===ownerFilter.value);
    if(gradeFilter.value)rows=rows.filter(c=>c.finalGrade===gradeFilter.value);
    grid.innerHTML=rows.map(c=>cardHtml(c,"")).join("")||"<section class='empty'>No cards found.</section>";
  }
  search.oninput=render; ownerFilter.onchange=render; gradeFilter.onchange=render; render();
});
window.BCVUtils={
  text:v=>String(v??"").trim(),
  bool(v){return String(v??"").trim().toLowerCase()==="true"||String(v??"").trim().toLowerCase()==="yes"},
  escape(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")},
  field(row,name){const wanted=String(name).trim().toLowerCase();const key=Object.keys(row||{}).find(k=>String(k).trim().toLowerCase()===wanted);return key?row[key]:""},
  money(v){return String(v??"").trim()||"Contact for pricing"},
  history(v){try{const x=typeof v==="string"?JSON.parse(v):v;return Array.isArray(x)?x:[]}catch(e){return []}},
  toast(m){const el=document.getElementById("toast");if(el){el.textContent=m;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}else alert(m)}
};
function setupNav(){const m=document.getElementById("menuBtn"),n=document.getElementById("nav");if(m)m.onclick=()=>n.classList.toggle("open")}
document.addEventListener("DOMContentLoaded",setupNav);
function safeFileName(name){return String(name||"").replace(/[\\/:*?"<>|]/g,"").trim()}

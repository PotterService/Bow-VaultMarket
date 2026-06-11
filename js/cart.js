window.BCVCart={
  items:JSON.parse(localStorage.getItem(BCV_CONFIG.cartKey)||"[]"),
  save(){localStorage.setItem(BCV_CONFIG.cartKey,JSON.stringify(this.items));updateCartCount()},
  add(id,type){const existing=this.items.find(x=>x.id===id&&x.type===type);if(existing)existing.qty++;else this.items.push({id,type,qty:1});this.save();BCVUtils.toast("Added to cart/request list")},
  remove(i){this.items.splice(i,1);this.save();location.reload()}
};
function addToCart(id,type){BCVCart.add(id,type)}
function updateCartCount(){const el=document.getElementById("cartCount");if(el)el.textContent=BCVCart.items.reduce((a,b)=>a+Number(b.qty||1),0)}
document.addEventListener("DOMContentLoaded",updateCartCount);
function requestEmail(){
  return BCVData.controls.emails.cartRequestEmail || BCVData.controls.emails.printRequestEmail || BCVData.controls.emails.defaultEmail || BCV_CONFIG.contactEmail || "";
}
function ownershipEmail(){
  return BCVData.controls.emails.ownershipRequestEmail || BCVData.controls.emails.defaultEmail || BCV_CONFIG.contactEmail || "";
}

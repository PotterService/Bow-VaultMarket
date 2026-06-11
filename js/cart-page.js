function cartPricingHtml(line, item){
  const U = BCVUtils;
  let est = "";
  let sale = "";

  if(item && item.source){
    est = estimatedValueFor(item);
    sale = salePriceFor(item);
  } else if(item && item.type){
    est = boosterEstimatedValue(item);
    sale = boosterSalePrice(item);
  } else {
    est = item?.estimatedValue || line.estimatedValue || "";
    sale = item?.salePrice || line.salePrice || line.price || "";
  }

  return `<p class="value-line"><b>Estimated Value:</b> ${U.escape(U.money(est || "Not listed"))}</p>
  <p class="price-line"><b>${U.escape(item?.source === "creator" ? "Print Cost" : "Sale Price")}:</b> ${U.escape(U.money(sale || "Contact for pricing"))}</p>`;
}

function cartFinalPricingNote(){
  return `Bow will reach out for final pricing and more details if any price changes. If an item says Contact for Pricing, Bow will reach out with final pricing and other details, then provide an invoice after the order is confirmed.`;
}

function cartLineBlockedReason(line){
  const item = itemById(line.id);
  if(line.type === "creator-print" && item){
    const reason = printUnavailableReason(item);
    if(reason) return reason;
  }
  if(line.type === "custom-booster-pack" && line.selectedCards?.length){
    const blocked = [];
    line.selectedCards.forEach(entry=>{
      const cardId = typeof entry === "string" ? entry : entry.id;
      const card = itemById(cardId);
      const reason = card ? printUnavailableReason(card) : "";
      if(reason) blocked.push((card?.name || cardId) + ": " + reason);
    });
    if(blocked.length) return "Some selected cards are no longer printable: " + blocked.join("; ");
  }
  return "";
}
function cartHasBlockedPrints(){
  return BCVCart.items.some(line => cartLineBlockedReason(line));
}
document.addEventListener("DOMContentLoaded", async () => {
  await BCVData.load("../");
  if(BCVData.controls.global.cartRequestsEnabled === false){
    const n=document.querySelector(".notice");
    if(n){n.className="status-banner off";n.innerHTML="<strong>Bow has disabled request cart features for this page.</strong><p>"+BCVUtils.escape(BCVData.controls.global.cartOffMessage||"Cart requests are currently turned off by Bow.")+"</p>";}
    document.getElementById("sendRequest").disabled=true;
  } else {
    const n=document.querySelector(".notice");
    if(n){n.className="status-banner";n.innerHTML="<strong>Cart Requests On:</strong> Request cart is currently available.";}
  }
  renderCart();
  const note = document.createElement("section");
  note.className = "panel";
  note.innerHTML = `<h2>Pricing & Invoice Note</h2><p>${BCVUtils.escape(cartFinalPricingNote())}</p>`;
  const cartListSection = document.getElementById("cartList");
  if(cartListSection && !document.getElementById("pricingInvoiceNote")){
    note.id = "pricingInvoiceNote";
    cartListSection.before(note);
  }

  document.getElementById("sendRequest").onclick = () => {
    if(BCVData.controls.global.cartRequestsEnabled === false){
      alert(BCVData.controls.global.cartOffMessage || "Cart requests are currently turned off.");
      return;
    }
    if(cartHasBlockedPrints()){
      alert("One or more print items in your cart are no longer available. Please remove or edit those items before creating the request.");
      return;
    }
    const sections = [];
    sections.push("Bow Card Vault Request");
    sections.push("");
    sections.push("NOTICE:");
    sections.push("At the current moment, no order requests are being accepted during the building phase of the platform. This request is for testing and planning only.");
    sections.push("");
    sections.push("REQUESTED ITEMS");
    sections.push("===============");
    sections.push("");
    sections.push("PRICING NOTE:");
    sections.push(cartFinalPricingNote());
    BCVCart.items.forEach((line, index) => {
      const item = itemById(line.id) || boosterById(line.id) || line;
      const name = item.name || line.name || line.id;
      sections.push("");
      sections.push(`${index + 1}. ${name}`);
      sections.push(`   Type: ${line.type}`);
      sections.push(`   Quantity: ${line.qty || 1}`);
      if (line.setName) sections.push(`   Set: ${line.setName}`);
      if (item && item.source) {
        sections.push(`   Estimated Value: ${BCVUtils.money(estimatedValueFor(item) || "Not listed")}`);
        sections.push(`   ${item.source === "creator" ? "Print Cost" : "Sale Price"}: ${BCVUtils.money(salePriceFor(item) || "Contact for pricing")}`);
      } else if (item && item.type) {
        sections.push(`   Estimated Value: ${BCVUtils.money(boosterEstimatedValue(item) || "Not listed")}`);
        sections.push(`   Sale Price: ${BCVUtils.money(boosterSalePrice(item) || "Contact for pricing")}`);
      }
      if (line.selectedCards?.length) {
        sections.push("");
        sections.push("   Selected Cards:");
        line.selectedCards.forEach((entry, cardIndex) => {
          const cardId = typeof entry === "string" ? entry : entry.id;
          const qty = typeof entry === "string" ? 1 : Number(entry.qty || 1);
          const card = itemById(cardId);
          sections.push(`   ${cardIndex + 1}) ${qty}x ${card ? card.name : cardId}`);
          if (card) {
            sections.push(`      Card ID: ${card.id}`);
            sections.push(`      Set: ${card.setName || ""}`);
            sections.push(`      Image: ${card.image || ""}`);
          }
        });
      }
    });
    sections.push("");
    sections.push("CUSTOMER INFO");
    sections.push("=============");
    sections.push("Name: " + (document.getElementById("customerName")?.value || ""));
    sections.push("Phone: " + (document.getElementById("customerPhone")?.value || ""));
    sections.push("Email: " + (document.getElementById("customerEmail")?.value || ""));
    sections.push("");
    sections.push("NOTES / REQUEST DETAILS");
    sections.push("=======================");
    sections.push(document.getElementById("customerNotes")?.value || "No notes provided.");
    location.href = `mailto:${requestEmail()}?subject=Bow Card Vault Request&body=${encodeURIComponent(sections.join("\n"))}`;
  };
});
function selectedCardRows(line, cartIndex) {
  if (!line.selectedCards?.length) return "";
  const U = BCVUtils;
  return `<div class="pack-expanded" id="pack-${cartIndex}" hidden><h4>Selected Cards</h4><div class="mini-card-grid">${line.selectedCards.map((entry, subIndex) => {
    const cardId = typeof entry === "string" ? entry : entry.id;
    const qty = typeof entry === "string" ? 1 : Number(entry.qty || 1);
    const card = itemById(cardId);
    if (!card) return "";
    return `<div class="mini-card"><img src="${U.escape(card.image)}" onerror="this.src='../assets/placeholders/card-placeholder.svg'"><div><strong>${U.escape(card.name)}</strong><span>${qty}x</span><small>${U.escape(card.setName || "")}</small><button class="danger small-danger" onclick="removeCardFromPack(${cartIndex},${subIndex})">Remove Card</button></div></div>`;
  }).join("")}</div></div>`;
}
function renderCart() {
  const U = BCVUtils;
  const box = document.getElementById("cartList");
  box.innerHTML = BCVCart.items.length ? BCVCart.items.map((line, i) => {
    const item = itemById(line.id) || boosterById(line.id) || line;
    const name = item.name || line.name || line.id;
    let img = item.image || line.image || "../assets/placeholders/card-placeholder.svg";
    if (line.type === "custom-booster-pack" && !line.image && line.setName) img = "boosterpack/" + String(line.setName || "").replace(/[\\/:*?"<>|]/g, "").trim() + " Booster Pack.png";
    if (img && !/^https?:\/\//i.test(img) && !img.startsWith("../")) img = "../" + img;
    const hasPack = !!line.selectedCards?.length;
    const editBtn = line.type === "custom-booster-pack" ? `<a class="secondary" href="booster-builder.html?set=${encodeURIComponent(line.setName || "")}&edit=${i}">Edit Pack</a>` : "";
    const expandBtn = hasPack ? `<button class="secondary" onclick="togglePack(${i})">Expand Pack</button>` : "";
    const blockedReason = cartLineBlockedReason(line);
    return `<div class="cart-row cart-row-wide"><img src="${U.escape(img)}" onerror="this.src='${line.type && line.type.includes("booster") ? "../assets/placeholders/booster-placeholder.svg" : "../assets/placeholders/card-placeholder.svg"}'"><div><strong>${U.escape(name)}</strong><p>${U.escape(line.type)} • Qty ${line.qty || 1}</p>${cartPricingHtml(line, item)}${blockedReason ? `<div class="status-banner off"><strong>Print Unavailable:</strong> ${U.escape(blockedReason)}</div>` : `<span class="badge ok">Request Available</span>`}${hasPack ? `<p>${line.selectedCards.length} selected card entries</p>` : ""}<div class="row-actions">${expandBtn}${editBtn}<button class="danger" onclick="BCVCart.remove(${i})">Remove</button></div></div>${selectedCardRows(line, i)}</div>`;
  }).join("") : "<section class='empty'>Your cart is empty.</section>";
}
function togglePack(index){const el=document.getElementById("pack-"+index);if(el)el.hidden=!el.hidden}
function removeCardFromPack(cartIndex, subIndex){const line=BCVCart.items[cartIndex];if(!line?.selectedCards)return;line.selectedCards.splice(subIndex,1);BCVCart.save();renderCart()}

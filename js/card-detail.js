document.addEventListener("DOMContentLoaded", async () => {
  const wrap = document.getElementById("cardPage");
  await BCVData.load("../");
  const id = new URLSearchParams(location.search).get("id");
  const c = itemById(id) || BCVData.all[0];
  const U = BCVUtils;

  if (!c) {
    wrap.innerHTML = "<main class='page'><section class='empty'>Card not found.</section></main>";
    return;
  }

  const imgs = [c.image, c.backImage, c.altImage].filter(Boolean);
  const unavailableReason = printUnavailableReason(c);
  const action = c.source === "grade"
    ? (isBowOwner(c)
      ? (gradeSaleEnabled(c) ? `<button class="primary" onclick="addToCart('${U.escape(c.id)}','grade-buy')">Request to Buy</button>` : `<button disabled>Purchase Requests Off</button>`)
      : (transferEnabled(c) ? `<a class="secondary" href="ownership.html?id=${encodeURIComponent(c.id)}">Request Ownership Transfer</a>` : `<button disabled>Ownership Transfers Off</button>`))
    : (unavailableReason ? `<span class="badge no">Print Unavailable</span>` : `<button class="request-btn" onclick="addToCart('${U.escape(c.id)}','creator-print')">🖨️ Request Print Order</button>`);

  const disabledNotice = c.source === "creator" && BCVData.controls.global.printRequestsEnabled === false
    ? featureDisabledBannerHtml("print requests", "Print requests are currently turned off by Bow.")
    : c.source === "grade" && BCVData.controls.global.gradePurchaseRequestsEnabled === false && BCVData.controls.global.ownershipRequestsEnabled === false
      ? featureDisabledBannerHtml("Grade Vault requests", "Purchase and ownership transfer requests are currently turned off by Bow.")
      : c.source === "grade" && BCVData.controls.global.gradePurchaseRequestsEnabled === false
        ? featureDisabledBannerHtml("Grade Vault purchase requests", "Request-to-buy features are currently turned off by Bow.")
        : c.source === "grade" && BCVData.controls.global.ownershipRequestsEnabled === false
          ? featureDisabledBannerHtml("ownership transfer requests", "Ownership transfer requests are currently turned off by Bow.")
          : "";
  wrap.innerHTML = `<main class="page">${disabledNotice}
    <section class="detail">
      <div class="gallery">
        <img id="mainImg" class="main-img" src="${U.escape(imgs[0] || "../assets/placeholders/card-placeholder.svg")}">
        <div class="thumbs">${imgs.map(src => `<img src="${U.escape(src)}" onclick="document.getElementById('mainImg').src=this.src">`).join("")}</div>
      </div>
      <div class="info">
        <p class="eyebrow">${c.source === "grade" ? "Grade Vault" : "Creator Vault"}</p>
        <h1>${U.escape(c.name)}</h1>
        <div class="meta">
          <span class="badge ${c.source === "grade" ? "grade" : "creator"}">${c.source === "grade" ? "Grade Vault" : "Creator Vault"}</span>
          ${c.authStatus ? `<span class="badge auth">${U.escape(c.authStatus)}</span>` : ""}
          ${c.currentOwner ? `<span class="badge warn">Owner: ${U.escape(c.currentOwner)}</span>` : ""}
        </div>
        <div class="kv">
          <b>ID</b><span>${U.escape(c.id)}</span>
          <b>Set</b><span>${U.escape(c.setName)}</span>
          <b>Card Number</b><span>${U.escape(c.cardNumber)}</span>
          <b>Rarity</b><span>${U.escape(c.rarity)}</span>
          ${c.estimatedValue ? `<b>Estimated Value</b><span>${U.money(c.estimatedValue)}</span>` : ""}
          <b>Sale Price</b><span>${U.money(requestPrice(c))}</span>
          ${c.source === "grade" ? `
            <b>Grade</b><span>${U.escape(c.finalGrade || "Not listed")}</span>
            <b>Slab Cert</b><span>${U.escape(c.slabCert || "Not listed")}</span>
            <b>Current Owner</b><span>${U.escape(c.currentOwner || "Not listed")}</span>
          ` : `
            <b>Card Type</b><span>${U.escape(c.cardType || "")}</span>
            <b>Edition</b><span>${U.escape(c.edition || "")}</span>
          `}
        </div>
        <div class="history">
          ${unavailableReason ? `<h3>Print Request Unavailable</h3><p>${U.escape(unavailableReason)}</p>` : ""}
          ${c.source === "creator" ? `<h3>Print Cost Notice</h3><p>This card may be available as a custom print through Bow Card Vault. The listed amount is the print cost, not the sale price of an original graded card.</p>` : ""}
          ${c.rulesText ? `<h3>Rules Text</h3><p>${U.escape(c.rulesText)}</p>` : ""}
          ${c.flavorText ? `<h3>Flavor Text</h3><p>${U.escape(c.flavorText)}</p>` : ""}
          ${c.gradingNotes ? `<h3>Grading Notes</h3><p>${U.escape(c.gradingNotes)}</p>` : ""}
          ${c.ownerHistory?.length ? `<h3>Owner History</h3>${c.ownerHistory.map(h => `<p><b>${U.escape(h.owner)}</b> — ${U.escape(h.date)}<br>${U.escape(h.notes)}</p>`).join("")}` : ""}
        </div>
        <div class="links">
          ${action}
          <button class="secondary" onclick="shareItem('${U.escape(c.name)}','Check out this Bow Card Vault card','card.html?id=${encodeURIComponent(c.id)}')">Share</button>
          <button class="secondary" onclick="copyShareLink('card.html?id=${encodeURIComponent(c.id)}')">Copy Link</button>
          <a class="secondary" target="_blank" href="${facebookShareUrl('card.html?id=' + encodeURIComponent(c.id))}">Share on Facebook</a>
          ${c.source === "grade" && isBowOwner(c) && transferEnabled(c) ? `<a class="secondary" href="ownership.html?id=${encodeURIComponent(c.id)}">Ownership Transfer</a>` : ""}
          ${c.pricingUrl ? `<a href="${U.escape(c.pricingUrl)}" target="_blank">Pricing</a>` : ""}
        </div>
      </div>
    </section>
  </main>`;
});
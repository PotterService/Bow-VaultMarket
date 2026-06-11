window.BCVData = {
  creator: [],
  grade: [],
  boosters: [],
  unavailablePacks: [],
  unavailableBoxes: [],
  unavailablePrintCards: [],
  controls: {global:{}, emails:{}, cards:{}, boosters:{}},
  all: [],

  async load(prefix = "") {
    const cfg = BCV_CONFIG;

    const loadJson = async (live, local, cacheKey) => {
      const cacheMinutes = Number(cfg.cacheMinutes || 30);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.time < cacheMinutes * 60 * 1000 && Array.isArray(parsed.data)) return parsed.data;
        } catch (e) {}
      }
      try {
        const r = await fetch(live, { cache: "force-cache" });
        if (r.ok) {
          const data = await r.json();
          localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data }));
          return data;
        }
      } catch (e) {}
      try {
        const r = await fetch(prefix + local, { cache: "no-store" });
        if (r.ok) return await r.json();
      } catch (e) {}
      return [];
    };

    const loadLocal = async (path, fallback=[]) => {
      try {
        const r = await fetch(prefix + path, { cache: "no-store" });
        if (r.ok) return await r.json();
      } catch (e) {}
      return fallback;
    };

    const [creatorRows, gradeRows, boosterRows, unavailablePacks, unavailableBoxes, unavailablePrintCards, controls] = await Promise.all([
      loadJson(cfg.github.creatorCardsJson, cfg.local.creatorCardsJson, "bcv_creator_cache"),
      loadJson(cfg.github.gradeVaultJson, cfg.local.gradeVaultJson, "bcv_grade_cache"),
      loadLocal(cfg.local.boosterProductsJson, []),
      loadLocal(cfg.local.unavailableBoosterPacksJson, []),
      loadLocal(cfg.local.unavailableBoosterBoxesJson, []),
      loadLocal(cfg.local.unavailablePrintCardsJson, []),
      loadLocal(cfg.local.adminControlsJson, {global:{},emails:{},cards:{},boosters:{}})
    ]);

    this.controls = normalizeControls(controls);

    this.unavailablePacks = unavailablePacks.map(x => String(x).trim().toLowerCase());
    this.unavailableBoxes = unavailableBoxes.map(x => String(x).trim().toLowerCase());
    this.unavailablePrintCards = unavailablePrintCards.map(x => ({
      id: String(x.id || "").trim().toLowerCase(),
      cardName: String(x.cardName || x.name || "").trim().toLowerCase(),
      reason: String(x.reason || "This card is currently unavailable for print requests.").trim()
    }));

    this.creator = creatorRows.map(x => this.normCreator(x)).filter(x => x.name);
    this.grade = gradeRows.map(x => this.normGrade(x)).filter(x => x.name);
    this.all = [...this.creator, ...this.grade];

    const autoBoosters = buildBoostersFromSets(this.all);
    this.boosters = mergeBoosters(autoBoosters, boosterRows).map(p => ({
      ...p,
      ...((this.controls.boosters || {})[p.id] || {}),
      outOfStock: isProductOutOfStock({...p, ...((this.controls.boosters || {})[p.id] || {})})
    }));

    return this.all;
  },

  normCreator(row) {
    const U = BCVUtils, F = n => U.field(row, n);
    const img = U.text(F("frontImage") || F("frontImageUrl") || F("imageUrl") || F("image"));
    return {
      source: "creator",
      id: U.text(F("id")),
      name: U.text(F("cardName") || F("name")),
      category: U.text(F("category")) || "Creator Cards",
      setName: U.text(F("setName")) || "No Set",
      cardNumber: U.text(F("cardNumber")),
      rarity: U.text(F("rarity")),
      edition: U.text(F("edition")),
      status: U.text(F("status")),
      image: resolveImg(img, "creator"),
      backImage: resolveImg(U.text(F("backImage") || F("backImageUrl")), "creator"),
      altImage: resolveImg(U.text(F("altImage") || F("altImageUrl")), "creator"),
      cardType: U.text(F("cardType")),
      rulesText: U.text(F("rulesText")),
      flavorText: U.text(F("flavorText")),
      creatorNotes: U.text(F("creatorNotes")),
      printRun: U.text(F("printRun")),
      knownCopies: U.text(F("knownCopies")),
      currentOwner: U.text(F("currentOwner")),
      currentLocation: U.text(F("currentLocation")),
      estimatedValue: U.text(F("estimatedValue") || F("value")),
      requestPrice: U.text(F("requestPrice") || F("price")),
      dateAdded: U.text(F("dateAdded")),
      lastUpdated: U.text(F("lastUpdated")),
      search: Object.values(row).join(" ").toLowerCase(),
      raw: row
    };
  },

  normGrade(row) {
    const U = BCVUtils, F = n => U.field(row, n);
    const front = U.text(F("slabFrontImageUrl") || F("frontImageUrl") || F("frontImage") || F("imageUrl") || F("image"));
    return {
      source: "grade",
      id: U.text(F("id")),
      name: U.text(F("cardName") || F("name")),
      category: U.text(F("category")) || "Grade Vault",
      setName: U.text(F("setName")) || "No Set",
      cardNumber: U.text(F("cardNumber")),
      rarity: U.text(F("rarity")),
      year: U.text(F("year")),
      language: U.text(F("language")),
      image: resolveImg(front, "grade"),
      backImage: resolveImg(U.text(F("slabBackImageUrl") || F("backImageUrl")), "grade"),
      altImage: resolveImg(U.text(F("altImageUrl")), "grade"),
      finalGrade: U.text(F("finalGrade")),
      gradeConfidence: U.text(F("gradeConfidence")),
      gradingNotes: U.text(F("gradingNotes")),
      authStatus: U.text(F("authStatus")),
      isSlabbed: U.bool(F("isSlabbed")),
      slabbedBy: U.text(F("slabbedBy")),
      slabCert: U.text(F("slabCert")),
      slabDate: U.text(F("slabDate")),
      currentOwner: U.text(F("currentOwner")),
      currentLocation: U.text(F("currentLocation")),
      pricingUrl: U.text(F("pricingUrl")),
      officialInfoUrl: U.text(F("officialInfoUrl")),
      extraReferenceUrl: U.text(F("extraReferenceUrl")),
      estimatedValue: U.text(F("estimatedValue")),
      requestPrice: U.text(F("requestPrice") || F("price")),
      lastPriceChecked: U.text(F("lastPriceChecked")),
      ownerHistory: U.history(F("ownerHistory")),
      lastUpdated: U.text(F("lastUpdated")),
      search: Object.values(row).join(" ").toLowerCase(),
      raw: row
    };
  }
};

function normalizeControls(c){
  return {
    global:{
      cartRequestsEnabled: c?.global?.cartRequestsEnabled !== false,
      ownershipRequestsEnabled: c?.global?.ownershipRequestsEnabled !== false,
      printRequestsEnabled: c?.global?.printRequestsEnabled !== false,
      gradePurchaseRequestsEnabled: c?.global?.gradePurchaseRequestsEnabled !== false,
      boosterRequestsEnabled: c?.global?.boosterRequestsEnabled !== false,
      cartOffMessage: c?.global?.cartOffMessage || "",
      ownershipOffMessage: c?.global?.ownershipOffMessage || ""
    },
    emails:{
      defaultEmail: c?.emails?.defaultEmail || BCV_CONFIG.contactEmail || "",
      printRequestEmail: c?.emails?.printRequestEmail || "",
      ownershipRequestEmail: c?.emails?.ownershipRequestEmail || "",
      cartRequestEmail: c?.emails?.cartRequestEmail || ""
    },
    cards: c?.cards || {},
    boosters: c?.boosters || {},
    sets: c?.sets || {}
  };
}

function resolveImg(path, source) {
  path = String(path || "").trim();
  if (!path) return "../" + BCV_CONFIG.defaultCardImage;
  if (/^https?:\/\//i.test(path) || /^data:/i.test(path)) return path;
  if (path.startsWith("../")) return path;
  if (path.startsWith("images/") || path.startsWith("Images/") || path.startsWith("photos/") || path.startsWith("assets/")) {
    return source === "grade" ? BCV_CONFIG.github.gradeImageBase + path : BCV_CONFIG.github.creatorImageBase + path;
  }
  return source === "grade" ? BCV_CONFIG.github.gradeImageBase + "Images/" + path : BCV_CONFIG.github.creatorImageBase + "images/" + path;
}

function mergeBoosters(autoRows, manualRows){
  const map = new Map();
  autoRows.forEach(p => map.set(p.id, p));
  (manualRows || []).forEach(p => map.set(p.id, {...(map.get(p.id) || {}), ...p}));
  return [...map.values()];
}

function buildBoostersFromSets(cards) {
  const sets = [...new Set(cards.map(c => c.setName).filter(Boolean))].sort();
  return sets.flatMap(setName => [
    {
      id: "PACK-" + setName,
      name: setName + " Booster Pack",
      type: "booster-pack",
      setName,
      image: "boosterpack/" + safeFileName(setName) + " Booster Pack.png",
      estimatedValue: "",
      salePrice: "Contact for pricing",
      estimatedValue: "",
      salePrice: "Contact for pricing",
      price: "Contact for pricing",
      description: "Randomized booster pack or custom selected cards from this set.",
      available: true,
      autoGenerated: true
    },
    {
      id: "BOX-" + setName,
      name: setName + " Booster Box",
      type: "booster-box",
      setName,
      image: "boosterbox/" + safeFileName(setName) + " Booster Box.png",
      price: "Contact for pricing",
      description: "Request a booster box for this set.",
      available: true,
      autoGenerated: true
    }
  ]);
}

function isProductOutOfStock(p) {
  const name = String(p.name || "").trim().toLowerCase();
  if (p.available === false || String(p.available).toLowerCase() === "false" || p.outOfStock === true) return true;
  if (setBoostersAvailable(p.setName) === false) return true;
  if (p.type === "booster-pack") return BCVData.unavailablePacks.includes(name);
  if (p.type === "booster-box") return BCVData.unavailableBoxes.includes(name);
  return false;
}

function isBowOwner(card) {
  return String(card?.currentOwner || "").trim().toLowerCase() === "bow";
}

function itemById(id) {
  return BCVData.all.find(x => x.id === id);
}

function boosterById(id) {
  return BCVData.boosters.find(x => x.id === id);
}

function cardControl(card){
  return BCVData.controls.cards?.[card.id] || {};
}

function boosterControl(product){
  return BCVData.controls.boosters?.[product.id] || {};
}
function setControl(setName){
  return BCVData.controls.sets?.[setName] || {};
}
function setPrintEnabled(setName){
  const sc = setControl(setName);
  return sc.printEnabled !== false;
}
function setBoostersAvailable(setName){
  const sc = setControl(setName);
  return sc.boostersAvailable !== false;
}

function estimatedValueFor(card){
  const cc = cardControl(card);
  return cc.estimatedValue || card.estimatedValue || card.value || card.cardValue || "";
}
function salePriceFor(card){
  const cc = cardControl(card);
  return cc.salePrice || cc.requestPrice || card.salePrice || card.requestPrice || card.price || "";
}
function requestPrice(card){
  // Backward-compatible alias. New name is salePriceFor().
  return salePriceFor(card);
}

function gradeSaleEnabled(card){
  if(BCVData.controls.global.gradePurchaseRequestsEnabled === false) return false;
  const cc = cardControl(card);
  return cc.saleEnabled !== false;
}

function transferEnabled(card){
  if(BCVData.controls.global.ownershipRequestsEnabled === false) return false;
  const cc = cardControl(card);
  return cc.transferEnabled !== false;
}

function printEnabled(card){
  const cc = cardControl(card);
  // Card-specific "Allowed" is allowed to override old unavailable_print_cards.json entries.
  // Global and set-level OFF still win because those are bigger switches.
  if(BCVData.controls.global.printRequestsEnabled === false) return false;
  if(setPrintEnabled(card.setName) === false) return false;
  return cc.printEnabled !== false;
}
function printForceAllowed(card){
  const cc = cardControl(card);
  return cc.printEnabled === true;
}

function printUnavailableReason(card) {
  if (!card || card.source !== "creator") return "";
  if(!setPrintEnabled(card.setName)) return setControl(card.setName).reason || "Print requests are currently unavailable for this set.";
  if(!printEnabled(card)) return cardControl(card).reason || "Print requests are currently unavailable for this card.";

  // If admin specifically marks this card as allowed, ignore older unavailable list entries.
  if(printForceAllowed(card)) return "";

  const id = String(card.id || "").trim().toLowerCase();
  const name = String(card.name || "").trim().toLowerCase();
  const match = BCVData.unavailablePrintCards.find(x => (x.id && x.id === id) || (x.cardName && x.cardName === name));
  return match ? match.reason : "";
}

function valueAndPriceHtml(c){
  const U = BCVUtils;
  const valueRaw = estimatedValueFor(c);
  const saleRaw = salePriceFor(c);
  const value = U.money(valueRaw || "");
  const sale = U.money(saleRaw || "");
  const label = priceLabelFor(c);
  return `${valueRaw ? `<p class="value-line"><b>Estimated Value:</b> ${U.escape(value)}</p>` : `<p class="value-line"><b>Estimated Value:</b> Not listed</p>`}
  <p class="price-line"><b>${U.escape(label)}:</b> ${U.escape(sale || "Contact for pricing")}</p>`;
}

function cardActionHtml(c, prefix = "pages/") {
  const U = BCVUtils;
  if (c.source === "grade") {
    if (isBowOwner(c) && gradeSaleEnabled(c)) return `<button class="request-btn" onclick="addToCart('${U.escape(c.id)}','grade-buy')">🛒 Request Buy</button>`;
    if (!isBowOwner(c) && transferEnabled(c)) return `<a class="request-btn" href="${prefix}ownership.html?id=${encodeURIComponent(c.id)}">🔄 Request Ownership</a>`;
    if (isBowOwner(c) && transferEnabled(c)) return `<a class="request-btn" href="${prefix}ownership.html?id=${encodeURIComponent(c.id)}">🔄 Ownership Transfer</a>`;
    return `<button class="disabled-action" disabled>Requests Off</button>`;
  }
  const unavailableReason = printUnavailableReason(c);
  if (unavailableReason) return `<span class="badge no" title="${U.escape(unavailableReason)}">Print Unavailable</span>`;
  return `<button class="request-btn" onclick="addToCart('${U.escape(c.id)}','creator-print')">🖨️ Request Print Order</button>`;
}

function cardHtml(c, prefix = "pages/") {
  const U = BCVUtils;
  const imageFallback = prefix ? "../assets/placeholders/card-placeholder.svg" : "assets/placeholders/card-placeholder.svg";
  return `<article class="card">
    ${c.finalGrade ? `<div class="grade">Grade ${U.escape(c.finalGrade)}</div>` : ""}
    <img class="card-img" src="${U.escape(c.image)}" onerror="this.src='${imageFallback}'">
    <div class="card-body">
      <div class="meta">
        <span class="badge ${c.source === "grade" ? "grade" : "creator"}">${c.source === "grade" ? "Grade Vault" : "Creator Vault"}</span>
        ${c.authStatus ? `<span class="badge auth">${U.escape(c.authStatus)}</span>` : ""}
        ${c.source === "grade" && c.currentOwner ? `<span class="badge warn">Owner: ${U.escape(c.currentOwner)}</span>` : ""}
        ${printUnavailableReason(c) ? `<span class="badge out">Print Unavailable</span>` : ""}
      </div>
      <h3>${U.escape(c.name)}</h3>
      <p>${U.escape(c.setName || "")} ${c.cardNumber ? `• ${U.escape(c.cardNumber)}` : ""}</p>
      ${valueAndPriceHtml(c)}
      <div class="card-actions">
        <a class="view-btn" href="${prefix}card.html?id=${encodeURIComponent(c.id)}">👁️ View</a>
        <button class="secondary" onclick="shareItem('${U.escape(c.name)}','Check out this Bow Card Vault item','${prefix}card.html?id=${encodeURIComponent(c.id)}')">Share</button>
        ${cardActionHtml(c, prefix)}
      </div>
    </div>
  </article>`;
}


function boosterEstimatedValue(product){
  const bc = boosterControl(product);
  return bc.estimatedValue || product.estimatedValue || product.value || "";
}
function boosterSalePrice(product){
  const bc = boosterControl(product);
  return bc.salePrice || bc.requestPrice || product.salePrice || product.price || "Contact for pricing";
}


function featureDisabledBannerHtml(featureName, message){
  return `<section class="status-banner off">
    <strong>Bow has disabled ${BCVUtils.escape(featureName)} for this page.</strong>
    <p>${BCVUtils.escape(message || "This request feature is currently turned off by Bow. Please check back later or contact Bow for more details.")}</p>
  </section>`;
}

function insertFeatureBanner(targetSelector, featureName, message){
  const target = document.querySelector(targetSelector) || document.querySelector("main.page");
  if(!target) return;
  const banner = document.createElement("section");
  banner.innerHTML = featureDisabledBannerHtml(featureName, message);
  const node = banner.firstElementChild;
  node.id = "feature-disabled-banner";
  target.insertAdjacentElement("afterbegin", node);
}

function removeActionsForDisabledFeature(selector){
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = "none";
  });
}


function shareUrlFor(path){
  try { return new URL(path, window.location.href).href; }
  catch(e){ return window.location.href; }
}

async function shareItem(title, text, url){
  const finalUrl = shareUrlFor(url || window.location.href);
  if(navigator.share){
    try{
      await navigator.share({title, text, url: finalUrl});
      return;
    }catch(e){}
  }
  const shareText = `${title}\n${text || ""}\n${finalUrl}`;
  try{
    await navigator.clipboard.writeText(shareText);
    BCVUtils.toast("Share link copied");
  }catch(e){
    prompt("Copy this share link:", finalUrl);
  }
}

function facebookShareUrl(url){
  return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(shareUrlFor(url));
}

function boosterInfoUrl(product, prefix=""){
  return `${prefix}booster.html?id=${encodeURIComponent(product.id)}`;
}

function boosterStatus(product){
  return (product.outOfStock || String(product.available).toLowerCase()==="false") ? "Out of Stock" : "Available";
}


async function copyShareLink(url){
  const finalUrl = shareUrlFor(url || window.location.href);
  try{
    await navigator.clipboard.writeText(finalUrl);
    BCVUtils.toast("Link copied");
  }catch(e){
    prompt("Copy this link:", finalUrl);
  }
}

function priceLabelFor(item){
  return item && item.source === "creator" ? "Print Cost" : "Sale Price";
}

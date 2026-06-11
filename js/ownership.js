document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const incomingId = params.get("id") || params.get("card") || params.get("cardId") || params.get("slab") || params.get("slabCert") || "";
  const cardInput = document.getElementById("cardId");
  if (incomingId && cardInput) cardInput.value = incomingId;
  try {
    await BCVData.load("../");
    const card = itemById(incomingId);
    const panel = document.querySelector(".panel h1");
    if (card && panel) panel.insertAdjacentHTML("afterend", `<p><strong>Selected item:</strong> ${BCVUtils.escape(card.name)}<br><strong>ID:</strong> ${BCVUtils.escape(card.id)}</p>`);
  } catch (e) {}
  if(BCVData.controls.global.ownershipRequestsEnabled === false){
    const p=document.querySelector(".notice");
    if(p){p.className="status-banner off";p.innerHTML="<strong>Bow has disabled ownership transfer request features for this page.</strong><p>"+BCVUtils.escape(BCVData.controls.global.ownershipOffMessage||"Ownership transfer requests are currently turned off by Bow.")+"</p>";}
    document.querySelectorAll("#ownershipForm input,#ownershipForm select,#ownershipForm textarea,#ownershipForm button").forEach(x=>x.disabled=true);
  } else {
    const p=document.querySelector(".notice");
    if(p){p.className="status-banner";p.innerHTML="<strong>Ownership Requests On:</strong> Ownership transfer requests are currently available.<br><br><strong>Tip:</strong> It may be faster if the previous owner submits the transfer request from their own email.";}
  }
  document.getElementById("ownershipForm").addEventListener("submit", e => {
    e.preventDefault();
    if(BCVData.controls.global.ownershipRequestsEnabled === false){
      alert(BCVData.controls.global.ownershipOffMessage || "Ownership transfer requests are currently turned off.");
      return;
    }
    const body = [
      "Bow Card Vault Ownership Transfer Request", "",
      "IMPORTANT ATTACHMENTS:",
      "- Please attach receipt, letter of sale, proof of purchase, or transfer message.",
      "- Please attach a clear photo of the card/slab/item.", "",
      "TRANSFER DETAILS",
      "Card / Slab ID: " + document.getElementById("cardId").value,
      "New Owner: " + document.getElementById("newOwner").value,
      "New Email: " + document.getElementById("newEmail").value,
      "How it was obtained: " + document.getElementById("method").value, "",
      "PIN DETAILS",
      "Transfer PIN: " + document.getElementById("transferPin").value,
      "New Transfer PIN: " + document.getElementById("newTransferPin").value, "",
      "NOTES",
      document.getElementById("notes").value || "No notes provided.", "",
      "Verification notice:",
      "Bow Card Vault may contact the previous owner to verify the transfer. If confirmation is not received, the request may remain pending or be rejected."
    ].join("\n");
    location.href = `mailto:${ownershipEmail()}?subject=Bow Card Vault Ownership Transfer Request&body=${encodeURIComponent(body)}`;
  });
});
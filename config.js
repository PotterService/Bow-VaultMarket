window.BCV_CONFIG = {
  siteName: "Bow Card Vault",
  version: "Full Rebuild v11 Card Share Print Cost",
  contactEmail: "barwick2012+card@gmail.com",

  // Live vault sources. These auto-pull the card information.
  github: {
    creatorCardsJson: "https://raw.githubusercontent.com/PotterService/magic-scripts/main/BowCreatorVault/creator-cards.json",
    gradeVaultJson: "https://raw.githubusercontent.com/PotterService/magic-scripts/main/BowGradeVault_PublicRegistry_PRO/public-cards.json",
    creatorImageBase: "https://raw.githubusercontent.com/PotterService/magic-scripts/main/BowCreatorVault/",
    gradeImageBase: "https://raw.githubusercontent.com/PotterService/magic-scripts/main/BowGradeVault_PublicRegistry_PRO/"
  },

  // Local fallback files. These are used if live sources cannot load.
  local: {
    creatorCardsJson: "data/creator-cards.local.json",
    gradeVaultJson: "data/public-cards.local.json",
    boosterProductsJson: "data/booster-products.json",
    unavailablePrintCardsJson: "data/unavailable_print_cards.json",
    unavailableBoosterPacksJson: "data/unavailable_booster_packs.json",
    unavailableBoosterBoxesJson: "data/unavailable_booster_boxes.json",
    adminControlsJson: "data/market_controls.json"
  },

  cartKey: "bow_card_vault_cart",
  cacheMinutes: 30,
  maxBoosterPackCards: 15,
  defaultCardImage: "assets/placeholders/card-placeholder.svg",
  defaultBoosterImage: "assets/placeholders/booster-placeholder.svg"
};
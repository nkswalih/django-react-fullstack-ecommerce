export const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const CATEGORY_ALIASES = {
  smartphone: ["smartphone", "smartphones", "phone", "phones", "mobile", "mobiles"],
  laptop: ["laptop", "laptops", "macbook", "notebook", "notebooks"],
  audio: ["audio", "earbud", "earbuds", "headphone", "headphones", "speaker", "speakers"],
  accessory: ["accessory", "accessories", "accesssoires", "gadget", "gadgets"],
  tablet: ["tablet", "tablets", "ipad", "ipads"],
  watch: ["watch", "watches", "smartwatch", "smartwatches"],
};

const CATEGORY_NAMES = {
  smartphone: "Smartphone",
  laptop: "Laptop",
  audio: "Audio",
  accessory: "Accessory",
  tablet: "Tablet",
  watch: "Watch",
};

export const getCategoryKey = (value) => {
  const normalized = normalizeText(value);

  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => normalizeText(alias) === normalized)) {
      return key;
    }
  }

  return normalized || "all";
};

export const getCategoryName = (value) => CATEGORY_NAMES[getCategoryKey(value)] || value;

export const isCategoryMatch = (productCategory, selectedCategory) => {
  if (!selectedCategory || selectedCategory === "all") {
    return true;
  }

  return getCategoryKey(productCategory) === getCategoryKey(selectedCategory);
};

export const isBrandMatch = (productBrand, selectedBrand) =>
  normalizeText(productBrand) === normalizeText(selectedBrand);

export const getProductsFromResponse = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  return [];
};

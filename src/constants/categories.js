/**
 * Normalized category values.
 *
 * The `value` is what gets stored in Firestore and sent to the backend.
 * The `labelKey` is the i18n key for the display label.
 *
 * IMPORTANT: These values MUST match the backend ALLOWED_CATEGORIES
 * whitelist in product.service.js. All values are lowercase and use
 * hyphens for multi-word categories.
 */
export const CATEGORIES = [
  { value: "vegetables", labelKey: "products.categories.vegetables" },
  { value: "fruits", labelKey: "products.categories.fruits" },
  { value: "grains", labelKey: "products.categories.grains" },
  { value: "root-crops", labelKey: "products.categories.rootCrops" },
  { value: "herbs", labelKey: "products.categories.herbs" },
  { value: "livestocks", labelKey: "products.categories.livestock" },
  { value: "poultry", labelKey: "products.categories.poultry" },
  { value: "meats", labelKey: "products.categories.meat" },
  { value: "seafoods", labelKey: "products.categories.seafood" },
];

/**
 * Just the category values as a flat array (for admin filters, etc.)
 */
export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);

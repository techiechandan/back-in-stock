
/**
 * Builds a Shopify product URL given the base URL, product handle, and variant ID.
 *
 * If any of the parameters are not provided, an empty string is returned.
 *
 * @param {string} baseURL - Base URL of the Shopify store.
 * @param {string} handle - Product handle.
 * @param {string|number} variantId - Product variant ID.
 * @returns {string} The constructed URL.
 */
export function buildUrl(baseURL:string, handle:string, variantId: string|number) {
  if(!baseURL || !handle || !variantId) return '';

  const url = `${baseURL}/products/${handle}?variant=${variantId}`;
  return url;
};
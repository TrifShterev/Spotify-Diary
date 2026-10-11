// A fixed locale keeps the wording consistent with the rest of the (English) UI.
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const numberFormat = new Intl.NumberFormat('en');

/** "BG" → "Bulgaria". Falls back to the raw code when it is not a known region. */
export function formatCountry(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "premium" → "Premium". */
export function formatPlan(product: string): string {
  return product.charAt(0).toUpperCase() + product.slice(1);
}

/** 12345 → "12,345 followers". */
export function formatFollowers(count: number): string {
  return `${numberFormat.format(count)} ${count === 1 ? 'follower' : 'followers'}`;
}

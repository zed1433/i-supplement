export const IHERB_RCODE = "NBO7379";

/** Country stores that keep the visitor on one host, so iHerb does not bounce and drop rcode. */
const IHERB_HOSTS = new Set([
  "ae", "ar", "at", "au", "be", "br", "ca", "ch", "cl", "co", "cz", "de", "dk", "ee", "eg", "es", "fi", "fr",
  "gr", "hk", "hr", "hu", "id", "ie", "il", "in", "it", "jp", "kr", "kw", "lt", "lv", "mx", "my", "nl", "no",
  "nz", "ph", "pl", "pt", "qa", "ro", "sa", "se", "sg", "si", "sk", "th", "tr", "tw", "ua", "uk", "vn", "za",
]);

export function iherbHost(country?: string): string {
  const cc = (country ?? "").trim().toLowerCase();
  if (!cc || cc === "us") return "www.iherb.com";
  if (cc === "gb") return "uk.iherb.com";
  return IHERB_HOSTS.has(cc) ? `${cc}.iherb.com` : "www.iherb.com";
}

/** Product URL on the shopper's iHerb store, always with the rewards code. */
export function withIherbReferral(target: string, country?: string): string {
  const url = new URL(target);
  url.protocol = "https:";
  url.hostname = iherbHost(country);
  url.searchParams.set("rcode", IHERB_RCODE);
  return url.toString();
}

/** Best country we can see in the browser. Greece is explicit because the store is Athens-based. */
export function shopperCountry(fallback?: string): string | undefined {
  if (typeof navigator === "undefined") return fallback;
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const region = tag.split("-")[1];
    if (region && /^[A-Za-z]{2}$/.test(region)) return region.toUpperCase();
  }
  try {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Europe/Athens") return "GR";
  } catch {
    /* timezone unavailable */
  }
  return fallback;
}

const ID_KEY = "trustreview_anon_id";
const SINCE_KEY = "trustreview_anon_since";

/**
 * Persists a per-browser anonymous reviewer identity and its first-seen
 * timestamp. The backend uses the age of this identity for the
 * NEW_ACCOUNT risk signal (F8) since customers review anonymously (F6).
 */
export function getAnonIdentity(): { anonId: string; anonSince: number } {
  if (typeof window === "undefined") {
    return { anonId: "anon_ssr", anonSince: Date.now() };
  }

  let anonId = window.localStorage.getItem(ID_KEY);
  let anonSince = window.localStorage.getItem(SINCE_KEY);

  if (!anonId || !anonSince) {
    anonId = `anon_${crypto.randomUUID().slice(0, 8)}`;
    anonSince = String(Date.now());
    window.localStorage.setItem(ID_KEY, anonId);
    window.localStorage.setItem(SINCE_KEY, anonSince);
  }

  return { anonId, anonSince: Number(anonSince) };
}

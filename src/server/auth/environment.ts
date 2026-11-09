export function readAuthEnvironment(env: Record<string, string | undefined>) {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("replace-")) throw new Error("BETTER_AUTH_SECRET must contain at least 32 random characters.");
  let url: URL;
  try { url = new URL(env.BETTER_AUTH_URL ?? ""); }
  catch { throw new Error("BETTER_AUTH_URL must be an explicit HTTP(S) origin."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (env.NODE_ENV === "production" && url.protocol !== "https:")) {
    throw new Error("BETTER_AUTH_URL must be an HTTP(S) origin; production requires HTTPS.");
  }
  return { secret, baseURL: url.origin, secureCookies: url.protocol === "https:" };
}

/** Browser uses NEXT_PUBLIC_API_URL; server (NextAuth, RSC) prefers API_URL (e.g. http://api:4000 in Docker). */
export function getApiBaseUrl(): string {
  const fallback = "http://localhost:4000";
  const isServer = typeof window === "undefined";

  if (isServer) {
    return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? fallback;
  }

  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? fallback;
}

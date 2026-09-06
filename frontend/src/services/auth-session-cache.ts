import { getAccessTokenExpiry } from "@/lib/jwt-utils";
import { getSession } from "next-auth/react";

type CachedAuth = {
  accessToken: string | null;
  error?: "RefreshAccessTokenError";
  expiresAt: number;
};

/** Refresh slightly before JWT expiry so requests don't use a stale token. */
const EXPIRY_BUFFER_MS = 60_000;

let cache: CachedAuth | null = null;
let inflight: Promise<CachedAuth> | null = null;

function fromSession(
  session: Awaited<ReturnType<typeof getSession>>,
): CachedAuth {
  const accessToken = session?.accessToken ?? null;

  return {
    accessToken,
    error: session?.error,
    expiresAt: accessToken
      ? getAccessTokenExpiry(accessToken)
      : Date.now(),
  };
}

function isCacheValid(entry: CachedAuth): boolean {
  if (entry.error) {
    return false;
  }

  return Date.now() < entry.expiresAt - EXPIRY_BUFFER_MS;
}

export function clearAuthCache() {
  cache = null;
  inflight = null;
}

export async function resolveAuthSession(): Promise<CachedAuth> {
  if (cache && isCacheValid(cache)) {
    return cache;
  }

  if (inflight) {
    return inflight;
  }

  inflight = getSession()
    .then((session) => {
      cache = fromSession(session);
      return cache;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Force a fresh session read (e.g. after 401). */
export async function refreshAuthSession(): Promise<CachedAuth> {
  clearAuthCache();
  return resolveAuthSession();
}

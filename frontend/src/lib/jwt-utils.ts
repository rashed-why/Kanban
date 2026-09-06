/** Decode JWT `exp` claim into milliseconds (no external dependency). */
export function getAccessTokenExpiry(accessToken: string): number {
  const base64Url = accessToken.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload =
    typeof Buffer !== "undefined"
      ? Buffer.from(base64, "base64").toString("utf-8")
      : decodeURIComponent(
          atob(base64)
            .split("")
            .map(
              (char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`,
            )
            .join(""),
        );

  const payload = JSON.parse(jsonPayload) as { exp: number };

  return payload.exp * 1000;
}

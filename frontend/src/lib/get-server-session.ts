import { getServerSession as getNextAuthSession } from "next-auth";
import { authOptions } from "@/lib/nextauth.config";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type MeResponse = {
  id: string;
  name: string;
  email: string;
};

export async function getServerSession(): Promise<CurrentUser | null> {
  const session = await getNextAuthSession(authOptions);

  if (!session?.user?.id || session.error || !session.accessToken) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      id: session.user.id,
      name: session.user.name ?? "",
      email: session.user.email ?? "",
    };
  }

  const user = (await response.json()) as MeResponse;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

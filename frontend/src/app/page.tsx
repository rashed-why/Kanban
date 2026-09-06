import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";

export default async function Home() {
  const user = await getServerSession();

  if (user) {
    redirect("/boards");
  }

  redirect("/auth/login");
}

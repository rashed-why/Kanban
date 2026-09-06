import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageView } from "@/components/dashboard/dashboard-page-view";
import { getServerSession } from "@/lib/get-server-session";

export const metadata: Metadata = {
  title: "Boards",
  description: "Your Kanban boards",
};

export default async function BoardsPage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardPageView userName={user.name} />;
}
